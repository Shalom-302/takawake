"""
Étape 2 — Graphe de dépendances.

À partir de output/analysis.json, résout les imports internes (`app.*`) en arêtes
entre fichiers, puis agrège les relations au niveau des couches
(Router→Service→CRUD→Model, Schema→Model, ...).

Sorties :
  output/dependency_graph.json   (nodes, edges, layer_edges)
  output/dependency_graph.md     (tables + diagramme mermaid des couches)

Usage : python codemap/scripts/dependency_graph.py
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from typing import Dict, List, Optional, Set, Tuple

import common as C


def load_analysis() -> dict:
    p = C.OUTPUT_DIR / "analysis.json"
    return json.loads(p.read_text(encoding="utf-8"))


def build_module_index(files: List[dict]) -> Dict[str, dict]:
    """module dotté -> record fichier."""
    return {f["dotted"]: f for f in files if "dotted" in f}


def resolve_import(mod: str, names: List[str], index: Dict[str, dict]) -> List[str]:
    """
    Résout un import en une liste de modules dottés internes existants.
    - import direct du module : 'app.crud.crud_article' présent dans l'index.
    - import d'un sous-module via package : 'from app.crud import crud_article'
      -> 'app.crud.crud_article'.
    """
    if not mod or not mod.startswith("app"):
        return []
    hits: List[str] = []
    if mod in index:
        hits.append(mod)
    # from <pkg> import <submodule>
    for n in names:
        cand = f"{mod}.{n}"
        if cand in index:
            hits.append(cand)
    return hits


def main() -> None:
    C.ensure_output_dir()
    data = load_analysis()
    files = [f for f in data["files"] if not f.get("error")]
    index = build_module_index(files)

    nodes: List[dict] = []
    edges: List[dict] = []
    # arêtes uniques (src_dotted, dst_dotted)
    seen_edges: Set[Tuple[str, str]] = set()
    # comptage des relations de couche
    layer_edge_counts: Counter = Counter()
    # fan-in / fan-out
    out_deg: Counter = Counter()
    in_deg: Counter = Counter()

    layer_of: Dict[str, str] = {f["dotted"]: f["layer"] for f in files}
    module_of: Dict[str, str] = {f["dotted"]: f["module"] for f in files}

    for f in files:
        src = f["dotted"]
        nodes.append({
            "id": src,
            "path": f["path"],
            "module": f["module"],
            "layer": f["layer"],
            "loc": f.get("loc", 0),
            "n_classes": len(f.get("classes", [])),
            "n_functions": len(f.get("functions", [])),
        })
        for imp in f.get("imports", []):
            targets = resolve_import(imp.get("module", ""), imp.get("names", []), index)
            for dst in targets:
                if dst == src:
                    continue
                if (src, dst) in seen_edges:
                    continue
                seen_edges.add((src, dst))
                edges.append({
                    "source": src,
                    "target": dst,
                    "source_layer": layer_of.get(src, "?"),
                    "target_layer": layer_of.get(dst, "?"),
                })
                out_deg[src] += 1
                in_deg[dst] += 1
                sl, tl = layer_of.get(src, "?"), layer_of.get(dst, "?")
                if sl != tl:
                    layer_edge_counts[(sl, tl)] += 1

    graph = {
        "node_count": len(nodes),
        "edge_count": len(edges),
        "nodes": nodes,
        "edges": edges,
        "layer_edges": [
            {"source": s, "target": t, "count": c}
            for (s, t), c in layer_edge_counts.most_common()
        ],
    }
    out_json = C.OUTPUT_DIR / "dependency_graph.json"
    out_json.write_text(json.dumps(graph, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[dependency_graph] {len(nodes)} nœuds, {len(edges)} arêtes -> {out_json}")

    # --- Markdown ---
    lines: List[str] = []
    lines.append("# Graphe de dépendances — backend kaapi\n")
    lines.append("> Généré par `codemap/scripts/dependency_graph.py` (étape 2). "
                 "Arêtes = imports internes `app.*` résolus.\n")
    lines.append(f"- Nœuds (fichiers) : **{len(nodes)}**")
    lines.append(f"- Arêtes (imports internes) : **{len(edges)}**\n")

    lines.append("## Flux entre couches\n")
    lines.append("Nombre d'imports d'une couche vers une autre (relations métier "
                 "typiques : api→service→crud→model, schema→model).\n")
    lines.append("| Couche source | → | Couche cible | # imports |")
    lines.append("|---------------|---|--------------|----------:|")
    for e in graph["layer_edges"]:
        lines.append(f"| {e['source']} | → | {e['target']} | {e['count']} |")
    lines.append("")

    # Diagramme mermaid agrégé (couches métier principales seulement, pour lisibilité)
    lines.append("## Diagramme (couches principales)\n")
    lines.append("```mermaid")
    lines.append("graph LR")
    main_layers = {"entrypoint", "api", "service", "crud", "model", "schema", "task", "core"}
    drawn: Set[Tuple[str, str]] = set()
    for e in graph["layer_edges"]:
        s, t = e["source"], e["target"]
        if s in main_layers and t in main_layers and (s, t) not in drawn:
            drawn.add((s, t))
            lines.append(f"  {s}[{s}] -->|{e['count']}| {t}[{t}]")
    lines.append("```")
    lines.append("")

    # Top modules les plus dépendants / dépendus
    lines.append("## Fichiers les plus importés (fan-in top 25)\n")
    lines.append("| Fichier | Couche | Importé par |")
    lines.append("|---------|--------|------------:|")
    path_of = {f["dotted"]: f["path"] for f in files}
    for dotted, deg in in_deg.most_common(25):
        lines.append(f"| `{path_of.get(dotted, dotted)}` | {layer_of.get(dotted,'?')} | {deg} |")
    lines.append("")

    lines.append("## Fichiers aux dépendances les plus nombreuses (fan-out top 25)\n")
    lines.append("| Fichier | Couche | Dépend de |")
    lines.append("|---------|--------|----------:|")
    for dotted, deg in out_deg.most_common(25):
        lines.append(f"| `{path_of.get(dotted, dotted)}` | {layer_of.get(dotted,'?')} | {deg} |")
    lines.append("")

    out_md = C.OUTPUT_DIR / "dependency_graph.md"
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(f"[dependency_graph] écrit {out_md}")


if __name__ == "__main__":
    main()

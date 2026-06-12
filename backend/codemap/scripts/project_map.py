"""
Étape 3 — Cartographie d'architecture (PROJECT_MAP.md).

Document lisible par un agent IA : couches, responsabilités, modules, points
d'entrée API (endpoints), services principaux, flux métier, dépendances.

Entrées  : output/analysis.json, output/dependency_graph.json
Sortie   : output/PROJECT_MAP.md

Usage : python codemap/scripts/project_map.py
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from typing import Dict, List

import common as C

LAYER_DESC = {
    "entrypoint": "Bootstrap FastAPI : montage de l'app, middlewares, chargement des plugins, WebSocket, métriques.",
    "api": "Points d'entrée HTTP (routers FastAPI). Valident l'I/O via les schémas, délèguent aux services/CRUD.",
    "service": "Logique métier réutilisable (embeddings, Qdrant, clustering, LLM, paiement, sécurité...).",
    "crud": "Accès aux données : opérations Create/Read/Update/Delete sur les modèles SQLAlchemy.",
    "model": "Entités persistées (SQLAlchemy ORM). Base de la pyramide de dépendances.",
    "schema": "Contrats d'I/O (Pydantic) : validation requêtes/réponses, sérialisation.",
    "core": "Transverse : configuration, session DB, Celery, sécurité, rate-limiting, utilitaires.",
    "task": "Jobs asynchrones Celery (traitements longs, planifiés).",
    "command": "Commandes CLI / scripts d'initialisation (auth, storage, migrations).",
    "util": "Fonctions utilitaires spécifiques à un module/plugin.",
    "plugin": "Code d'un plugin non rattaché à une sous-couche standard (manifest, manager, glue).",
    "test": "Tests automatisés.",
    "other": "Divers (i18n, ressources).",
}

LAYER_ORDER = ["entrypoint", "api", "service", "crud", "model", "schema",
               "task", "core", "command", "util", "plugin", "test", "other"]


def main() -> None:
    C.ensure_output_dir()
    analysis = json.loads((C.OUTPUT_DIR / "analysis.json").read_text(encoding="utf-8"))
    graph = json.loads((C.OUTPUT_DIR / "dependency_graph.json").read_text(encoding="utf-8"))
    files = [f for f in analysis["files"] if not f.get("error")]

    # Indexes
    by_layer: Dict[str, List[dict]] = defaultdict(list)
    by_module: Dict[str, List[dict]] = defaultdict(list)
    for f in files:
        by_layer[f["layer"]].append(f)
        by_module[f["module"]].append(f)

    in_deg: Counter = Counter()
    for e in graph["edges"]:
        in_deg[e["target"]] += 1
    path_of = {f["dotted"]: f["path"] for f in files}
    layer_of = {f["dotted"]: f["layer"] for f in files}

    # Endpoints
    endpoints: List[dict] = []
    for f in files:
        for fn in f["functions"]:
            if fn["route"]:
                endpoints.append({"file": f["path"], "module": f["module"],
                                  "symbol": fn["name"], **fn["route"]})
        for c in f["classes"]:
            for m in c["methods"]:
                if m["route"]:
                    endpoints.append({"file": f["path"], "module": f["module"],
                                      "symbol": f"{c['name']}.{m['name']}", **m["route"]})

    lines: List[str] = []
    lines.append("# PROJECT_MAP — backend kaapi\n")
    lines.append("> Carte d'architecture générée automatiquement par `codemap` "
                 "(étape 3). Destinée à donner à un agent IA une compréhension "
                 "rapide du backend sans rescanner tout le dépôt.\n")

    # Vue d'ensemble
    total_loc = sum(f.get("loc", 0) for f in files)
    n_classes = sum(len(f["classes"]) for f in files)
    n_methods = sum(len(c["methods"]) for f in files for c in f["classes"])
    n_funcs = sum(len(f["functions"]) for f in files)
    lines.append("## Vue d'ensemble\n")
    lines.append(f"- **{len(files)}** fichiers Python · **{total_loc}** LOC")
    lines.append(f"- **{n_classes}** classes · **{n_methods}** méthodes · **{n_funcs}** fonctions")
    lines.append(f"- **{len(endpoints)}** endpoints HTTP")
    lines.append(f"- **{len([m for m in by_module if m not in ('core','routers','services','crud','models','schemas','tasks','commands','app','api','entrypoint','lang')])}** plugins métier\n")
    lines.append("Stack : **FastAPI** (HTTP) · **SQLAlchemy** (ORM) · **Celery/Redis** "
                 "(tâches async) · **Qdrant** + **sentence-transformers** (recherche "
                 "vectorielle) · architecture **modulaire à plugins**.\n")

    # Couches
    lines.append("## Couches architecturales\n")
    for layer in LAYER_ORDER:
        fls = by_layer.get(layer)
        if not fls:
            continue
        loc = sum(f.get("loc", 0) for f in fls)
        lines.append(f"### `{layer}` — {len(fls)} fichiers, {loc} LOC\n")
        lines.append(LAYER_DESC.get(layer, ""))
        lines.append("")

    # Couches transverse : modules core
    lines.append("## Modules core (transverses)\n")
    lines.append("| Fichier | Rôle (docstring) |")
    lines.append("|---------|------------------|")
    for f in sorted(by_module.get("core", []) + by_module.get("app", []), key=lambda x: x["path"]):
        doc = (f.get("docstring") or "").strip().splitlines()
        summary = doc[0] if doc else ""
        lines.append(f"| `{f['path']}` | {summary[:120]} |")
    lines.append("")

    # Points d'entrée
    lines.append("## Points d'entrée\n")
    for f in by_layer.get("entrypoint", []):
        doc = (f.get("docstring") or "").strip().splitlines()
        lines.append(f"- `{f['path']}` — {doc[0] if doc else ''}")
    lines.append("")

    # Plugins métier
    plugin_modules = sorted(
        m for m in by_module
        if m not in ("core", "routers", "services", "crud", "models", "schemas",
                     "tasks", "commands", "app", "api", "entrypoint", "lang", "plugins")
    )
    lines.append("## Plugins métier\n")
    lines.append("Chaque plugin réplique une mini-architecture (routes / models / "
                 "services / schemas / utils) et s'enregistre auprès de l'app via son `*_router`.\n")
    lines.append("| Plugin | Fichiers | Couches présentes |")
    lines.append("|--------|---------:|-------------------|")
    for m in plugin_modules:
        fls = by_module[m]
        layers = ", ".join(sorted({f["layer"] for f in fls}))
        lines.append(f"| **{m}** | {len(fls)} | {layers} |")
    lines.append("")

    # Services principaux (core services + composants service les plus importés)
    lines.append("## Services principaux\n")
    lines.append("| Service | Couche | Importé par | Rôle |")
    lines.append("|---------|--------|------------:|------|")
    svc = [f for f in files if f["layer"] == "service"]
    svc.sort(key=lambda f: in_deg[f["dotted"]], reverse=True)
    for f in svc[:25]:
        doc = (f.get("docstring") or "").strip().splitlines()
        summary = doc[0] if doc else ""
        lines.append(f"| `{f['path']}` | {f['module']} | {in_deg[f['dotted']]} | {summary[:90]} |")
    lines.append("")

    # Endpoints par module
    lines.append("## Endpoints API (par module)\n")
    ep_by_module: Dict[str, List[dict]] = defaultdict(list)
    for ep in endpoints:
        ep_by_module[ep["module"]].append(ep)
    for module in sorted(ep_by_module):
        eps = ep_by_module[module]
        lines.append(f"<details><summary><b>{module}</b> — {len(eps)} endpoints</summary>\n")
        for ep in sorted(eps, key=lambda e: (e["path"], e["method"])):
            lines.append(f"- `{ep['method']:6} {ep['path']}` → `{ep['symbol']}` ({ep['file']})")
        lines.append("\n</details>\n")

    # Flux métier (déduit du graphe de couches)
    lines.append("## Flux métier (déduits du graphe de dépendances)\n")
    lines.append("Relations de couche les plus fréquentes (cf. `dependency_graph.md`) :\n")
    lines.append("```")
    lines.append("Client HTTP → Router (api) → Service → CRUD → Model → DB")
    lines.append("                  │              │")
    lines.append("               Schema         Core (config, db, sécurité)")
    lines.append("Celery beat/worker → Task → Service/CRUD → Model")
    lines.append("```")
    lines.append("")
    lines.append("| Relation | # imports |")
    lines.append("|----------|----------:|")
    for e in graph["layer_edges"][:15]:
        lines.append(f"| {e['source']} → {e['target']} | {e['count']} |")
    lines.append("")

    out_md = C.OUTPUT_DIR / "PROJECT_MAP.md"
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(f"[project_map] écrit {out_md} ({len(endpoints)} endpoints, {len(plugin_modules)} plugins)")


if __name__ == "__main__":
    main()

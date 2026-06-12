"""
Étapes 4 & 5 — Chunking intelligent + enrichissement sémantique.

Découpe le code par SYMBOLE (jamais par taille arbitraire) :
  - module    : 1 chunk par fichier (docstring + inventaire classes/fonctions)
  - class     : 1 chunk par classe (signature + docstring + signatures méthodes)
  - method    : 1 chunk par méthode (source exact)
  - function  : 1 chunk par fonction top-level (source exact)
  - endpoint  : fonction/méthode portant une route HTTP (type spécialisé)

Chaque chunk conserve son contexte et embarque le bloc sémantique normalisé :
  File / Module / Layer / Type / Symbol / Route / Dependencies / Purpose / Code

Entrée  : output/analysis.json
Sortie  : output/chunks.jsonl  (1 chunk JSON par ligne)

Usage : python codemap/scripts/chunk.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import common as C

_MAX_CODE_CHARS = 6000  # le modèle e5 ne voit que ~512 tokens ; tronquage défensif
_PREVIEW_CHARS = 300

KIND_LABEL = {
    "module": "Module",
    "class": "Classe",
    "method": "Méthode",
    "function": "Fonction",
    "endpoint": "Endpoint",
}

LAYER_ROLE = {
    "api": "expose un point d'entrée HTTP",
    "service": "porte de la logique métier réutilisable",
    "crud": "réalise un accès aux données (CRUD)",
    "model": "définit une entité persistée (ORM)",
    "schema": "définit un contrat d'I/O (validation/sérialisation)",
    "core": "fournit une fonction transverse (config/db/sécurité)",
    "task": "exécute un job asynchrone (Celery)",
    "command": "fournit une commande CLI",
    "util": "fournit un utilitaire",
    "plugin": "fait partie d'un plugin métier",
    "entrypoint": "bootstrappe l'application",
    "test": "teste un comportement",
    "other": "code divers",
}


def _first_sentence(doc: Optional[str]) -> str:
    if not doc:
        return ""
    doc = doc.strip()
    # 1re phrase ou 1re ligne
    m = re.split(r"(?<=[.!?])\s", doc, maxsplit=1)
    first = m[0] if m else doc
    return first.strip().splitlines()[0][:300]


def _humanize(name: str) -> str:
    """get_user_by_id -> 'get user by id' ; UserService -> 'User Service'."""
    s = re.sub(r"(?<!^)(?=[A-Z])", " ", name)  # camelCase
    s = s.replace("_", " ")
    return re.sub(r"\s+", " ", s).strip().lower()


def make_purpose(kind: str, name: str, layer: str, module: str,
                 docstring: Optional[str], route: Optional[dict],
                 bases: Optional[List[str]] = None) -> str:
    """Résumé déterministe : docstring si présente, sinon heuristique nom+couche."""
    parts: List[str] = []
    if route:
        parts.append(f"Endpoint {route['method']} {route.get('path','')}.")
    label = KIND_LABEL.get(kind, kind)
    role = LAYER_ROLE.get(layer, "")
    base_str = f" (hérite de {', '.join(bases)})" if bases else ""
    parts.append(f"{label} « {name} »{base_str} du module « {module} » ({layer}) — {role}.")
    ds = _first_sentence(docstring)
    if ds:
        parts.append(ds)
    else:
        parts.append(f"Concerne : {_humanize(name)}.")
    return " ".join(parts)


def build_text(chunk: Dict[str, Any]) -> str:
    """Bloc sémantique normalisé (étape 5)."""
    lines = [
        f"File: {chunk['file']}",
        f"Module: {chunk['module']}",
        f"Layer: {chunk['layer']}",
        f"Type: {chunk['type']}",
        f"Symbol: {chunk['symbol']}",
    ]
    if chunk.get("route"):
        r = chunk["route"]
        lines.append(f"Route: {r['method']} {r.get('path','')}")
    deps = chunk.get("dependencies") or []
    lines.append("Dependencies: " + (", ".join(deps) if deps else "(aucune interne)"))
    lines.append(f"Purpose: {chunk['summary']}")
    if chunk.get("responsibilities"):
        lines.append("Responsibilities: " + "; ".join(chunk["responsibilities"]))
    lines.append("Code:")
    lines.append(chunk.get("code", ""))
    return "\n".join(lines)


def internal_deps(file_rec: Dict[str, Any]) -> List[str]:
    """Imports internes app.* du fichier (proxy de dépendances du chunk)."""
    deps = []
    for imp in file_rec.get("imports", []):
        mod = imp.get("module", "")
        if mod.startswith("app"):
            deps.append(mod)
    # dédup en gardant l'ordre
    seen = set()
    out = []
    for d in deps:
        if d not in seen:
            seen.add(d)
            out.append(d)
    return out


def slice_source(lines: List[str], lineno: int, end_lineno: int) -> str:
    code = "\n".join(lines[lineno - 1:end_lineno])
    return code[:_MAX_CODE_CHARS]


def main() -> None:
    C.ensure_output_dir()
    analysis = json.loads((C.OUTPUT_DIR / "analysis.json").read_text(encoding="utf-8"))
    files = [f for f in analysis["files"] if not f.get("error")]

    chunks: List[Dict[str, Any]] = []
    next_id = 0

    for f in files:
        path = C.BACKEND_ROOT / f["path"]
        src_lines = C.read_text(path).splitlines()
        deps = internal_deps(f)
        base_meta = {
            "file": f["path"],
            "module": f["module"],
            "layer": f["layer"],
            "dependencies": deps,
            "language": C.LANGUAGE,
        }

        # --- module chunk ---
        outline = []
        for c in f["classes"]:
            outline.append(f"class {c['name']}")
        for fn in f["functions"]:
            outline.append(f"def {fn['name']}")
        module_code_parts = []
        if f.get("docstring"):
            module_code_parts.append('"""' + f["docstring"] + '"""')
        module_code_parts.append("# Inventaire : " + ", ".join(outline[:60]) if outline else "# (pas de symbole top-level)")
        module_chunk = {
            "id": next_id,
            "type": "module",
            "symbol": f["dotted"],
            "lineno": 1,
            "end_lineno": f.get("loc", 1),
            "route": None,
            "code": "\n".join(module_code_parts)[:_MAX_CODE_CHARS],
            "summary": make_purpose("module", f["dotted"], f["layer"], f["module"],
                                    f.get("docstring"), None),
            "responsibilities": outline[:30],
            **base_meta,
        }
        chunks.append(module_chunk)
        next_id += 1

        # --- class chunks (signature + docstring + signatures méthodes) ---
        for c in f["classes"]:
            sig_lines = [f"class {c['name']}({', '.join(c['bases'])}):" if c["bases"] else f"class {c['name']}:"]
            if c.get("docstring"):
                sig_lines.append('    """' + _first_sentence(c["docstring"]) + '"""')
            for m in c["methods"]:
                prefix = "async def" if m["is_async"] else "def"
                sig_lines.append(f"    {prefix} {m['name']}({', '.join(m['args'])})")
            class_chunk = {
                "id": next_id,
                "type": "class",
                "symbol": c["name"],
                "lineno": c["lineno"],
                "end_lineno": c["end_lineno"],
                "route": None,
                "code": "\n".join(sig_lines)[:_MAX_CODE_CHARS],
                "summary": make_purpose("class", c["name"], f["layer"], f["module"],
                                        c.get("docstring"), None, c.get("bases")),
                "responsibilities": [m["name"] for m in c["methods"]][:30],
                **base_meta,
            }
            chunks.append(class_chunk)
            next_id += 1

            # --- method chunks (source exact) ---
            for m in c["methods"]:
                kind = "endpoint" if m["route"] else "method"
                mc = {
                    "id": next_id,
                    "type": kind,
                    "symbol": f"{c['name']}.{m['name']}",
                    "lineno": m["lineno"],
                    "end_lineno": m["end_lineno"],
                    "route": m["route"],
                    "code": slice_source(src_lines, m["lineno"], m["end_lineno"]),
                    "summary": make_purpose(kind, f"{c['name']}.{m['name']}", f["layer"],
                                            f["module"], m.get("docstring"), m["route"]),
                    "responsibilities": [],
                    **base_meta,
                }
                chunks.append(mc)
                next_id += 1

        # --- function chunks (source exact) ---
        for fn in f["functions"]:
            kind = "endpoint" if fn["route"] else "function"
            fc = {
                "id": next_id,
                "type": kind,
                "symbol": fn["name"],
                "lineno": fn["lineno"],
                "end_lineno": fn["end_lineno"],
                "route": fn["route"],
                "code": slice_source(src_lines, fn["lineno"], fn["end_lineno"]),
                "summary": make_purpose(kind, fn["name"], f["layer"], f["module"],
                                        fn.get("docstring"), fn["route"]),
                "responsibilities": [],
                **base_meta,
            }
            chunks.append(fc)
            next_id += 1

    # Finalise : texte d'embedding + preview
    for ch in chunks:
        ch["text"] = build_text(ch)
        ch["preview"] = ch["code"][:_PREVIEW_CHARS]

    out = C.OUTPUT_DIR / "chunks.jsonl"
    with out.open("w", encoding="utf-8") as fh:
        for ch in chunks:
            fh.write(json.dumps(ch, ensure_ascii=False) + "\n")

    by_type: Dict[str, int] = {}
    for ch in chunks:
        by_type[ch["type"]] = by_type.get(ch["type"], 0) + 1
    print(f"[chunk] {len(chunks)} chunks écrits -> {out}")
    print(f"[chunk] par type : {by_type}")


if __name__ == "__main__":
    main()

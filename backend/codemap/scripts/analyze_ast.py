"""
Étape 1 — Analyse AST du backend.

Parse chaque fichier .py de `app/` avec le module `ast` de la stdlib (aucune
dépendance externe) et extrait : modules, classes, méthodes, fonctions,
docstrings, imports, décorateurs et endpoints (routes FastAPI).

Sorties :
  output/analysis.json          (données structurées brutes, consommées par les
                                  étapes suivantes)
  output/analysis_report.md     (rapport lisible)

Usage (dans le container kaapi-api) :
  python codemap/scripts/analyze_ast.py
"""

from __future__ import annotations

import ast
import json
from collections import Counter, defaultdict
from typing import Any, Dict, List, Optional

import common as C


# --- Extraction des décorateurs / routes ----------------------------------------

_HTTP_VERBS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}


def _decorator_name(dec: ast.expr) -> str:
    """Représente un décorateur sous forme texte lisible (best-effort)."""
    try:
        return ast.unparse(dec)
    except Exception:  # noqa: BLE001
        return ""


def _extract_route(decorators: List[ast.expr]) -> Optional[Dict[str, str]]:
    """
    Détecte un décorateur de route FastAPI/APIRouter :
      @router.get("/x"), @app.post("/y"), @some_router.delete(...)
    Retourne {"method": "GET", "path": "/x"} ou None.
    """
    for dec in decorators:
        if not isinstance(dec, ast.Call):
            continue
        func = dec.func
        if not isinstance(func, ast.Attribute):
            continue
        verb = func.attr.lower()
        if verb not in _HTTP_VERBS:
            continue
        path = ""
        if dec.args and isinstance(dec.args[0], ast.Constant) and isinstance(dec.args[0].value, str):
            path = dec.args[0].value
        return {"method": verb.upper(), "path": path}
    return None


def _func_args(node: ast.AST) -> List[str]:
    args: List[str] = []
    a = getattr(node, "args", None)
    if a is None:
        return args
    for arg in list(a.posonlyargs) + list(a.args):
        args.append(arg.arg)
    if a.vararg:
        args.append("*" + a.vararg.arg)
    for arg in a.kwonlyargs:
        args.append(arg.arg)
    if a.kwarg:
        args.append("**" + a.kwarg.arg)
    return args


def _doc(node: ast.AST) -> Optional[str]:
    try:
        d = ast.get_docstring(node, clean=True)
    except Exception:  # noqa: BLE001
        d = None
    return d


def _summarize_func(node: ast.AST) -> Dict[str, Any]:
    decorators = [_decorator_name(d) for d in getattr(node, "decorator_list", [])]
    route = _extract_route(getattr(node, "decorator_list", []))
    return {
        "name": node.name,  # type: ignore[attr-defined]
        "lineno": node.lineno,  # type: ignore[attr-defined]
        "end_lineno": getattr(node, "end_lineno", node.lineno),  # type: ignore[attr-defined]
        "is_async": isinstance(node, ast.AsyncFunctionDef),
        "args": _func_args(node),
        "decorators": decorators,
        "route": route,
        "docstring": _doc(node),
    }


# --- Imports ---------------------------------------------------------------------

def _extract_imports(tree: ast.AST, current_dotted: str) -> List[Dict[str, Any]]:
    """
    Retourne la liste des imports avec résolution des imports relatifs.
    Chaque entrée : {"module": "app.x.y", "names": [...], "relative": bool}.
    """
    out: List[Dict[str, Any]] = []
    # package courant = current_dotted si c'est un package (__init__), sinon parent
    pkg = current_dotted.rsplit(".", 1)[0] if "." in current_dotted else current_dotted

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                out.append({"module": alias.name, "names": [], "relative": False})
        elif isinstance(node, ast.ImportFrom):
            if node.level and node.level > 0:
                # import relatif → remonter `level` packages depuis pkg
                base_parts = pkg.split(".")
                # level=1 → même package ; level=2 → parent ; etc.
                if node.level - 1 > 0:
                    base_parts = base_parts[: -(node.level - 1)] or base_parts
                base = ".".join(base_parts)
                mod = f"{base}.{node.module}" if node.module else base
                out.append(
                    {
                        "module": mod,
                        "names": [a.name for a in node.names],
                        "relative": True,
                    }
                )
            else:
                out.append(
                    {
                        "module": node.module or "",
                        "names": [a.name for a in node.names],
                        "relative": False,
                    }
                )
    return out


# --- Analyse d'un fichier --------------------------------------------------------

def analyze_file(path) -> Optional[Dict[str, Any]]:
    rel = C.relpath(path)
    src = C.read_text(path)
    try:
        tree = ast.parse(src, filename=rel)
    except SyntaxError as e:
        return {"path": rel, "error": f"SyntaxError: {e}", "module": C.classify(rel)[0],
                "layer": C.classify(rel)[1]}

    module, layer = C.classify(rel)
    dotted = C.to_dotted(rel)

    classes: List[Dict[str, Any]] = []
    functions: List[Dict[str, Any]] = []

    for node in tree.body:  # top-level uniquement
        if isinstance(node, ast.ClassDef):
            methods = []
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    methods.append(_summarize_func(item))
            bases = [_decorator_name(b) for b in node.bases]
            classes.append({
                "name": node.name,
                "lineno": node.lineno,
                "end_lineno": getattr(node, "end_lineno", node.lineno),
                "bases": bases,
                "decorators": [_decorator_name(d) for d in node.decorator_list],
                "docstring": _doc(node),
                "methods": methods,
            })
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(_summarize_func(node))

    imports = _extract_imports(tree, dotted)

    return {
        "path": rel,
        "dotted": dotted,
        "module": module,
        "layer": layer,
        "loc": src.count("\n") + 1,
        "docstring": _doc(tree),
        "imports": imports,
        "classes": classes,
        "functions": functions,
    }


def build_report(files_data: List[Dict[str, Any]]) -> str:
    by_layer: Counter = Counter()
    by_module: Counter = Counter()
    loc_by_layer: Counter = Counter()
    n_classes = n_funcs = n_methods = n_routes = 0
    errors: List[str] = []
    module_layers: Dict[str, set] = defaultdict(set)

    for f in files_data:
        if f.get("error"):
            errors.append(f"{f['path']}: {f['error']}")
            continue
        by_layer[f["layer"]] += 1
        by_module[f["module"]] += 1
        loc_by_layer[f["layer"]] += f.get("loc", 0)
        module_layers[f["module"]].add(f["layer"])
        n_classes += len(f["classes"])
        n_methods += sum(len(c["methods"]) for c in f["classes"])
        n_funcs += len(f["functions"])
        n_routes += sum(1 for fn in f["functions"] if fn["route"])
        n_routes += sum(1 for c in f["classes"] for m in c["methods"] if m["route"])

    lines: List[str] = []
    lines.append("# Rapport d'analyse AST — backend kaapi\n")
    lines.append("> Généré par `codemap/scripts/analyze_ast.py` (étape 1).\n")
    lines.append("## Totaux\n")
    lines.append(f"- Fichiers analysés : **{len([f for f in files_data if not f.get('error')])}**")
    lines.append(f"- Erreurs de parsing : **{len(errors)}**")
    lines.append(f"- Classes : **{n_classes}**")
    lines.append(f"- Méthodes : **{n_methods}**")
    lines.append(f"- Fonctions (top-level) : **{n_funcs}**")
    lines.append(f"- Endpoints (routes HTTP) : **{n_routes}**\n")

    lines.append("## Répartition par couche\n")
    lines.append("| Couche | Fichiers | LOC |")
    lines.append("|--------|---------:|----:|")
    for layer, cnt in by_layer.most_common():
        lines.append(f"| {layer} | {cnt} | {loc_by_layer[layer]} |")
    lines.append("")

    lines.append("## Répartition par module (top 40)\n")
    lines.append("| Module | Fichiers | Couches |")
    lines.append("|--------|---------:|---------|")
    for module, cnt in by_module.most_common(40):
        layers = ", ".join(sorted(module_layers[module]))
        lines.append(f"| {module} | {cnt} | {layers} |")
    lines.append("")

    if errors:
        lines.append("## Fichiers non parsés\n")
        for e in errors:
            lines.append(f"- {e}")
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    C.ensure_output_dir()
    files = C.iter_py_files(include_tests=True)
    print(f"[analyze_ast] {len(files)} fichiers Python détectés sous app/")

    data: List[Dict[str, Any]] = []
    for p in files:
        rec = analyze_file(p)
        if rec:
            data.append(rec)

    payload = {
        "backend_root": C.BACKEND_ROOT.as_posix(),
        "file_count": len(data),
        "files": data,
    }
    out_json = C.OUTPUT_DIR / "analysis.json"
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[analyze_ast] écrit {out_json}")

    report = build_report(data)
    out_md = C.OUTPUT_DIR / "analysis_report.md"
    out_md.write_text(report, encoding="utf-8")
    print(f"[analyze_ast] écrit {out_md}")


if __name__ == "__main__":
    main()

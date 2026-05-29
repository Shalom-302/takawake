"""
codemap.common — utilitaires partagés du pipeline de mémoire projet.

AUCUNE dépendance sur la logique métier du backend : ce module ne fait que lire
les fichiers sources de `app/` et n'importe RIEN de `app.*`. Il est volontairement
découplé pour ne jamais perturber le démarrage de l'application.

Conventions :
  - Tous les chemins manipulés sont relatifs à la racine du backend, en style
    POSIX (slash), ex: "app/routers/article.py".
  - Un "module dotté" est la forme importable, ex: "app.routers.article".
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# --- Localisation racine backend -------------------------------------------------
# scripts/ est dans backend/codemap/scripts → racine backend = parents[2].
SCRIPTS_DIR = Path(__file__).resolve().parent
CODEMAP_DIR = SCRIPTS_DIR.parent
BACKEND_ROOT = CODEMAP_DIR.parent
APP_DIR = BACKEND_ROOT / "app"
OUTPUT_DIR = CODEMAP_DIR / "output"

# --- Paramètres embeddings / Qdrant (lus depuis l'env du container, fallback) ----
EMBED_MODEL = os.environ.get("EMBED_MODEL", "intfloat/multilingual-e5-base")
EMBED_DIM = int(os.environ.get("EMBED_DIM", "768"))
QDRANT_URL = os.environ.get("QDRANT_URL", "https://qdrant-client.kortexai.dev")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY") or None
# Collection DÉDIÉE à la mémoire du code — ne touche jamais `tekawake_articles`.
QDRANT_COLLECTION = os.environ.get("CODEMAP_COLLECTION", "kaapi_backend_memory")

LANGUAGE = "python"


# --- Classification en couches ---------------------------------------------------

# Segments de répertoire / fichiers spéciaux → couche logique.
_LAYER_BY_SEGMENT = {
    "routers": "api",
    "routes": "api",
    "api": "api",
    "endpoints": "api",
    "services": "service",
    "service": "service",
    "crud": "crud",
    "repositories": "crud",
    "models": "model",
    "model": "model",
    "schemas": "schema",
    "schema": "schema",
    "core": "core",
    "tasks": "task",
    "task": "task",
    "commands": "command",
    "utils": "util",
    "util": "util",
    "middleware": "core",
    "security": "core",
    "providers": "service",
}


def relpath(path: Path) -> str:
    """Chemin POSIX relatif à la racine backend."""
    return path.relative_to(BACKEND_ROOT).as_posix()


def classify(rel: str) -> Tuple[str, str]:
    """
    Retourne (module, layer) pour un fichier donné.

    - `module` : groupe logique de haut niveau. Pour le core c'est le 1er dossier
      sous app/ (ex: "routers"). Pour un plugin c'est le nom du plugin
      (ex: "api_gateway").
    - `layer`  : couche architecturale (api / service / crud / model / schema /
      core / task / command / util / entrypoint / plugin / test / other).
    """
    parts = rel.split("/")
    fname = parts[-1]
    stem = fname[:-3] if fname.endswith(".py") else fname

    # Fichiers de test → couche dédiée (filtrable / exclus du métier).
    if "test" in parts or stem.startswith("test_") or stem.endswith("_test") or stem == "test":
        # module reste pertinent (cf. ci-dessous) mais layer = test
        layer_forced_test = True
    else:
        layer_forced_test = False

    # Points d'entrée de l'app.
    if rel in ("app/main.py", "app/ws_server.py", "app/metrics_server.py"):
        return ("entrypoint", "test" if layer_forced_test else "entrypoint")

    # --- Plugins : app/plugins/<name>/... ---
    if len(parts) >= 3 and parts[0] == "app" and parts[1] == "plugins":
        plugin_name = parts[2]
        if plugin_name in ("__pycache__", "__init__.py"):
            module = "plugins"
        else:
            module = plugin_name
        # sous-rôle du fichier dans le plugin
        sub_segments = parts[3:-1]  # dossiers entre le plugin et le fichier
        layer = "plugin"
        for seg in sub_segments:
            if seg in _LAYER_BY_SEGMENT:
                layer = _LAYER_BY_SEGMENT[seg]
                break
        else:
            # pas de sous-dossier reconnu → déduire par nom de fichier
            for key, lay in _LAYER_BY_SEGMENT.items():
                if key in stem:
                    layer = lay
                    break
        if layer_forced_test:
            layer = "test"
        return (module, layer)

    # --- Core app/<dir>/... ---
    if len(parts) >= 2 and parts[0] == "app":
        top = parts[1] if not parts[1].endswith(".py") else None
        if top is None:
            # fichier directement sous app/ (ex: app/crud_base.py, app/logger.py)
            module = "app"
            layer = "core"
            for key, lay in _LAYER_BY_SEGMENT.items():
                if key in stem:
                    layer = lay
                    break
            return (module, "test" if layer_forced_test else layer)
        module = top
        layer = _LAYER_BY_SEGMENT.get(top, "other")
        return (module, "test" if layer_forced_test else layer)

    return ("app", "test" if layer_forced_test else "other")


# --- Découverte des fichiers -----------------------------------------------------

def iter_py_files(include_tests: bool = True) -> List[Path]:
    """Liste tous les .py de app/, hors __pycache__. Ordre stable (trié)."""
    out: List[Path] = []
    for p in sorted(APP_DIR.rglob("*.py")):
        if "__pycache__" in p.parts:
            continue
        if not include_tests:
            rel = relpath(p)
            _, layer = classify(rel)
            if layer == "test":
                continue
        out.append(p)
    return out


# --- Résolution de modules dottés -----------------------------------------------

def to_dotted(rel: str) -> str:
    """'app/routers/article.py' -> 'app.routers.article' ; __init__.py -> package."""
    no_ext = rel[:-3] if rel.endswith(".py") else rel
    if no_ext.endswith("/__init__"):
        no_ext = no_ext[: -len("/__init__")]
    return no_ext.replace("/", ".")


def build_module_index(files: List[Path]) -> Dict[str, str]:
    """Map module dotté -> chemin relatif du fichier (pour résoudre les imports)."""
    index: Dict[str, str] = {}
    for p in files:
        rel = relpath(p)
        index[to_dotted(rel)] = rel
    return index


def read_text(path: Path) -> str:
    """Lecture tolérante (utf-8, fallback latin-1)."""
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1")


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

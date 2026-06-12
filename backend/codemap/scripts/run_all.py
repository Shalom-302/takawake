"""
Orchestrateur du pipeline de mémoire projet (étapes 1 → 7).

Exécute séquentiellement et de façon idempotente :
  1. analyze_ast        (AST)
  2. dependency_graph   (graphe)
  3. project_map        (PROJECT_MAP.md)
  4. chunk              (chunking + enrichissement)
  5. vectorize          (embeddings e5 locaux)
  6. index_qdrant       (collection kaapi_backend_memory)

Puis la recherche (étape 8) et le rapport (étape 9) se lancent séparément :
  python codemap/scripts/search.py "..."
  python codemap/scripts/final_report.py

Usage : python codemap/scripts/run_all.py [--recreate]
"""

from __future__ import annotations

import runpy
import sys
from pathlib import Path

STEPS = [
    "analyze_ast.py",
    "dependency_graph.py",
    "project_map.py",
    "chunk.py",
    "vectorize.py",
    "index_qdrant.py",
]


def main() -> None:
    here = Path(__file__).resolve().parent
    recreate = "--recreate" in sys.argv
    for step in STEPS:
        print(f"\n{'=' * 70}\n▶ {step}\n{'=' * 70}")
        # passe --recreate uniquement à l'indexation
        argv_backup = sys.argv[:]
        sys.argv = [step] + (["--recreate"] if (recreate and step == "index_qdrant.py") else [])
        try:
            runpy.run_path(str(here / step), run_name="__main__")
        finally:
            sys.argv = argv_backup
    print("\n✅ Pipeline terminé.")


if __name__ == "__main__":
    main()

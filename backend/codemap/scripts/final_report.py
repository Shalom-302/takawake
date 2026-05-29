"""
Étape 9 — Validation + rapport final.

Lance une batterie de requêtes métier contre la collection Qdrant, évalue la
pertinence et produit output/FINAL_REPORT.md :
  - nombre de fichiers analysés
  - nombre de chunks créés
  - nombre de vecteurs indexés
  - qualité des résultats (top-hit + score par requête)

Usage : python codemap/scripts/final_report.py
"""

from __future__ import annotations

import os
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import json
from typing import List
from urllib.parse import urlparse

import common as C
import search as S

QUERIES = [
    "modifier le login",
    "permissions utilisateur",
    "notifications",
    "envoyer un email",
    "paiement et facturation",
    "authentification à deux facteurs (MFA)",
    "upload et stockage de fichiers",
    "recherche vectorielle et embeddings",
    "clustering des articles de veille",
    "limitation de débit (rate limiting)",
    "webhooks",
    "audit et journalisation",
]


def qdrant_count() -> int:
    from qdrant_client import QdrantClient
    parsed = urlparse(C.QDRANT_URL)
    is_https = parsed.scheme == "https"
    port = parsed.port or (443 if is_https else 6333)
    client = QdrantClient(host=parsed.hostname, port=port, https=is_https,
                          api_key=C.QDRANT_API_KEY, prefer_grpc=False, timeout=60)
    return client.get_collection(C.QDRANT_COLLECTION).points_count


def main() -> None:
    analysis = json.loads((C.OUTPUT_DIR / "analysis.json").read_text(encoding="utf-8"))
    n_files = len([f for f in analysis["files"] if not f.get("error")])
    n_chunks = sum(1 for _ in (C.OUTPUT_DIR / "chunks.jsonl").open(encoding="utf-8"))
    n_vectors = qdrant_count()

    lines: List[str] = []
    lines.append("# Rapport final — mémoire backend kaapi (codemap)\n")
    lines.append("> Généré par `codemap/scripts/final_report.py` (étape 9).\n")
    lines.append("## Statistiques\n")
    lines.append(f"- Fichiers analysés : **{n_files}**")
    lines.append(f"- Chunks créés : **{n_chunks}**")
    lines.append(f"- Vecteurs indexés (Qdrant `{C.QDRANT_COLLECTION}`) : **{n_vectors}**")
    lines.append(f"- Modèle d'embedding : `{C.EMBED_MODEL}` ({C.EMBED_DIM} dim, COSINE)\n")

    lines.append("## Validation — requêtes métier\n")
    lines.append("Top résultat retourné pour chaque requête (score cosine) :\n")
    lines.append("| Requête | Top hit | Fichier | Couche | Score |")
    lines.append("|---------|---------|---------|--------|------:|")

    scores = []
    detail_blocks = []
    for q in QUERIES:
        res = S.search(q, top=5)
        if not res:
            lines.append(f"| {q} | _aucun_ | | | |")
            continue
        top = res[0]
        scores.append(top["score"])
        lines.append(f"| {q} | `{top['symbol']}` | `{top['file']}` | {top['layer']} | {top['score']:.3f} |")
        detail_blocks.append((q, res))
    lines.append("")

    if scores:
        avg = sum(scores) / len(scores)
        lines.append(f"**Score moyen du top-hit : {avg:.3f}** "
                     f"(min {min(scores):.3f}, max {max(scores):.3f})\n")

    lines.append("## Détail (top 5 par requête)\n")
    for q, res in detail_blocks:
        lines.append(f"### « {q} »\n")
        for i, r in enumerate(res, 1):
            route = f" [{r['route']['method']} {r['route']['path']}]" if r.get("route") else ""
            lines.append(f"{i}. **{r['score']:.3f}** `{r['symbol']}`{route} "
                         f"— `{r['file']}:{r['lines']}` ({r['layer']}/{r['module']})")
        lines.append("")

    lines.append("## Comment utiliser la mémoire\n")
    lines.append("```bash")
    lines.append('docker exec -w /app kaapi-api python codemap/scripts/search.py "modifier le login"')
    lines.append('docker exec -w /app kaapi-api python codemap/scripts/search.py "paiement" --layer service --top 8')
    lines.append("```")
    lines.append("")

    out = C.OUTPUT_DIR / "FINAL_REPORT.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"[final_report] écrit {out}")
    if scores:
        print(f"[final_report] score moyen top-hit : {sum(scores)/len(scores):.3f}")


if __name__ == "__main__":
    main()

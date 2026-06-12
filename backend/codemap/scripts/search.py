"""
Étape 8 — Recherche sémantique dans la mémoire du backend.

Encode la requête (préfixe `query: `, modèle e5 local) et interroge la collection
Qdrant `kaapi_backend_memory`. Retourne pour chaque résultat : fichier, symbole,
type, couche, module, dépendances et score de similarité.

Usage :
  python codemap/scripts/search.py "modifier le login"
  python codemap/scripts/search.py "permissions utilisateur" --top 8 --layer service
  python codemap/scripts/search.py --json "notifications"
"""

from __future__ import annotations

import os
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import argparse
import json
from typing import List, Optional
from urllib.parse import urlparse

import common as C

_PREFIX = "query: "


def embed_query(text: str) -> List[float]:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(C.EMBED_MODEL, device="cpu")
    vec = model.encode([_PREFIX + text], normalize_embeddings=True, convert_to_numpy=True)[0]
    return vec.tolist()


def search(query: str, top: int = 10, layer: Optional[str] = None,
           module: Optional[str] = None, type_: Optional[str] = None) -> List[dict]:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qm

    parsed = urlparse(C.QDRANT_URL)
    is_https = parsed.scheme == "https"
    port = parsed.port or (443 if is_https else 6333)
    client = QdrantClient(host=parsed.hostname, port=port, https=is_https,
                          api_key=C.QDRANT_API_KEY, prefer_grpc=False, timeout=60)

    must = []
    if layer:
        must.append(qm.FieldCondition(key="layer", match=qm.MatchValue(value=layer)))
    if module:
        must.append(qm.FieldCondition(key="module", match=qm.MatchValue(value=module)))
    if type_:
        must.append(qm.FieldCondition(key="type", match=qm.MatchValue(value=type_)))
    flt = qm.Filter(must=must) if must else None

    vec = embed_query(query)
    hits = client.query_points(collection_name=C.QDRANT_COLLECTION, query=vec,
                               query_filter=flt, limit=top, with_payload=True).points
    results = []
    for h in hits:
        p = h.payload or {}
        results.append({
            "score": round(h.score, 4),
            "file": p.get("file"),
            "symbol": p.get("symbol"),
            "type": p.get("type"),
            "layer": p.get("layer"),
            "module": p.get("module"),
            "route": p.get("route"),
            "lines": f"{p.get('lineno')}-{p.get('end_lineno')}",
            "dependencies": p.get("dependencies", []),
            "summary": p.get("summary", ""),
        })
    return results


def main() -> None:
    ap = argparse.ArgumentParser(description="Recherche sémantique dans kaapi_backend_memory")
    ap.add_argument("query", help="requête en langage naturel")
    ap.add_argument("--top", type=int, default=10)
    ap.add_argument("--layer", default=None)
    ap.add_argument("--module", default=None)
    ap.add_argument("--type", dest="type_", default=None)
    ap.add_argument("--json", action="store_true", help="sortie JSON brute")
    args = ap.parse_args()

    res = search(args.query, args.top, args.layer, args.module, args.type_)
    if args.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return

    print(f"\n🔎  « {args.query} »  —  {len(res)} résultats\n")
    for i, r in enumerate(res, 1):
        route = f"  [{r['route']['method']} {r['route']['path']}]" if r.get("route") else ""
        print(f"{i:2}. ({r['score']:.3f}) {r['type']:8} {r['symbol']}{route}")
        print(f"     {r['file']}:{r['lines']}  ·  couche={r['layer']}  module={r['module']}")
        if r["dependencies"]:
            print(f"     deps: {', '.join(r['dependencies'][:6])}")
        if r["summary"]:
            print(f"     ↳ {r['summary'][:160]}")
        print()


if __name__ == "__main__":
    main()

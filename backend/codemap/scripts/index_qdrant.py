"""
Étape 7 — Indexation Qdrant.

Crée (si absente) la collection DÉDIÉE `kaapi_backend_memory` (768 / COSINE) et
upsert tous les chunks vectorisés. NE TOUCHE JAMAIS la collection métier
`tekawake_articles`.

Payload (recommandé par la mission) :
  file, module, layer, symbol, type, dependencies[], summary, language
  + extras de navigation : path, lineno, end_lineno, route, preview

Entrées : output/chunks.jsonl, output/embeddings.npy, output/embeddings_meta.json
Usage   : python codemap/scripts/index_qdrant.py [--recreate]
"""

from __future__ import annotations

import json
import sys
from typing import List

import numpy as np

import common as C


def load_chunks() -> List[dict]:
    out = []
    with (C.OUTPUT_DIR / "chunks.jsonl").open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def build_payload(ch: dict) -> dict:
    return {
        "file": ch["file"],
        "module": ch["module"],
        "layer": ch["layer"],
        "symbol": ch["symbol"],
        "type": ch["type"],
        "dependencies": ch.get("dependencies", []),
        "summary": ch.get("summary", ""),
        "language": ch.get("language", "python"),
        # extras navigation / debug
        "lineno": ch.get("lineno"),
        "end_lineno": ch.get("end_lineno"),
        "route": ch.get("route"),
        "preview": ch.get("preview", ""),
    }


def main() -> None:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qm
    from urllib.parse import urlparse

    recreate = "--recreate" in sys.argv

    chunks = load_chunks()
    vectors = np.load(C.OUTPUT_DIR / "embeddings.npy")
    meta = json.loads((C.OUTPUT_DIR / "embeddings_meta.json").read_text(encoding="utf-8"))
    assert len(chunks) == vectors.shape[0] == meta["count"], "désalignement chunks/vecteurs"
    assert [c["id"] for c in chunks] == meta["ids"], "ordre chunks != ordre embeddings"

    # Client (même logique HTTPS que app/services/qdrant_service.py)
    parsed = urlparse(C.QDRANT_URL)
    is_https = parsed.scheme == "https"
    port = parsed.port or (443 if is_https else 6333)
    client = QdrantClient(
        host=parsed.hostname, port=port, https=is_https,
        api_key=C.QDRANT_API_KEY, prefer_grpc=False, timeout=60,
    )
    name = C.QDRANT_COLLECTION

    existing = {c.name for c in client.get_collections().collections}
    if recreate and name in existing:
        client.delete_collection(name)
        existing.discard(name)
        print(f"[index] collection {name} supprimée (--recreate)")
    if name not in existing:
        client.create_collection(
            collection_name=name,
            vectors_config=qm.VectorParams(size=C.EMBED_DIM, distance=qm.Distance.COSINE),
        )
        print(f"[index] collection {name} créée ({C.EMBED_DIM}/COSINE)")
    else:
        print(f"[index] collection {name} déjà présente — upsert idempotent")

    # Index de payload pour filtres fréquents (idempotent côté Qdrant)
    for field, schema in (
        ("layer", qm.PayloadSchemaType.KEYWORD),
        ("module", qm.PayloadSchemaType.KEYWORD),
        ("type", qm.PayloadSchemaType.KEYWORD),
        ("language", qm.PayloadSchemaType.KEYWORD),
        ("file", qm.PayloadSchemaType.KEYWORD),
    ):
        try:
            client.create_payload_index(collection_name=name, field_name=field, field_schema=schema)
        except Exception:
            pass

    points = [
        qm.PointStruct(id=int(ch["id"]), vector=vectors[i].tolist(), payload=build_payload(ch))
        for i, ch in enumerate(chunks)
    ]

    BATCH = 256
    for i in range(0, len(points), BATCH):
        client.upsert(collection_name=name, points=points[i:i + BATCH], wait=True)
        print(f"[index] upsert {min(i + BATCH, len(points))}/{len(points)}")

    info = client.get_collection(name)
    print(f"[index] OK — collection {name} : {info.points_count} points")


if __name__ == "__main__":
    main()

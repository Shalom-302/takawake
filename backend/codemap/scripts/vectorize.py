"""
Étape 6 — Vectorisation des chunks.

Encode le champ `text` de chaque chunk avec le modèle sentence-transformers DÉJÀ
présent en cache (`intfloat/multilingual-e5-base`, 768 dim, CPU). Aucun
téléchargement : mode hors-ligne forcé.

Convention E5 (identique au reste du projet) : préfixe `passage: ` à
l'indexation, `query: ` à la recherche.

Entrée  : output/chunks.jsonl
Sorties : output/embeddings.npy   (matrice float32 [N, 768], lignes alignées
                                   sur l'ordre de chunks.jsonl)
          output/embeddings_meta.json  ({"ids": [...], "dim": 768, "model": ...})

Usage : python codemap/scripts/vectorize.py
"""

from __future__ import annotations

# Hors-ligne AVANT tout import HF.
import os
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import json
from typing import List

import numpy as np

import common as C

_BATCH = 32
_PREFIX = "passage: "


def load_chunks() -> List[dict]:
    out = []
    with (C.OUTPUT_DIR / "chunks.jsonl").open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def main() -> None:
    from sentence_transformers import SentenceTransformer

    C.ensure_output_dir()
    chunks = load_chunks()
    texts = [_PREFIX + c["text"] for c in chunks]
    print(f"[vectorize] {len(texts)} chunks à encoder avec {C.EMBED_MODEL} (CPU, offline)")

    model = SentenceTransformer(C.EMBED_MODEL, device="cpu")
    vectors = model.encode(
        texts,
        batch_size=_BATCH,
        show_progress_bar=True,
        normalize_embeddings=True,   # vecteurs unitaires -> compatible COSINE
        convert_to_numpy=True,
    ).astype("float32")

    assert vectors.shape[0] == len(chunks)
    assert vectors.shape[1] == C.EMBED_DIM, f"dim {vectors.shape[1]} != {C.EMBED_DIM}"

    np.save(C.OUTPUT_DIR / "embeddings.npy", vectors)
    meta = {
        "ids": [c["id"] for c in chunks],
        "count": len(chunks),
        "dim": int(vectors.shape[1]),
        "model": C.EMBED_MODEL,
        "prefix": _PREFIX.strip(),
    }
    (C.OUTPUT_DIR / "embeddings_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"[vectorize] écrit embeddings.npy {vectors.shape} + embeddings_meta.json")


if __name__ == "__main__":
    main()

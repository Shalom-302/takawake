"""
Étape 6 — Vectorisation des chunks (avec CACHE incrémental).

Encode le champ `text` de chaque chunk avec le modèle sentence-transformers DÉJÀ
présent en cache (`intfloat/multilingual-e5-base`, 768 dim, CPU). Aucun
téléchargement : mode hors-ligne forcé.

Convention E5 (identique au reste du projet) : préfixe `passage: ` à
l'indexation, `query: ` à la recherche.

CACHE (DRY — ne ré-encode que le nouveau) :
  On garde `output/embedding_cache.npz` = {hash(texte) -> vecteur}. À chaque run,
  un chunk dont le texte est INCHANGÉ réutilise son vecteur ; seuls les chunks
  nouveaux ou modifiés sont ré-encodés. Si AUCUN chunk n'a changé, le modèle
  n'est même pas chargé (rebuild en quelques secondes au lieu de ~30 min).
  La clé est un hash du contenu, donc robuste à la renumérotation des `id`.
  Le cache est invalidé si le modèle d'embedding change.

Entrée  : output/chunks.jsonl
Sorties : output/embeddings.npy        (matrice float32 [N, 768], ordre = chunks.jsonl)
          output/embeddings_meta.json  ({"ids": [...], "dim": 768, "model": ...})
          output/embedding_cache.npz   (cache hash -> vecteur, régénérable)

Usage : python codemap/scripts/vectorize.py [--no-cache]
"""

from __future__ import annotations

# Hors-ligne AVANT tout import HF.
import os
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import hashlib
import json
import sys
from typing import Dict, List

import numpy as np

import common as C

_BATCH = 32
_PREFIX = "passage: "
_CACHE_PATH = C.OUTPUT_DIR / "embedding_cache.npz"


def load_chunks() -> List[dict]:
    out = []
    with (C.OUTPUT_DIR / "chunks.jsonl").open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_cache() -> Dict[str, np.ndarray]:
    """Cache {hash -> vecteur}. Vide si absent, illisible ou modèle différent."""
    if not _CACHE_PATH.exists():
        return {}
    try:
        data = np.load(_CACHE_PATH, allow_pickle=False)
        if str(data["model"].item()) != C.EMBED_MODEL:
            print(f"[vectorize] cache ignoré (modèle différent : {data['model'].item()})")
            return {}
        hashes = data["hashes"]
        vectors = data["vectors"]
        return {str(h): vectors[i] for i, h in enumerate(hashes)}
    except Exception as e:  # noqa: BLE001
        print(f"[vectorize] cache illisible, ignoré ({e!r})")
        return {}


def save_cache(hashes: List[str], vectors: np.ndarray) -> None:
    np.savez_compressed(
        _CACHE_PATH,
        model=np.array(C.EMBED_MODEL),
        hashes=np.array(hashes),
        vectors=vectors.astype("float32"),
    )


def main() -> None:
    use_cache = "--no-cache" not in sys.argv

    C.ensure_output_dir()
    chunks = load_chunks()
    texts = [_PREFIX + c["text"] for c in chunks]
    hashes = [_hash(t) for t in texts]
    n = len(chunks)

    cache = load_cache() if use_cache else {}
    vectors = np.zeros((n, C.EMBED_DIM), dtype="float32")
    missing = [i for i, h in enumerate(hashes) if h not in cache]
    reused = n - len(missing)

    for i, h in enumerate(hashes):
        if h in cache:
            vectors[i] = cache[h]

    print(f"[vectorize] {n} chunks — {reused} réutilisés (cache), {len(missing)} à (ré)encoder")

    if missing:
        from sentence_transformers import SentenceTransformer
        print(f"[vectorize] chargement {C.EMBED_MODEL} (CPU, offline) pour {len(missing)} chunks")
        model = SentenceTransformer(C.EMBED_MODEL, device="cpu")
        new_vecs = model.encode(
            [texts[i] for i in missing],
            batch_size=_BATCH,
            show_progress_bar=True,
            normalize_embeddings=True,   # vecteurs unitaires -> compatible COSINE
            convert_to_numpy=True,
        ).astype("float32")
        for j, i in enumerate(missing):
            vectors[i] = new_vecs[j]
    else:
        print("[vectorize] aucun changement — modèle non chargé (rebuild instantané)")

    assert vectors.shape == (n, C.EMBED_DIM), f"forme {vectors.shape} inattendue"

    np.save(C.OUTPUT_DIR / "embeddings.npy", vectors)
    meta = {
        "ids": [c["id"] for c in chunks],
        "count": n,
        "dim": int(vectors.shape[1]),
        "model": C.EMBED_MODEL,
        "prefix": _PREFIX.strip(),
    }
    (C.OUTPUT_DIR / "embeddings_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Met à jour le cache = état courant (borné par la taille du code).
    if use_cache:
        save_cache(hashes, vectors)

    print(f"[vectorize] écrit embeddings.npy {vectors.shape} + embeddings_meta.json"
          + (f" + cache ({n} entrées)" if use_cache else ""))


if __name__ == "__main__":
    main()

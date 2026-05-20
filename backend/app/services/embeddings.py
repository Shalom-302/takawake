"""
Service d'embeddings via sentence-transformers (`intfloat/multilingual-e5-base`).

768 dim, tourne en CPU, multilingue FR/EN, gratuit. Matche la collection
Qdrant `tekawake_articles` (768 / cosine).

Convention E5 : les textes doivent être préfixés
  - `query: ...`   pour une requête de recherche
  - `passage: ...` pour un document à indexer / regrouper / comparer
Le clustering et la similarité symétrique utilisent `passage:` des deux côtés.
"""

from __future__ import annotations

import asyncio
import threading
from typing import Any, Dict, List, Optional

try:
    from sentence_transformers import SentenceTransformer
    ST_AVAILABLE = True
except ImportError:
    SentenceTransformer = None  # type: ignore
    ST_AVAILABLE = False

from app.core.config import settings

_MAX_TEXT_CHARS = 8000  # tronquage défensif, le modèle accepte 512 tokens (~2k chars)
_BATCH_SIZE = 32        # batch interne du encode(); bonne valeur pour CPU

_model: Optional["SentenceTransformer"] = None  # type: ignore
_model_lock = threading.Lock()


def _get_model() -> "SentenceTransformer":  # type: ignore
    """Singleton thread-safe. Le 1er appel télécharge le modèle (~500 MB)."""
    global _model
    if not ST_AVAILABLE:
        raise RuntimeError(
            "sentence-transformers n'est pas installé. "
            "Exécute `pip install sentence-transformers` dans le container."
        )
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = SentenceTransformer(settings.EMBED_MODEL, device="cpu")
    return _model


def build_embedding_text(
    title: Optional[str],
    resume_neutre: Optional[str],
    problematique_africaine: Optional[str],
) -> str:
    """Concatène les champs pertinents avec des séparateurs explicites."""
    parts: List[str] = []
    if title:
        parts.append(f"TITRE: {title.strip()}")
    if resume_neutre:
        parts.append(f"RESUME: {resume_neutre.strip()}")
    if problematique_africaine:
        parts.append(f"PROBLEMATIQUE: {problematique_africaine.strip()}")
    text = "\n\n".join(parts)
    return text[:_MAX_TEXT_CHARS]


def build_text_from_analysis(title: Optional[str], analysis: Optional[Dict[str, Any]]) -> str:
    """Helper : extrait resume_neutre + problematique_africaine du JSON `analysis` et concatène."""
    analysis = analysis or {}
    return build_embedding_text(
        title=title,
        resume_neutre=analysis.get("resume_neutre"),
        problematique_africaine=analysis.get("problematique_africaine"),
    )


def _prefix_for(task_type: str) -> str:
    # Seule la query de recherche utilise `query:`. Tout le reste (clustering,
    # similarité symétrique, indexation) utilise `passage:`.
    return "query: " if task_type.upper() == "RETRIEVAL_QUERY" else "passage: "


def _embed_batch_sync(texts: List[str], task_type: str) -> List[List[float]]:
    """Appel synchrone à sentence-transformers. Encapsulé pour run dans un thread."""
    if not texts:
        return []
    model = _get_model()
    prefix = _prefix_for(task_type)
    prefixed = [prefix + t for t in texts]
    # normalize_embeddings=True → vecteurs unitaires, compatible Distance.COSINE
    vectors = model.encode(
        prefixed,
        batch_size=_BATCH_SIZE,
        show_progress_bar=False,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    return [v.tolist() for v in vectors]


async def embed_texts(
    texts: List[str],
    task_type: str = "CLUSTERING",
) -> List[List[float]]:
    """
    Embed une liste de textes, retourne les vecteurs dans l'ordre.

    task_type (héritage de l'API Gemini, conservé pour compat) :
      - "RETRIEVAL_QUERY"   → préfixe `query: ` (recherche)
      - tout le reste       → préfixe `passage: ` (indexation / clustering / similarité)

    Le préfixe DOIT être identique entre indexation et query pour préserver
    la qualité de similarité.
    """
    if not texts:
        return []
    if not ST_AVAILABLE:
        raise RuntimeError("sentence-transformers n'est pas installé.")
    return await asyncio.to_thread(_embed_batch_sync, texts, task_type)


async def embed_single(text: str, task_type: str = "CLUSTERING") -> List[float]:
    """Helper pour un seul texte (ex: query de recherche)."""
    vecs = await embed_texts([text], task_type=task_type)
    return vecs[0] if vecs else []

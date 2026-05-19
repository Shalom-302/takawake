"""
Service d'embeddings via Gemini (text-embedding-004).

Utilisé en aval de l'analyse LLM pour vectoriser chaque article, puis indexer
dans Qdrant et clusteriser par similarité (HDBSCAN).
"""

import asyncio
from typing import Any, Dict, List, Optional

import google.generativeai as genai

from app.core.config import settings

# Configuration globale du SDK (idempotent : safe à appeler plusieurs fois)
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# Limites pratiques de l'API Gemini embed_content
_BATCH_SIZE = 100  # max 100 contents par appel
_MAX_TEXT_CHARS = 8000  # tronquage défensif (le modèle accepte ~2k tokens)


def build_embedding_text(
    title: Optional[str],
    resume_neutre: Optional[str],
    problematique_africaine: Optional[str],
) -> str:
    """
    Concatène les champs pertinents avec des séparateurs explicites.

    Le séparateur '\\n\\n' donne au modèle un signal clair de structure
    sans introduire de tokens parasites. Champs absents → ignorés.
    """
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


def _embed_batch_sync(texts: List[str], task_type: str) -> List[List[float]]:
    """Appel synchrone à Gemini. Encapsulé pour pouvoir être run dans un thread."""
    if not texts:
        return []
    result = genai.embed_content(
        model=settings.GEMINI_EMBED_MODEL,
        content=texts,
        task_type=task_type,
    )
    # L'API retourne {"embedding": [...]} pour un seul input, {"embedding": [[...], [...]]} pour une liste
    embeddings = result.get("embedding", [])
    if embeddings and isinstance(embeddings[0], (int, float)):
        # Un seul vecteur retourné (cas où texts n'avait qu'un élément)
        return [list(embeddings)]
    return [list(v) for v in embeddings]


async def embed_texts(
    texts: List[str],
    task_type: str = "CLUSTERING",
) -> List[List[float]]:
    """
    Embed une liste de textes en batchs de 100, retourne les vecteurs dans l'ordre.

    task_type :
      - "CLUSTERING"           : pour le pipeline veille (regroupement par similarité)
      - "SEMANTIC_SIMILARITY"  : pour la dédup avant LLM
      - "RETRIEVAL_DOCUMENT"   : pour indexer en vue d'une recherche future
      - "RETRIEVAL_QUERY"      : pour la query au moment d'une recherche

    Le task_type DOIT être identique entre indexation et query, sinon
    la similarité est dégradée.
    """
    if not texts:
        return []
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY n'est pas configuré.")

    vectors: List[List[float]] = []
    for i in range(0, len(texts), _BATCH_SIZE):
        batch = texts[i : i + _BATCH_SIZE]
        try:
            batch_vecs = await asyncio.to_thread(_embed_batch_sync, batch, task_type)
        except Exception as e:
            # Une seule tentative de retry après backoff léger
            await asyncio.sleep(1.0)
            try:
                batch_vecs = await asyncio.to_thread(_embed_batch_sync, batch, task_type)
            except Exception:
                raise RuntimeError(f"Echec embeddings Gemini sur batch [{i}:{i+len(batch)}]: {e}")
        vectors.extend(batch_vecs)
    return vectors


async def embed_single(text: str, task_type: str = "CLUSTERING") -> List[float]:
    """Helper pour un seul texte (ex: query de recherche)."""
    vecs = await embed_texts([text], task_type=task_type)
    return vecs[0] if vecs else []

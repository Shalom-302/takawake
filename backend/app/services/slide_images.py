"""
Illustration automatique des slides d'un cluster.

Pour chaque slide : le LLM extrait 2-4 mots-clés visuels (en anglais, les banques
d'images répondent mieux), puis on récupère une photo pertinente sur Pexels.
L'`image_url` obtenue est posée sur la slide mais reste éditable/remplaçable à la
main (PATCH du cluster) côté human-in-the-loop.

Tout est best-effort : si la clé Pexels manque ou qu'un appel échoue, la slide
est simplement laissée sans image (jamais d'exception qui casserait la génération).
"""
import asyncio
from typing import List, Optional

import httpx
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import settings
from app.schemas.veille import Slide
from app.services.llm_factory import get_llm

PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"

_QUERY_PROMPT = ChatPromptTemplate.from_template(
    """Tu choisis des mots-clés pour rechercher une photo d'illustration.
À partir du texte de slide ci-dessous, donne 2 à 4 mots-clés EN ANGLAIS, concrets
et visuels (objets, lieux, scènes — pas de concepts abstraits), séparés par des
espaces, sans ponctuation ni guillemets. Réponds UNIQUEMENT par les mots-clés.

Texte de la slide :
{texte}
"""
)


async def _derive_query(texte: str, llm_provider: str) -> str:
    """Mots-clés de recherche image dérivés du texte de slide via le LLM."""
    chain = _QUERY_PROMPT | get_llm(llm_provider) | StrOutputParser()
    raw = await chain.ainvoke({"texte": texte})
    # On garde la 1re ligne, on nettoie ponctuation/guillemets résiduels.
    query = raw.strip().splitlines()[0] if raw.strip() else ""
    query = query.replace('"', "").replace("'", "").replace(".", "").replace(",", " ")
    return " ".join(query.split())[:100]


async def _search_pexels(
    client: httpx.AsyncClient, query: str, exclude: set[str]
) -> Optional[str]:
    """1re photo paysage pertinente non déjà utilisée, ou None."""
    if not query:
        return None
    try:
        resp = await client.get(
            PEXELS_SEARCH_URL,
            params={"query": query, "per_page": 5, "orientation": "landscape"},
            headers={"Authorization": settings.PEXELS_API_KEY},
            timeout=15.0,
        )
        resp.raise_for_status()
        photos = resp.json().get("photos", [])
        for photo in photos:
            url = (photo.get("src") or {}).get("landscape") or (photo.get("src") or {}).get("large")
            if url and url not in exclude:
                return url
        # Toutes déjà utilisées → on renvoie quand même la 1re dispo.
        if photos:
            src = photos[0].get("src") or {}
            return src.get("landscape") or src.get("large")
    except Exception as e:  # noqa: BLE001 — best-effort, on log et on continue
        print(f"[slide_images] Échec recherche Pexels pour '{query}': {e}")
    return None


async def search_pexels_photos(query: str, per_page: int = 15) -> List[dict]:
    """
    Recherche multi-résultats pour le sélecteur d'images de l'éditeur.
    Retourne une liste de {id, url, thumbnail, photographer, alt}. [] si pas de
    clé ou en cas d'échec (l'UI affiche alors « aucun résultat »).
    """
    if not settings.PEXELS_API_KEY or not query.strip():
        return []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                PEXELS_SEARCH_URL,
                params={"query": query, "per_page": per_page, "orientation": "landscape"},
                headers={"Authorization": settings.PEXELS_API_KEY},
                timeout=15.0,
            )
            resp.raise_for_status()
            photos = resp.json().get("photos", [])
    except Exception as e:  # noqa: BLE001 — best-effort
        print(f"[slide_images] Échec recherche Pexels (picker) pour '{query}': {e}")
        return []

    results: list[dict] = []
    for p in photos:
        src = p.get("src") or {}
        url = src.get("landscape") or src.get("large")
        if not url:
            continue
        results.append({
            "id": p.get("id"),
            "url": url,
            "thumbnail": src.get("medium") or src.get("small") or url,
            "photographer": p.get("photographer"),
            "alt": p.get("alt"),
        })
    return results


async def illustrate_slides(
    slides: List[Slide],
    llm_provider: str,
    *,
    overwrite: bool = False,
) -> List[Slide]:
    """
    Retourne une nouvelle liste de slides enrichies d'`image_url`.

    - overwrite=False : ne complète que les slides sans image (génération initiale).
    - overwrite=True  : ré-illustre toutes les slides (bouton « Régénérer les images »).

    Sans clé Pexels, renvoie les slides inchangées.
    """
    if not settings.PEXELS_API_KEY:
        print("[slide_images] PEXELS_API_KEY absente → illustration des slides désactivée.")
        return slides

    targets = [i for i, s in enumerate(slides) if overwrite or not s.image_url]
    if not targets:
        return slides

    # 1) Mots-clés en parallèle (un petit appel LLM par slide ciblée).
    queries = await asyncio.gather(
        *(_derive_query(slides[i].texte, llm_provider) for i in targets)
    )

    # 2) Recherche d'images séquentielle pour pouvoir éviter les doublons.
    result = list(slides)
    used: set[str] = {s.image_url for s in slides if s.image_url}
    async with httpx.AsyncClient() as client:
        for idx, query in zip(targets, queries):
            url = await _search_pexels(client, query, used)
            if url:
                used.add(url)
                result[idx] = result[idx].model_copy(update={"image_url": url})
    return result

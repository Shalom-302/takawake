"""Client Firecrawl self-host (réseau interne Dokploy, sans auth).

Sourcing piloté par le prompt de veille :
  - `search()`  : /v1/search → recherche web (DuckDuckGo en self-host par défaut)
                  + scrape markdown des résultats EN UN SEUL appel.
  - `scrape()`  : /v1/scrape → re-scrape musclé d'une URL (fallback "squelette"
                  des sites JS : rendu navigateur via waitFor, proxy stealth,
                  onlyMainContent=False pour récupérer même la coquille).

L'API tourne en interne (cf. docker-compose.dokploy.yml du fork Firecrawl),
joignable via FIRECRAWL_BASE_URL = http://firecrawl-api:3002. Aucune clé.
"""

from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx

from app.core.config import settings

# Seuil de contenu exploitable, cohérent avec le pipeline RSS (tekawake.py).
MIN_CONTENT_LEN = 250


def domain_of(url: str) -> str:
    """Nom de domaine d'une URL (sert de source_name). 'source' si illisible."""
    try:
        return urlparse(url).netloc or "source"
    except Exception:
        return "source"


def parse_meta_date(meta: Dict[str, Any]) -> Optional[datetime.datetime]:
    """Date de publication depuis les métadonnées Firecrawl (naïve, sans tz)."""
    for key in (
        "publishedTime",
        "article:published_time",
        "ogPublishedTime",
        "modifiedTime",
        "article:modified_time",
    ):
        raw = meta.get(key)
        if isinstance(raw, str) and raw.strip():
            try:
                dt = datetime.datetime.fromisoformat(raw.replace("Z", "+00:00"))
                return dt.replace(tzinfo=None)  # colonne DateTime naïve
            except Exception:
                continue
    return None


def _scrape_options(country: str, lang: str, *, aggressive: bool = False) -> Dict[str, Any]:
    """Options de scrape. `aggressive` = mode 'squelette' pour les sites durs."""
    return {
        "formats": ["markdown"],
        # En fallback on récupère TOUT (nav/footer compris) pour ne pas rentrer
        # bredouille sur un site dont la détection du contenu principal échoue.
        "onlyMainContent": not aggressive,
        # Le vrai levier "squelette" = rendu JS long + page entière. On garde un
        # proxy "basic" même en agressif : "stealth"/"enhanced" exigent un backend
        # proxy payant absent du self-host (→ 500 sur /v1/scrape).
        "waitFor": 8000 if aggressive else settings.FIRECRAWL_WAIT_FOR_MS,
        "proxy": "basic" if aggressive else settings.FIRECRAWL_PROXY,
        "blockAds": True,
        "location": {"country": country.upper(), "languages": [lang]},
    }


def _extract_results(body: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Normalise la réponse /v1/search (liste plate ou groupée web/news)."""
    data = body.get("data")
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        out: List[Dict[str, Any]] = []
        for key in ("web", "news"):
            val = data.get(key)
            if isinstance(val, list):
                out.extend(val)
        return out
    return []


def _timeout() -> httpx.Timeout:
    # Le scrape côté Firecrawl peut durer ; on laisse une marge au-dessus du
    # timeout serveur pour récupérer une vraie réponse plutôt qu'un read timeout.
    secs = settings.FIRECRAWL_TIMEOUT_MS / 1000 + 30
    return httpx.Timeout(secs, connect=15.0)


async def search(
    query: str,
    *,
    limit: Optional[int] = None,
    lang: Optional[str] = None,
    country: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Recherche + scrape markdown. Retourne une liste de résultats Firecrawl
    ({url, title, description, markdown, metadata}). Liste vide en cas d'échec."""
    limit = limit or settings.FIRECRAWL_SEARCH_LIMIT
    lang = lang or settings.FIRECRAWL_LANG
    country = country or settings.FIRECRAWL_COUNTRY

    payload = {
        "query": query,
        "limit": limit,
        "lang": lang,
        "country": country,
        "timeout": settings.FIRECRAWL_TIMEOUT_MS,
        "scrapeOptions": _scrape_options(country, lang),
    }

    async with httpx.AsyncClient(base_url=settings.FIRECRAWL_BASE_URL, timeout=_timeout()) as client:
        resp = await client.post("/v1/search", json=payload)
        resp.raise_for_status()
        body = resp.json()

    if not body.get("success", True):
        print(f"[FIRECRAWL] search non-success : {str(body)[:200]}")
        return []
    return _extract_results(body)


async def scrape(
    url: str,
    *,
    aggressive: bool = False,
    lang: Optional[str] = None,
    country: Optional[str] = None,
) -> Optional[str]:
    """Scrape une URL et renvoie le markdown (None si échec/vide)."""
    lang = lang or settings.FIRECRAWL_LANG
    country = country or settings.FIRECRAWL_COUNTRY

    payload: Dict[str, Any] = {
        "url": url,
        "timeout": 60000,
        **_scrape_options(country, lang, aggressive=aggressive),
    }

    async with httpx.AsyncClient(base_url=settings.FIRECRAWL_BASE_URL, timeout=_timeout()) as client:
        resp = await client.post("/v1/scrape", json=payload)
        resp.raise_for_status()
        body = resp.json()

    data = body.get("data") or {}
    md = data.get("markdown")
    return md if isinstance(md, str) and md.strip() else None

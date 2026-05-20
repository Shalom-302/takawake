"""
Service Qdrant : collection unique `articles`.

Chaque point a pour ID l'article_id Postgres → join trivial.
Vecteur : 768 dim (sentence-transformers multilingual-e5-base), distance cosine.
Payload : métadonnées utiles aux filtres + au debug.
"""

from __future__ import annotations  # toutes les annotations sont des strings (PEP 563)

import asyncio
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlparse

try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qm
    QDRANT_AVAILABLE = True
except ImportError:
    # Module pas installé — l'app démarre quand même, le pipeline d'index sera skippé.
    # Utile en dev quand `pip install qdrant-client` n'a pas encore été fait.
    QdrantClient = None  # type: ignore
    qm = None  # type: ignore
    QDRANT_AVAILABLE = False

from app.core.config import settings


_client: Optional["QdrantClient"] = None  # type: ignore


def get_client() -> "QdrantClient":
    """Singleton léger. QdrantClient est thread-safe (HTTP).

    Note : on parse l'URL et on passe host/port/https explicitement.
    qdrant-client 1.18 ignore le scheme dans `url=` et tape sur 6333 par défaut,
    ce qui casse les déploiements HTTPS derrière un reverse-proxy sur 443.
    """
    if not QDRANT_AVAILABLE:
        raise RuntimeError("qdrant-client n'est pas installé. Exécute `pip install qdrant-client` dans le container.")
    global _client
    if _client is None:
        parsed = urlparse(settings.QDRANT_URL)
        is_https = parsed.scheme == "https"
        port = parsed.port or (443 if is_https else 6333)
        _client = QdrantClient(
            host=parsed.hostname,
            port=port,
            https=is_https,
            api_key=settings.QDRANT_API_KEY,
            prefer_grpc=False,
            timeout=30,
        )
    return _client


def _ensure_collection_sync() -> None:
    """Crée la collection `articles` et ses payload indexes si absents. Idempotent."""
    client = get_client()
    name = settings.QDRANT_COLLECTION

    existing = {c.name for c in client.get_collections().collections}
    if name not in existing:
        client.create_collection(
            collection_name=name,
            vectors_config=qm.VectorParams(
                size=settings.EMBED_DIM,
                distance=qm.Distance.COSINE,
            ),
        )

    # Payload indexes pour les filtres fréquents. create_payload_index est idempotent
    # côté Qdrant — un re-create ne casse pas.
    for field, schema in (
        ("veille_id", qm.PayloadSchemaType.INTEGER),
        ("cluster_id", qm.PayloadSchemaType.INTEGER),
        ("category_id", qm.PayloadSchemaType.INTEGER),
        ("score_pertinence", qm.PayloadSchemaType.INTEGER),
        ("created_at", qm.PayloadSchemaType.DATETIME),
    ):
        try:
            client.create_payload_index(
                collection_name=name,
                field_name=field,
                field_schema=schema,
            )
        except Exception:
            # Index déjà présent → on ignore
            pass


async def ensure_collection() -> None:
    """Wrapper async pour appel depuis nœud LangGraph."""
    await asyncio.to_thread(_ensure_collection_sync)


def _upsert_sync(points: List[qm.PointStruct]) -> None:
    client = get_client()
    client.upsert(
        collection_name=settings.QDRANT_COLLECTION,
        points=points,
        wait=True,
    )


async def upsert_article_vectors(
    items: List[Dict[str, Any]],
) -> int:
    """
    Upsert idempotent (par article_id).

    Chaque item :
        {
            "article_id": int,
            "vector": List[float],
            "payload": Dict[str, Any],  # veille_id, cluster_id, title, source_name, score_pertinence, created_at...
        }
    Retourne le nombre de points upsertés.
    """
    if not items:
        return 0

    points: List[qm.PointStruct] = []
    for it in items:
        article_id = it.get("article_id")
        vector = it.get("vector")
        payload = it.get("payload") or {}
        if article_id is None or not vector:
            continue
        points.append(
            qm.PointStruct(
                id=int(article_id),
                vector=list(vector),
                payload=payload,
            )
        )

    if not points:
        return 0

    # Batch de 256 points/requête pour rester confortable
    BATCH = 256
    for i in range(0, len(points), BATCH):
        await asyncio.to_thread(_upsert_sync, points[i : i + BATCH])
    return len(points)


def _scroll_sync(
    flt: qm.Filter,
    limit: int,
) -> List[Tuple[int, List[float], Dict[str, Any]]]:
    client = get_client()
    out: List[Tuple[int, List[float], Dict[str, Any]]] = []
    next_offset = None
    while True:
        points, next_offset = client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            scroll_filter=flt,
            with_payload=True,
            with_vectors=True,
            limit=limit,
            offset=next_offset,
        )
        for p in points:
            vec = p.vector if isinstance(p.vector, list) else []
            out.append((int(p.id), vec, dict(p.payload or {})))
        if next_offset is None:
            break
    return out


async def scroll_by_veille(veille_id: int, limit: int = 500) -> List[Tuple[int, List[float], Dict[str, Any]]]:
    """Récupère tous les (article_id, vector, payload) d'une veille. Pour le clustering batch."""
    flt = qm.Filter(
        must=[qm.FieldCondition(key="veille_id", match=qm.MatchValue(value=int(veille_id)))]
    )
    return await asyncio.to_thread(_scroll_sync, flt, limit)


def _set_cluster_sync(article_ids: List[int], cluster_id: int) -> None:
    """Met à jour le payload cluster_id en place (pas d'upsert vecteur)."""
    client = get_client()
    client.set_payload(
        collection_name=settings.QDRANT_COLLECTION,
        payload={"cluster_id": int(cluster_id)},
        points=[int(i) for i in article_ids],
        wait=True,
    )


async def set_cluster_for_articles(article_ids: List[int], cluster_id: int) -> None:
    """Assigne un cluster_id à un ensemble d'articles (côté Qdrant)."""
    if not article_ids:
        return
    BATCH = 512
    for i in range(0, len(article_ids), BATCH):
        await asyncio.to_thread(_set_cluster_sync, article_ids[i : i + BATCH], cluster_id)


def _clear_cluster_sync(article_ids: List[int]) -> None:
    """Remet le payload cluster_id à None (article repassé non-clusterisé)."""
    client = get_client()
    client.set_payload(
        collection_name=settings.QDRANT_COLLECTION,
        payload={"cluster_id": None},
        points=[int(i) for i in article_ids],
        wait=True,
    )


async def clear_cluster_for_articles(article_ids: List[int]) -> None:
    """
    Réinitialise le cluster_id Qdrant d'un ensemble d'articles. À appeler avant
    un re-clustering : sinon un article qui sort du clustering garderait un
    cluster_id obsolète dans son payload.
    """
    if not article_ids:
        return
    BATCH = 512
    for i in range(0, len(article_ids), BATCH):
        await asyncio.to_thread(_clear_cluster_sync, article_ids[i : i + BATCH])


def _delete_by_veille_sync(veille_id: int) -> int:
    """Supprime tous les points d'une veille. Retourne le nombre supprimé."""
    client = get_client()
    flt = qm.Filter(
        must=[qm.FieldCondition(key="veille_id", match=qm.MatchValue(value=int(veille_id)))]
    )
    # delete() ne renvoie pas de compteur → on compte avant.
    n = client.count(
        collection_name=settings.QDRANT_COLLECTION,
        count_filter=flt,
        exact=True,
    ).count
    if n:
        client.delete(
            collection_name=settings.QDRANT_COLLECTION,
            points_selector=qm.FilterSelector(filter=flt),
            wait=True,
        )
    return n


async def delete_vectors_for_veille(veille_id: int) -> int:
    """
    Supprime de Qdrant tous les vecteurs d'une veille. À appeler à la
    suppression de la veille : sinon les points deviennent orphelins et
    polluent la collection (et faussent les tests). Retourne le nombre
    de points supprimés.
    """
    return await asyncio.to_thread(_delete_by_veille_sync, veille_id)


# --- Inspection (exposée via le router /qdrant) ---

def _list_collections_sync() -> List[Dict[str, Any]]:
    client = get_client()
    out: List[Dict[str, Any]] = []
    for col in client.get_collections().collections:
        try:
            info = client.get_collection(col.name)
            out.append({
                "name": col.name,
                "points_count": info.points_count,
                "status": str(info.status),
            })
        except Exception as e:  # noqa: BLE001
            out.append({"name": col.name, "points_count": None, "status": f"error: {e}"})
    return out


async def list_collections() -> List[Dict[str, Any]]:
    """Liste les collections Qdrant avec leur nombre de points."""
    return await asyncio.to_thread(_list_collections_sync)


def _collection_stats_sync(collection_name: str) -> Dict[str, Any]:
    client = get_client()
    info = client.get_collection(collection_name)

    # Config du vecteur (collection à vecteur unique non nommé).
    try:
        params = info.config.params.vectors
        vector_cfg: Dict[str, Any] = {"size": params.size, "distance": str(params.distance)}
    except Exception:  # noqa: BLE001
        vector_cfg = {"info": "indisponible"}

    # Répartition des points par veille_id et cluster_id (scroll du payload).
    by_veille: Dict[Any, int] = {}
    by_cluster: Dict[Any, int] = {}
    offset = None
    while True:
        points, offset = client.scroll(
            collection_name=collection_name,
            with_payload=True,
            with_vectors=False,
            limit=256,
            offset=offset,
        )
        for p in points:
            payload = p.payload or {}
            v = payload.get("veille_id")
            c = payload.get("cluster_id")
            by_veille[v] = by_veille.get(v, 0) + 1
            by_cluster[c] = by_cluster.get(c, 0) + 1
        if offset is None:
            break

    def _sorted(d: Dict[Any, int]) -> Dict[str, int]:
        items = sorted(d.items(), key=lambda kv: (kv[0] is None, kv[0] if kv[0] is not None else -1))
        return {str(k): v for k, v in items}

    return {
        "name": collection_name,
        "status": str(info.status),
        "points_count": info.points_count,
        "vector_config": vector_cfg,
        "points_par_veille_id": _sorted(by_veille),
        "points_par_cluster_id": _sorted(by_cluster),
    }


async def collection_stats(collection_name: str) -> Dict[str, Any]:
    """Stats d'une collection : config + répartition des points par veille/cluster."""
    return await asyncio.to_thread(_collection_stats_sync, collection_name)


def _search_sync(vector: List[float], top_k: int, flt: Optional[qm.Filter]) -> List[qm.ScoredPoint]:
    client = get_client()
    return client.search(
        collection_name=settings.QDRANT_COLLECTION,
        query_vector=vector,
        query_filter=flt,
        limit=top_k,
        with_payload=True,
    )


async def search_nearest(
    vector: List[float],
    top_k: int = 10,
    veille_id: Optional[int] = None,
) -> List[qm.ScoredPoint]:
    """Recherche les k voisins les plus proches. Filtre optionnel par veille."""
    flt = None
    if veille_id is not None:
        flt = qm.Filter(
            must=[qm.FieldCondition(key="veille_id", match=qm.MatchValue(value=int(veille_id)))]
        )
    return await asyncio.to_thread(_search_sync, vector, top_k, flt)

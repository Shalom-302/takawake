# app/routers/qdrant.py
"""
Inspection de l'instance Qdrant depuis la doc de l'API.

Permet de vérifier l'état des collections vectorielles — et notamment la
suppression des vecteurs d'une veille — sans ouvrir le dashboard Qdrant.
"""

from fastapi import APIRouter, HTTPException, Path, status

from app.core.config import settings
from app.services import qdrant_service
from app.services.qdrant_service import QDRANT_AVAILABLE

router = APIRouter()


@router.get("/collections", summary="Lister les collections Qdrant")
async def list_qdrant_collections():
    """
    Liste toutes les collections de l'instance Qdrant configurée
    (`QDRANT_URL`) avec leur nombre de points et leur statut.
    """
    if not QDRANT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="qdrant-client n'est pas installé.",
        )
    try:
        collections = await qdrant_service.list_collections()
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Qdrant injoignable : {e}",
        )
    return {
        "qdrant_url": settings.QDRANT_URL,
        "collection_app": settings.QDRANT_COLLECTION,
        "collections": collections,
    }


@router.get("/collections/{collection}", summary="Détail d'une collection Qdrant")
async def qdrant_collection_detail(
    collection: str = Path(..., description="Nom de la collection (ex: tekawake_articles)."),
):
    """
    Détail d'une collection : config du vecteur, nombre de points, et
    répartition des points par `veille_id` et par `cluster_id`.

    Pratique pour vérifier que les vecteurs d'une veille supprimée ont bien
    disparu (le `veille_id` correspondant ne doit plus apparaître).
    """
    if not QDRANT_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="qdrant-client n'est pas installé.",
        )
    try:
        return await qdrant_service.collection_stats(collection)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Qdrant injoignable ou collection '{collection}' inconnue : {e}",
        )

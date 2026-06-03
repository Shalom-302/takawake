# app/api/routers/veille.py

from fastapi import APIRouter, Depends, HTTPException, Query, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Literal, Optional, cast
from celery import Task

from app.core.db import get_async_db # Assurez-vous d'avoir ceci
from app.schemas.veille import VeilleCreate, VeilleResponse, TriggerVeilleRequest
from app.crud.crud_veille import crud_veille
from app.crud.crud_cluster import crud_cluster
from app.services.qdrant_service import delete_vectors_for_veille
from app.tasks.veille_tasks import run_veille_workflow_task, reindex_articles_task # Assurez-vous que cela pointe vers vos tâches Celery
from app.services.llm_factory import OllamaModel
from app.plugins.advanced_auth.utils.security import require_superuser


router = APIRouter()



@router.post("/run", status_code=202, summary="Lancer une nouvelle veille en arrière-plan (Admin)")
def run_new_veille(
    query: str = Query(..., min_length=3, description="Le sujet de la veille, ex: 'Tendances Fintech'"),
    llm_provider: Literal["deepseek", "openai", "anthropic", "ollama"] = Query(
        "deepseek",
        description="Provider LLM pour l'analyse. Permet de lancer la même veille avec plusieurs providers pour comparer la pertinence.",
    ),
    ollama_model: Optional[OllamaModel] = Query(
        None,
        description="Modèle Ollama spécifique (ignoré si llm_provider != 'ollama'). Si vide, on retombe sur OLLAMA_LLM_MODEL du .env.",
    ),
    _: object = Depends(require_superuser),
    # Note : cette route est maintenant `def` et non `async def` car elle est instantanée.
    # Elle n'a pas besoin de `Depends(get_async_db)` car elle ne touche pas à la DB.
):
    """
    Déclenche le processus de veille via Celery et répond immédiatement.
    Le travail lourd se fait en arrière-plan par un worker Celery.
    """
    try:
        effective_model = ollama_model if llm_provider == "ollama" else None
        print(f"Envoi de la tâche de veille pour '{query}' à Celery (LLM: {llm_provider}, model: {effective_model or 'default'}).")
        # On délègue le travail à Celery. `.delay()` envoie la tâche au broker (Redis).
        cast(Task, run_veille_workflow_task).delay(query, llm_provider, effective_model)
        return {
            "message": "Tâche de veille lancée en arrière-plan. Les résultats seront disponibles via /articles dans 5 minutes.",
            "llm_provider": llm_provider,
            "ollama_model": effective_model,
        }
    except Exception as e:
        # Gère le cas où le broker Celery/Redis est inaccessible
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=503, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.post(
    "/{veille_id}/reindex",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ré-indexer (vectoriser) les articles d'une veille (Admin)",
)
def reindex_veille_articles(
    veille_id: int = Path(..., description="L'ID de la veille dont on (re)vectorise les articles."),
    _: object = Depends(require_superuser),
):
    """
    Déclenche une tâche de fond qui (re)vectorise dans Qdrant les articles
    PROCESSED de la veille. Indispensable quand l'indexation initiale a échoué :
    sans vecteurs, le clustering ne peut rien regrouper.
    """
    try:
        print(f"Envoi de la tâche de ré-indexation pour la veille {veille_id} à Celery.")
        cast(Task, reindex_articles_task).delay(veille_id=veille_id)
        return {
            "message": f"Tâche de ré-indexation lancée pour la veille {veille_id}.",
            "veille_id": veille_id,
        }
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=503, detail=f"Le service de tâches de fond est indisponible : {str(e)}")




@router.get(
    "/",
    response_model=List[VeilleResponse],
    summary="Lister toutes les sessions de veille"
)
async def get_all_veilles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère toutes les sessions de veille enregistrées.
    """
    veilles = await crud_veille.get_all(db, skip=skip, limit=limit)
    return veilles

@router.get("/count", summary="Compter les veilles")
async def count_veilles(db: AsyncSession = Depends(get_async_db)):
    return {"count": await crud_veille.count(db)}

@router.get(
    "/{veille_id}",
    response_model=VeilleResponse,
    summary="Récupérer une session de veille par ID"
)
async def get_single_veille(
    veille_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère les détails d'une session de veille spécifique.
    """
    veille = await crud_veille.get(db, veille_id)
    if not veille:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session de veille non trouvée")
    return veille

@router.delete("/{veille_id}", status_code=status.HTTP_200_OK, summary="Supprimer une veille et ses articles")
async def delete_veille(
    veille_id: int = Path(..., description="L'ID de la veille à supprimer."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime une veille spécifique et tous ses articles associés grâce à la suppression en cascade.
    """
    deleted_veille = await crud_veille.remove(db=db, veille_id=veille_id)
    if not deleted_veille:
        raise HTTPException(status_code=404, detail=f"Veille avec l'ID {veille_id} non trouvée.")
    # La cascade supprime les articles ; on nettoie les clusters devenus vides.
    removed_clusters = await crud_cluster.delete_empty_clusters(db)
    # On purge aussi les vecteurs Qdrant de la veille (sinon points orphelins).
    # Qdrant indisponible ne doit pas faire échouer la suppression déjà commitée.
    try:
        removed_vectors = await delete_vectors_for_veille(veille_id)
    except Exception as e:  # noqa: BLE001
        removed_vectors = None
        print(f"[WARN] purge des vecteurs Qdrant de la veille {veille_id} échouée : {e}")
    return {
        "message": f"Veille ID {veille_id} et ses articles associés ont été supprimés avec succès.",
        "clusters_vides_supprimes": removed_clusters,
        "vecteurs_qdrant_supprimes": removed_vectors,
    }
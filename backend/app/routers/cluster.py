# app/api/routers/cluster.py

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Literal, Optional, cast
from celery import Task

from app.core.db import get_async_db
from app.schemas.veille import (
    ClusterResponse, ClusterCreate, ClusterUpdate,
    Slide, ImageInfo, ClusterInfo,ClusterWithArticlesResponse, PexelsImage
)
from app.services.slide_images import search_pexels_photos
from app.crud.crud_cluster import crud_cluster 
from app.crud.crud_article import crud_article 
from app.tasks.veille_tasks import (
    run_full_backfill_task,
    generate_cluster_content_task,
    regenerate_slide_images_task,
)
from app.services.llm_factory import OllamaModel
from app.plugins.advanced_auth.utils.security import require_superuser

router = APIRouter()

# --- Opérations de Backfill (tâches Celery) ---

@router.post(
    "/backfill-assign",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Déclencher le backfill complet des clusters et de la pertinence"
)
def run_full_backfill_endpoint(
    llm_provider: Literal["deepseek", "openai", "anthropic", "ollama"] = Query(
        "deepseek",
        description="Provider LLM utilisé pour cette tâche.",
    ),
    veille_id: Optional[int] = Query(
        None,
        description="ID de la veille à clusteriser. Si omis, toutes les veilles sont traitées.",
    ),
    ollama_model: Optional[OllamaModel] = Query(
        None,
        description="Modèle Ollama spécifique (ignoré si llm_provider != 'ollama').",
    ),
    _: object = Depends(require_superuser),
):
    """
    Déclenche une tâche de fond pour exécuter toutes les étapes du backfill :
    assignation des clusters aux articles et génération des justifications de pertinence.
    """
    try:
        effective_model = ollama_model if llm_provider == "ollama" else None
        print(f"Envoi de la tâche de backfill complet à Celery (LLM: {llm_provider}, model: {effective_model or 'default'}, veille: {veille_id or 'toutes'}).")
        cast(Task, run_full_backfill_task).delay(
            llm_provider=llm_provider,
            veille_id=veille_id,
            ollama_model=effective_model,
        )
        return {
            "message": "Tâche de backfill complet lancée en arrière-plan.",
            "llm_provider": llm_provider,
            "ollama_model": effective_model,
            "veille_id": veille_id,
        }
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Le service de tâches de fond est indisponible : {str(e)}")
@router.post(
    "/{cluster_id}/generate-content", 
    status_code=status.HTTP_202_ACCEPTED,
    summary="Générer l'article de synthèse et les slides pour un cluster"
)
def generate_cluster_full_content_endpoint(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel générer le contenu."),
    llm_provider: Literal["deepseek", "openai", "anthropic", "ollama"] = Query(
        "deepseek",
        description="Provider LLM utilisé pour cette tâche.",
    ),
    ollama_model: Optional[OllamaModel] = Query(
        None,
        description="Modèle Ollama spécifique (ignoré si llm_provider != 'ollama').",
    ),
    _: object = Depends(require_superuser),
):
    """
    Déclenche une tâche de fond pour générer séquentiellement l'article de synthèse
    et le carrousel de slides pour le cluster spécifié.
    """
    try:
        effective_model = ollama_model if llm_provider == "ollama" else None
        print(f"Envoi de la tâche de génération de contenu pour le cluster ID '{cluster_id}' à Celery (LLM: {llm_provider}, model: {effective_model or 'default'}).")
        cast(Task, generate_cluster_content_task).delay(cluster_id, llm_provider, effective_model)
        return {
            "message": f"Tâche de génération de contenu pour le cluster ID '{cluster_id}' lancée en arrière-plan.",
            "llm_provider": llm_provider,
            "ollama_model": effective_model,
        }
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Le service de tâches de fond est indisponible : {str(e)}")

@router.post(
    "/{cluster_id}/generate-slide-images",
    status_code=status.HTTP_202_ACCEPTED,
    summary="(Ré)générer automatiquement les images des slides d'un cluster"
)
def regenerate_slide_images_endpoint(
    cluster_id: int = Path(..., description="L'ID du cluster dont on illustre les slides."),
    llm_provider: Literal["deepseek", "openai", "anthropic", "ollama"] = Query(
        "deepseek",
        description="Provider LLM pour dériver les mots-clés de recherche d'image.",
    ),
    ollama_model: Optional[OllamaModel] = Query(
        None,
        description="Modèle Ollama spécifique (ignoré si llm_provider != 'ollama').",
    ),
):
    """
    Déclenche une tâche de fond qui ré-illustre les slides du cluster : pour
    chaque slide, le LLM extrait des mots-clés visuels puis on récupère une photo
    pertinente sur Pexels. Ne touche qu'aux slides de travail (l'original IA
    reste restaurable via /revert).
    """
    try:
        effective_model = ollama_model if llm_provider == "ollama" else None
        cast(Task, regenerate_slide_images_task).delay(cluster_id, llm_provider, effective_model)
        return {
            "message": f"Ré-illustration des slides du cluster ID '{cluster_id}' lancée en arrière-plan.",
            "llm_provider": llm_provider,
            "ollama_model": effective_model,
        }
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Le service de tâches de fond est indisponible : {str(e)}")

@router.get(
    "/image-search",
    response_model=List[PexelsImage],
    summary="Rechercher des images (Pexels) pour le sélecteur de l'éditeur"
)
async def image_search_endpoint(
    q: str = Query(..., min_length=1, description="Mots-clés de recherche d'image."),
    per_page: int = Query(15, ge=1, le=30, description="Nombre de résultats."),
):
    """
    Proxy de recherche Pexels : la clé API reste côté serveur. Sert au sélecteur
    d'images de l'éditeur (couverture + slides). Retourne [] si Pexels n'est pas
    configuré.
    """
    return await search_pexels_photos(q, per_page=per_page)

# --- Endpoints CRUD de base pour Cluster ---

@router.get(
    "/",
    response_model=List[ClusterResponse],
    summary="Lister tous les clusters"
)
async def get_all_clusters(
    is_published: Optional[bool] = Query(None, description="Filtrer par statut de publication."),
    category_id: Optional[int] = Query(None, description="Filtrer par ID de catégorie."),
    veille_id: Optional[int] = Query(None, description="Filtrer par veille d'origine."),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère une liste de tous les clusters.
    """
    clusters = await crud_cluster.get_all(db, skip=skip, limit=limit, is_published=is_published, category_id=category_id, veille_id=veille_id)
    return clusters

# --- Endpoints d'agrégation et de gestion de contenu du Cluster ---

@router.get("/count", summary="Compter les clusters")
async def count_clusters(
    is_published: Optional[bool] = Query(None),
    category_id: Optional[int] = Query(None),
    veille_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_async_db),
):
    return {
        "count": await crud_cluster.count(
            db, is_published=is_published, category_id=category_id, veille_id=veille_id
        )
    }

@router.get(
    "/all-with-pertinences",
    response_model=List[ClusterInfo],
    summary="Lister tous les clusters avec les pertinences de leurs articles"
)
async def get_all_clusters_with_pertinences(db: AsyncSession = Depends(get_async_db)):
    """
    Récupère la liste de tous les clusters uniques pour peupler les filtres,
    en incluant la justification de la pertinence pour chaque article du cluster.
    """
    clusters = await crud_cluster.get_distinct_clusters_with_pertinences(db=db)
    return clusters


@router.get(
    "/{cluster_id}",
    response_model=ClusterWithArticlesResponse,
    summary="Récupérer un cluster par ID"
)
async def get_single_cluster(
    cluster_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère les détails d'un cluster spécifique.
    """
    cluster = await crud_cluster.get(db, cluster_id)
    if not cluster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster non trouvé")
    return cluster

@router.patch(
    "/{cluster_id}",
    response_model=ClusterResponse,
    summary="Mettre à jour partiellement un cluster"
)
async def update_cluster_partial(
    cluster_id: int,
    cluster_in: ClusterUpdate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Met à jour un ou plusieurs champs d'un cluster.
    """
    updated_cluster = await crud_cluster.update(db, cluster_id=cluster_id, cluster_in=cluster_in)
    if not updated_cluster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster non trouvé.")
    return updated_cluster


@router.post(
    "/{cluster_id}/revert",
    response_model=ClusterResponse,
    summary="Restaurer la version IA d'origine d'un cluster (human-in-the-loop)"
)
async def revert_cluster_to_ai(
    cluster_id: int = Path(..., description="L'ID du cluster à restaurer."),
    summary: bool = Query(True, description="Restaurer l'article de synthèse à la version IA."),
    slides: bool = Query(True, description="Restaurer les slides à la version IA."),
    cover: bool = Query(True, description="Restaurer l'image de couverture à la version IA."),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Annule les modifications humaines en recopiant les snapshots IA d'origine
    (`*_ai`) dans les champs de travail. On choisit par query param les champs à
    restaurer (synthèse, slides, couverture). Les snapshots ne sont pas modifiés :
    on peut éditer puis revert autant de fois que nécessaire.
    """
    reverted = await crud_cluster.revert_to_ai(
        db, cluster_id=cluster_id, summary=summary, slides=slides, cover=cover
    )
    if not reverted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster non trouvé.")
    return reverted


@router.get(
    "/{cluster_id}/summary", 
    response_model=ClusterResponse, 
    summary="Récupérer l'article de synthèse d'un cluster"
)
async def get_cluster_summary_content(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel récupérer la synthèse."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère le cluster avec son article de synthèse généré par l'IA.
    """
    cluster_with_summary = await crud_cluster.get_summary_article_by_cluster(db, cluster_id)
    if not cluster_with_summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun article de synthèse trouvé pour ce cluster.")
    return cluster_with_summary


@router.get(
    "/{cluster_id}/slides", 
    response_model=List[Slide],
    summary="Récupérer les slides d'un cluster"
)
async def get_cluster_slides_content(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel récupérer les slides."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère le carrousel de slides généré par l'IA pour un cluster spécifique.
    """
    slides = await crud_cluster.get_slides_by_cluster_id(db, cluster_id) 
    if slides is None: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun slide trouvé pour ce cluster. Avez-vous lancé la génération ?")
    return slides


@router.get(
    "/{cluster_id}/image", 
    response_model=Optional[List[str]], 
    summary="Récupérer les URLs d'images de l'article le plus pertinent pour un cluster"
)
async def get_cluster_best_image_urls(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel récupérer l'image."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère la liste des URLs d'images de l'article le plus pertinent d'un cluster.
    """
    image_urls = await crud_article.get_image_for_cluster_by_id(db, cluster_id)
    if not image_urls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucune image pertinente trouvée pour ce cluster.")
    return image_urls


@router.get(
    "/{cluster_id}/images", 
    response_model=List[ImageInfo],
    summary="Récupérer les images pertinentes pour un cluster"
)
async def get_cluster_relevant_images(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel récupérer les images."),
    score_min: int = Query(7, ge=1, le=10, description="Score de pertinence minimum pour les images."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère une liste d'images pertinentes pour un cluster donné,
    filtrées par un score de pertinence minimum, avec les détails de l'article source.
    """
    images = await crud_article.get_images_for_cluster_by_id(db, cluster_id, score_min)
    if not images:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucune image pertinente trouvée pour ce cluster avec le score spécifié.")
    return images

# --- Endpoints de suppression de contenu du Cluster ---

@router.delete(
    "/{cluster_id}/summary", 
    status_code=status.HTTP_200_OK,
    summary="Supprimer l'article de synthèse d'un cluster"
)
async def clear_cluster_summary_endpoint(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel supprimer la synthèse."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime (met à NULL) le champ `summary_article` du cluster spécifique.
    """
    updated_count = await crud_cluster.clear_summary_article(db=db, cluster_id=cluster_id)
    if updated_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster non trouvé ou aucun article de synthèse à supprimer.")
    return {"message": f"Article de synthèse du cluster {cluster_id} supprimé avec succès."}


@router.delete(
    "/{cluster_id}/slides",
    status_code=status.HTTP_200_OK,
    summary="Supprimer les slides d'un cluster"
)
async def clear_cluster_slides_endpoint(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel supprimer les slides."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime (met à NULL) le champ `slides` du cluster spécifique.
    """
    updated_count = await crud_cluster.clear_slides(db=db, cluster_id=cluster_id)
    if updated_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster non trouvé ou aucune slide à supprimer.")
    return {"message": f"Slides du cluster {cluster_id} supprimés avec succès."}

@router.delete(
    "/{cluster_id}",
    status_code=status.HTTP_200_OK,
    summary="Supprimer un cluster par ID"
)
async def delete_single_cluster(
    cluster_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime un cluster spécifique de la base de données par son ID.
    """
    deleted_count = await crud_cluster.delete(db, cluster_id)
    if deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster non trouvé.")
    return {"message": f"Cluster {cluster_id} supprimé avec succès."}
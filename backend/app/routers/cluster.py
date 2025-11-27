# app/api/routers/cluster.py

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, cast
from celery import Task

from app.core.db import get_async_db
from app.schemas.veille import (
    ClusterResponse, ClusterCreate, ClusterUpdate,
    Slide, ImageInfo, ClusterInfo, # ClusterInfo est maintenant bien défini
)
from app.crud.crud_cluster import crud_cluster # Nouvelle instance CRUD
from app.crud.crud_article import crud_article # Pour les agrégations d'images/summaries
from app.tasks.veille_tasks import ( # Assurez-vous que cela pointe vers vos tâches Celery
    backfill_clusters_task,
    backfill_pertinence_task,
    generate_summary_article_task,
    generate_slides_task,
)


router = APIRouter()

# --- Opérations de Backfill (tâches Celery) ---

@router.post(
    "/backfill-assign", # Renommé pour plus de clarté
    status_code=status.HTTP_202_ACCEPTED,
    summary="Étape 1: Assigner les clusters aux articles"
)
def run_backfill_clusters_assign():
    """
    Déclenche une tâche de fond pour analyser les articles existants sans cluster
    et leur assigner un `cluster_id`. C'est la première étape du backfill.
    """
    try:
        print("Envoi de la tâche de backfill des clusters à Celery.")
        cast(Task, backfill_clusters_task).delay()
        return {"message": "Tâche de clustering lancée en arrière-plan."}
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.post(
    "/backfill-pertinence",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Étape 2: Générer la pertinence pour chaque article"
)
def run_backfill_pertinence_generate():
    """
    Déclenche une tâche de fond pour générer une justification unique (`pertinence_cluster`)
    pour chaque article qui a déjà un cluster. C'est la deuxième étape du backfill.
    """
    try:
        print("Envoi de la tâche de backfill de pertinence à Celery.")
        cast(Task, backfill_pertinence_task).delay()
        return {"message": "Tâche de génération de pertinence lancée en arrière-plan."}
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.post(
    "/{cluster_id}/generate-summary", # Utilisation de cluster_id
    status_code=status.HTTP_202_ACCEPTED,
    summary="Étape 3: Générer un article de synthèse par cluster"
)
def generate_cluster_summary_task(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel générer la synthèse.")
):
    """
    Déclenche une tâche de fond pour générer un article de synthèse basé sur tous les
    articles appartenant au cluster spécifié.
    """
    try:
        print(f"Envoi de la tâche de génération de synthèse pour le cluster ID '{cluster_id}' à Celery.")
        cast(Task, generate_summary_article_task).delay(cluster_id)
        return {"message": f"Tâche de génération de synthèse pour le cluster ID '{cluster_id}' lancée en arrière-plan."}
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.post(
    "/{cluster_id}/generate-slides", # Utilisation de cluster_id
    status_code=status.HTTP_202_ACCEPTED,
    summary="Étape 4: Générer un carrousel de slides pour un cluster"
)
def generate_cluster_slides_task(
    cluster_id: int = Path(..., description="L'ID exact du cluster pour lequel générer les slides.")
):
    """
    Déclenche une tâche de fond pour générer un carrousel de slides basé sur l'article
    de synthèse du cluster spécifié.
    """
    try:
        print(f"Envoi de la tâche de génération de slides pour le cluster ID '{cluster_id}' à Celery.")
        cast(Task, generate_slides_task).delay(cluster_id)
        return {"message": f"Tâche de génération de slides pour le cluster ID '{cluster_id}' lancée en arrière-plan."}
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Le service de tâches de fond est indisponible : {str(e)}")

# --- Endpoints CRUD de base pour Cluster ---

@router.post(
    "/",
    response_model=ClusterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un nouveau cluster"
)
async def create_new_cluster(
    cluster_in: ClusterCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Crée une nouvelle entrée de cluster.
    """
    db_cluster = await crud_cluster.create(db, cluster_in)
    return db_cluster

@router.get(
    "/",
    response_model=List[ClusterResponse],
    summary="Lister tous les clusters"
)
async def get_all_clusters(
    is_published: Optional[bool] = Query(None, description="Filtrer par statut de publication."),
    category_id: Optional[int] = Query(None, description="Filtrer par ID de catégorie."),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère une liste de tous les clusters.
    """
    clusters = await crud_cluster.get_all(db, skip=skip, limit=limit, is_published=is_published, category_id=category_id)
    return clusters

@router.get(
    "/{cluster_id}",
    response_model=ClusterResponse,
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

# --- Endpoints d'agrégation et de gestion de contenu du Cluster ---

@router.get(
    "/all-with-pertinences", # Renommé pour éviter la confusion avec GET /
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
    "/{cluster_id}/summary", # Utilisation de cluster_id
    response_model=ClusterResponse, # Retourne le Cluster, incluant summary_article
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
    "/{cluster_id}/slides", # Utilisation de cluster_id
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
    slides = await crud_cluster.get_slides_by_cluster_id(db, cluster_id) # Correction: `get_slides_by_cluster` n'existe plus directement
    if slides is None: # Si aucun cluster trouvé ou slides est None
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun slide trouvé pour ce cluster. Avez-vous lancé la génération ?")
    return slides


@router.get(
    "/{cluster_id}/image", # Utilisation de cluster_id
    response_model=Optional[List[str]], # Peut retourner une liste de strings
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
    "/{cluster_id}/images", # Utilisation de cluster_id
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
    "/{cluster_id}/summary", # Utilisation de cluster_id
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
    "/{cluster_id}/slides", # Utilisation de cluster_id
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
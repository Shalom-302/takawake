# app/api/routers/article.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.db import get_async_db
from app.schemas.veille import ArticleResponse, ArticleUpdate, ArticleStatus # Utilisez ArticleUpdate et ArticleStatus
from app.crud.crud_article import crud_article # Nouvelle instance CRUD


router = APIRouter()

@router.get(
    "/",
    response_model=List[ArticleResponse],
    summary="Lister les articles analysés"
)
async def get_articles_list(
    veille_id: Optional[int] = Query(None, description="Filtrer les articles par l'ID de la veille parente."), # AJOUT
    status: Optional[ArticleStatus] = Query(None, description="Filtrer par statut de traitement (PENDING, PROCESSED, FAILED)."),
    score_min: Optional[int] = Query(None, ge=1, le=10, description="Score de pertinence minimum."),
    cluster_title: Optional[str] = Query(None, description="Filtrer par titre de cluster (nom du cluster)."),
    order_by_publication_date: Optional[bool] = Query(True, description="Trier par date de publication (du plus récent au plus ancien)."),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère les articles de la base de données avec des options de filtrage et de tri.
    """
    articles = await crud_article.get_all(
        db=db,
        veille_id=veille_id, # AJOUT
        status=status,
        score_min=score_min,
        cluster_title=cluster_title,
        order_by_publication_date=order_by_publication_date,
        skip=skip,
        limit=limit
    )
    return articles

@router.get(
    "/{article_id}",
    response_model=ArticleResponse,
    summary="Récupérer un article par ID"
)
async def get_single_article(
    article_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère un article spécifique par son ID.
    """
    article = await crud_article.get(db, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé")
    return article


@router.patch(
    "/{article_id}",
    response_model=ArticleResponse,
    summary="Mettre à jour partiellement un article"
)
async def update_article_partial(
    article_id: int,
    article_in: ArticleUpdate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Met à jour un ou plusieurs champs d'un article.
    """
    updated_article = await crud_article.update(db, article_id=article_id, article_in=article_in)
    if not updated_article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé.")
    return updated_article


@router.delete(
    "/all",
    status_code=status.HTTP_200_OK,
    summary="Supprimer tous les articles (Admin, DANGEREUX)"
)
async def delete_all_articles_endpoint(
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime **tous** les articles de la base de données.
    
    **ATTENTION :** Cette opération est irréversible. Utilisez-la avec précaution,
    principalement pour le nettoyage en environnement de développement.
    """
    deleted_count = await crud_article.delete_all(db=db)
    return {"message": f"{deleted_count} articles ont été supprimés avec succès."}

@router.delete(
    "/{article_id}",
    status_code=status.HTTP_200_OK,
    summary="Supprimer un article par ID"
)
async def delete_single_article(
    article_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime un article spécifique de la base de données par son ID.
    """
    deleted_count = await crud_article.delete(db, article_id)
    if deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article non trouvé.")
    return {"message": f"Article {article_id} supprimé avec succès."}
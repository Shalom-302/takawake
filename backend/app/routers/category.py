# app/api/routers/category.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.db import get_async_db
from app.schemas.veille import CategoryCreate, CategoryUpdate, CategoryResponse
from app.crud.crud_category import crud_category


router = APIRouter()

@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une nouvelle catégorie"
)
async def create_new_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Crée une nouvelle catégorie.
    """
    db_category = await crud_category.create(db, category_in)
    return db_category

@router.get(
    "/",
    response_model=List[CategoryResponse],
    summary="Lister toutes les catégories"
)
async def get_all_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère une liste de toutes les catégories.
    """
    categories = await crud_category.get_all(db, skip=skip, limit=limit)
    return categories

@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Récupérer une catégorie par ID"
)
async def get_single_category(
    category_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère les détails d'une catégorie spécifique.
    """
    category = await crud_category.get(db, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catégorie non trouvée")
    return category

@router.patch(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Mettre à jour partiellement une catégorie"
)
async def update_category_partial(
    category_id: int,
    category_in: CategoryUpdate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Met à jour un ou plusieurs champs d'une catégorie.
    """
    updated_category = await crud_category.update(db, category_id=category_id, category_in=category_in)
    if not updated_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catégorie non trouvée.")
    return updated_category

@router.delete(
    "/{category_id}",
    status_code=status.HTTP_200_OK,
    summary="Supprimer une catégorie par ID"
)
async def delete_single_category(
    category_id: int,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime une catégorie spécifique de la base de données par son ID.
    """
    deleted_count = await crud_category.delete(db, category_id)
    if deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catégorie non trouvée.")
    return {"message": f"Catégorie {category_id} supprimée avec succès."}
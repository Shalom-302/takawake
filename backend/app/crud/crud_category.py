# app/crud/crud_category.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List, Optional

from app.models.veille import Category
from app.schemas.veille import CategoryCreate, CategoryUpdate

class CRUDCategory:
    async def create(self, db: AsyncSession, category_in: CategoryCreate) -> Category:
        db_category = Category(name=category_in.name)
        db.add(db_category)
        await db.commit()
        await db.refresh(db_category)
        return db_category

    async def get(self, db: AsyncSession, category_id: int) -> Optional[Category]:
        result = await db.execute(select(Category).filter(Category.id == category_id))
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Category]:
        result = await db.execute(select(Category).filter(Category.name == name))
        return result.scalars().first()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Category]:
        result = await db.execute(select(Category).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def update(self, db: AsyncSession, category_id: int, category_in: CategoryUpdate) -> Optional[Category]:
        db_category = await self.get(db, category_id)
        if not db_category:
            return None
        
        for var, value in category_in.model_dump(exclude_unset=True).items():
            setattr(db_category, var, value)
        
        db.add(db_category)
        await db.commit()
        await db.refresh(db_category)
        return db_category

    async def delete(self, db: AsyncSession, category_id: int) -> Optional[int]:
        stmt = delete(Category).where(Category.id == category_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount

crud_category = CRUDCategory()
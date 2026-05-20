# app/crud/crud_veille.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, desc, func
from typing import List, Optional

from app.models.veille import Veille
from app.schemas.veille import VeilleCreate, VeilleUpdate

class CRUDVeille:
    async def create(self, db: AsyncSession, veille_in: VeilleCreate) -> Veille:
        db_veille = Veille(
            prompt=veille_in.prompt,
            llm_provider=veille_in.llm_provider,
        )  # created_at est server_default
        db.add(db_veille)
        await db.commit()
        await db.refresh(db_veille)
        return db_veille

    async def get(self, db: AsyncSession, veille_id: int) -> Optional[Veille]:
        result = await db.execute(select(Veille).filter(Veille.id == veille_id))
        return result.scalars().first()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Veille]:
        query = select(Veille).order_by(desc(Veille.created_at)).offset(skip).limit(limit)
        result = await db.execute(query)
        return list((result.scalars().all()))

    async def count(self, db: AsyncSession) -> int:
        result = await db.execute(select(func.count()).select_from(Veille))
        return int(result.scalar_one())

    async def update(self, db: AsyncSession, veille_id: int, veille_in: VeilleUpdate) -> Optional[Veille]:
        db_veille = await self.get(db, veille_id)
        if not db_veille:
            return None
        
        for var, value in veille_in.model_dump(exclude_unset=True).items():
            setattr(db_veille, var, value)
            
        db.add(db_veille)
        await db.commit()
        await db.refresh(db_veille)
        return db_veille

    async def remove(self, db: AsyncSession, *, veille_id: int) -> Optional[Veille]:
        """
        Supprime une veille et ses articles associés (grâce à la cascade).
        """
        db_veille = await self.get(db, veille_id)
        if db_veille:
            await db.delete(db_veille)
            await db.commit()
        return db_veille

crud_veille = CRUDVeille()
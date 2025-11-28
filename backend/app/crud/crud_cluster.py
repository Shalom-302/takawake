# app/crud/crud_cluster.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, desc, update, case
from typing import List, Optional, Dict, Any, Sequence # Importez Sequence

from app.models.veille import Cluster, Article, Category
from app.schemas.veille import ClusterCreate, ClusterUpdate, Slide, ClusterInfo # ClusterInfo est maintenant correctement importé et défini
from sqlalchemy.orm import selectinload
from sqlalchemy import func

class CRUDCluster:
    async def create(self, db: AsyncSession, cluster_in: ClusterCreate) -> Cluster:
        db_cluster = Cluster(
            title=cluster_in.title,
            # created_at est server_default, is_published par défaut à False
        )
        db.add(db_cluster)
        await db.commit()
        await db.refresh(db_cluster)
        return db_cluster

    async def get(self, db: AsyncSession, cluster_id: int, load_category: bool = False) -> Optional[Cluster]:
        query = select(Cluster).filter(Cluster.id == cluster_id)
        if load_category:
            query = query.options(selectinload(Cluster.category))
        # Toujours charger les articles pour correspondre aux schémas de réponse
        query = query.options(selectinload(Cluster.articles)) 
        result = await db.execute(query)
        return result.scalars().first()
    
    async def get_by_title(self, db: AsyncSession, title: str) -> Optional[Cluster]:
        result = await db.execute(select(Cluster).filter(Cluster.title == title))
        return result.scalars().first()

    async def get_all(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        is_published: Optional[bool] = None, 
        category_id: Optional[int] = None
    ) -> List[Cluster]:
        query = select(Cluster).options(selectinload(Cluster.articles))
        if is_published is not None:
            query = query.filter(Cluster.is_published == is_published)
        if category_id is not None:
            query = query.filter(Cluster.category_id == category_id)
        
        query = query.offset(skip).limit(limit).order_by(desc(Cluster.created_at))
        result = await db.execute(query)
        return list(result.scalars().all()) # Correction

    async def update(self, db: AsyncSession, cluster_id: int, cluster_in: ClusterUpdate) -> Optional[Cluster]:
        db_cluster = await self.get(db, cluster_id)
        if not db_cluster:
            return None
        
        update_data = cluster_in.model_dump(exclude_unset=True)
        for var, value in update_data.items():
            if var == "slides" and value is not None:
                setattr(db_cluster, var, [s.model_dump() for s in value])
            else:
                setattr(db_cluster, var, value)
        
        db.add(db_cluster)
        await db.commit()
        await db.refresh(db_cluster)
        return db_cluster

    async def delete(self, db: AsyncSession, cluster_id: int) -> Optional[int]:
        stmt = delete(Cluster).where(Cluster.id == cluster_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount

    async def get_summary_article_by_cluster(self, db: AsyncSession, cluster_id: int) -> Optional[Cluster]:
        """
        Récupère le cluster avec son champ `summary_article` s'il est renseigné.
        """
        result = await db.execute(
            select(Cluster).filter(Cluster.id == cluster_id, Cluster.summary_article.is_not(None))
        )
        return result.scalars().first()
    
    async def update_slides_for_cluster(self, db: AsyncSession, cluster_id: int, slides_data: List[Slide]) -> Optional[Cluster]:
        """
        Met à jour le champ 'slides' d'un cluster.
        """
        db_cluster = await self.get(db, cluster_id)
        if not db_cluster:
            return None
        
        db_cluster.slides = [s.model_dump() for s in slides_data]
        
        db.add(db_cluster)
        await db.commit()
        await db.refresh(db_cluster)
        return db_cluster
    

    async def get_slides_by_cluster_id(self, db: AsyncSession, cluster_id: int) -> Optional[List[Dict[str, Any]]]:
        """
        Récupère les slides (sous forme de liste de dictionnaires JSON) pour un cluster spécifique.
        """
        result = await db.execute(
            select(Cluster.slides).filter(Cluster.id == cluster_id)
        )
        # slides est déjà stocké comme JSON (list[dict])
        return result.scalars().first()


    async def clear_summary_article(self, db: AsyncSession, cluster_id: int) -> Optional[int]:
        """
        Met le champ `summary_article` d'un cluster à NULL.
        """
        result = await db.execute(
            update(Cluster)
            .where(Cluster.id == cluster_id)
            .values(summary_article=None)
        )
        await db.commit()
        return result.rowcount

    async def clear_slides(self, db: AsyncSession, cluster_id: int) -> Optional[int]:
        """
        Met le champ `slides` d'un cluster à NULL.
        """
        result = await db.execute(
            update(Cluster)
            .where(Cluster.id == cluster_id)
            .values(slides=None)
        )
        await db.commit()
        return result.rowcount

    async def get_distinct_clusters_with_pertinences(self, db: AsyncSession) -> List[ClusterInfo]:
        """
        Récupère chaque cluster unique avec la liste de toutes ses pertinences associées.
        Ignore les NULL et les chaînes vides.
        """
        query = (
            select(
                Cluster.title,
                Article.pertinence_cluster
            )
            .join(Article, Article.cluster_id == Cluster.id)
            .where(Cluster.title.isnot(None))
            .where(Cluster.title != "")
        )
        result = await db.execute(query)
        rows = result.all()

        clusters_data: Dict[str, List[str]] = {}
        for title, pertinence in rows:
            if not title:
                continue
            if title not in clusters_data:
                clusters_data[title] = []
            if pertinence and pertinence.strip():
                clusters_data[title].append(pertinence.strip())

        # Création des instances de ClusterInfo
        return [
            ClusterInfo(title=title, pertinences=pertinences or []) # Utiliser 'title' au lieu de 'sujet_cluster'
            for title, pertinences in clusters_data.items()
        ]

crud_cluster = CRUDCluster()
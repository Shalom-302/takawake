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
            category_id=cluster_in.category_id,
            # created_at est server_default, is_published par défaut à False
        )
        db.add(db_cluster)
        await db.commit()
        await db.refresh(db_cluster)
        return db_cluster

    async def get(self, db: AsyncSession, cluster_id: int, load_category: bool = False) -> Optional[Cluster]:
        # On eager-load TOUJOURS category + articles + articles.veille : les
        # schémas de réponse (ClusterWithArticlesResponse → ArticleInClusterResponse
        # → VeilleContext) exposent ces relations, et le lazy-load est interdit
        # en async (MissingGreenlet à la sérialisation). `load_category` est
        # conservé pour la compat des appelants mais n'a plus d'effet.
        query = (
            select(Cluster)
            .filter(Cluster.id == cluster_id)
            .options(
                selectinload(Cluster.category),
                selectinload(Cluster.articles).selectinload(Article.veille),
            )
        )
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
        # ClusterResponse expose `category` (pas `articles`) → on eager-load
        # category pour éviter un lazy-load MissingGreenlet dès qu'un cluster
        # aura une catégorie assignée.
        query = select(Cluster).options(selectinload(Cluster.category))
        if is_published is not None:
            query = query.filter(Cluster.is_published == is_published)
        if category_id is not None:
            query = query.filter(Cluster.category_id == category_id)

        query = query.offset(skip).limit(limit).order_by(desc(Cluster.created_at))
        result = await db.execute(query)
        return list(result.scalars().all()) # Correction

    async def count(
        self,
        db: AsyncSession,
        is_published: Optional[bool] = None,
        category_id: Optional[int] = None,
    ) -> int:
        query = select(func.count()).select_from(Cluster)
        if is_published is not None:
            query = query.filter(Cluster.is_published == is_published)
        if category_id is not None:
            query = query.filter(Cluster.category_id == category_id)
        result = await db.execute(query)
        return int(result.scalar_one())

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

    # --- Clustering v2 : purge & nettoyage ---

    async def delete_empty_clusters(self, db: AsyncSession) -> int:
        """Supprime tous les clusters qui n'ont plus aucun article rattaché."""
        result = await db.execute(
            delete(Cluster).where(~Cluster.articles.any())
        )
        await db.commit()
        return result.rowcount or 0

    async def purge_unpublished_for_veille(self, db: AsyncSession, veille_id: int) -> int:
        """
        Avant un re-clustering : supprime les clusters NON publiés de cette
        veille et remet leurs articles à `cluster_id = NULL`. Les clusters
        publiés (validés par un humain) et leurs articles sont préservés.

        Retourne le nombre de clusters purgés.
        """
        # Clusters ayant au moins un article de cette veille
        cluster_ids_subq = (
            select(Article.cluster_id)
            .where(Article.veille_id == veille_id, Article.cluster_id.is_not(None))
            .distinct()
        )
        result = await db.execute(
            select(Cluster.id).where(
                Cluster.id.in_(cluster_ids_subq),
                Cluster.is_published.is_(False),
            )
        )
        cluster_ids = list(result.scalars().all())
        if not cluster_ids:
            return 0
        # Détacher les articles puis supprimer les clusters
        await db.execute(
            update(Article).where(Article.cluster_id.in_(cluster_ids)).values(cluster_id=None)
        )
        await db.execute(delete(Cluster).where(Cluster.id.in_(cluster_ids)))
        await db.commit()
        return len(cluster_ids)

crud_cluster = CRUDCluster()
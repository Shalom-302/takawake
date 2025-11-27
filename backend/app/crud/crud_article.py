# app/crud/crud_article.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, desc, update, func, join
from typing import List, Optional, Dict, Any

from app.models.veille import Article, Cluster # Importez Cluster pour les jointures
from app.schemas.veille import ArticleCreate, ArticleUpdate, ArticleAnalysis, ImageInfo # Importez ArticleAnalysis pour la conversion JSON

class CRUDArticle:
    async def create(self, db: AsyncSession, article_in: ArticleCreate) -> Article:
        db_article = Article(
            veille_id=article_in.veille_id,
            source_url=article_in.source_url,
            source_name=article_in.source_name,
            title=article_in.title,
            # scraping_date est server_default, is_processed par défaut à False
        )
        db.add(db_article)
        await db.commit()
        await db.refresh(db_article)
        return db_article

    async def get(self, db: AsyncSession, article_id: int) -> Optional[Article]:
        result = await db.execute(select(Article).filter(Article.id == article_id))
        return result.scalars().first()

    async def get_by_url(self, db: AsyncSession, url: str) -> Optional[Article]:
        result = await db.execute(select(Article).filter(Article.source_url == url))
        return result.scalars().first()

    async def get_all(
        self,
        db: AsyncSession,
        is_processed: Optional[bool] = None, # Renommé de 'published'
        score_min: Optional[int] = None,
        cluster_title: Optional[str] = None, # Renommé et filtrera sur Cluster.title
        order_by_publication_date: Optional[bool] = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Article]:
        """
        Récupère une liste d'articles avec filtres.
        Peut trier par date de publication (du plus récent au plus ancien) ou par score de pertinence.
        """
        query = select(Article)

        if cluster_title:
            # Jointure avec Cluster pour filtrer par le titre du cluster
            query = query.join(Cluster, Article.cluster_id == Cluster.id).filter(Cluster.title == cluster_title)

        if is_processed is not None:
            query = query.filter(Article.is_processed == is_processed)
        if score_min is not None:
            query = query.filter(Article.score_pertinence >= score_min)
        
        # day_category n'est plus un champ direct de Article, donc retiré du filtre
        
        if order_by_publication_date:
            query = query.order_by(desc(Article.publication_date))
        else:
            query = query.order_by(desc(Article.score_pertinence))
            
        query = query.offset(skip).limit(limit)
            
        result = await db.execute(query)
        return list(result.scalars().all())

    async def update(self, db: AsyncSession, article_id: int, article_in: ArticleUpdate) -> Optional[Article]:
        db_article = await self.get(db, article_id)
        if not db_article:
            return None
        
        update_data = article_in.model_dump(exclude_unset=True)
        for var, value in update_data.items():
            if var == "analysis" and value is not None:
                # Convertir Pydantic ArticleAnalysis en dict pour le champ JSON
                setattr(db_article, var, value.model_dump())
            else:
                setattr(db_article, var, value)
        
        db.add(db_article)
        await db.commit()
        await db.refresh(db_article)
        return db_article

    # Ancien create_or_update_article divisé/adapté
    async def create_or_update(self, db: AsyncSession, article_data: Dict[str, Any]) -> Article:
        """
        Crée un nouvel article ou met à jour un article existant basé sur son URL (source_url).
        Utilise un dict pour une flexibilité pendant le processus de scraping,
        mais idéalement on utiliserait ArticleCreate/Update.
        """
        # Chercher par la nouvelle colonne source_url
        result = await db.execute(select(Article).filter(Article.source_url == article_data["source_url"]))
        db_article = result.scalars().first()
        
        # Préparer les données. Attention ici au mapping si article_data vient de l'ancien format.
        # Idéalement, cet `article_data` devrait être une instance d'ArticleCreate/ArticleUpdate.
        # Pour compatibilité avec l'ancien dict, on filtre.
        filtered_data = {k: v for k, v in article_data.items() if hasattr(Article, k) and k not in ['id', 'scraping_date']}
        
        # Gérer la conversion pour le champ 'analysis' si présent
        if 'analysis' in filtered_data and isinstance(filtered_data['analysis'], ArticleAnalysis):
            filtered_data['analysis'] = filtered_data['analysis'].model_dump()
        
        if db_article:
            for key, value in filtered_data.items():
                setattr(db_article, key, value)
            print(f"Mise à jour de l'article : {db_article.source_url}")
        else:
            # Assurez-vous que veille_id est toujours fourni ou géré
            if 'veille_id' not in filtered_data:
                # Ceci est une simplification. Dans un vrai workflow, veille_id serait connu.
                # Vous pourriez créer une veille par défaut ou lever une erreur.
                # Pour l'exemple, nous allons le rendre nul ou lever une erreur.
                raise ValueError("veille_id est requis pour la création d'un article.")

            db_article = Article(**filtered_data, scraping_date=func.now())
            db.add(db_article)
            print(f"Création d'un nouvel article : {db_article.source_url}")
            
        await db.commit()
        await db.refresh(db_article)
        return db_article


    # Ancien update_publish_status renommé pour refléter 'is_processed'
    async def update_processing_status(self, db: AsyncSession, article_id: int, is_processed: bool) -> Optional[Article]:
        """
        Met à jour le statut de traitement (is_processed) d'un article.
        """
        db_article = await self.get(db, article_id=article_id)
        if db_article:
            db_article.is_processed = is_processed
            await db.commit()
            await db.refresh(db_article)
        return db_article

    # update_slides_for_article: N'appartient plus à Article, déplacé vers CRUDCluster

    async def delete(self, db: AsyncSession, article_id: int) -> Optional[int]:
        stmt = delete(Article).where(Article.id == article_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount

    async def delete_all(self, db: AsyncSession) -> int:
        """
        Supprime tous les articles.
        """
        result = await db.execute(delete(Article))
        deleted_rows_count = result.rowcount
        await db.commit()
        print(f"INFO: Tous les {deleted_rows_count} articles ont été supprimés de la base de données.")
        return deleted_rows_count
    
    # --- Fonctions spécialisées (adaptées) ---

    async def get_articles_without_cluster(self, db: AsyncSession, limit: int = 500) -> List[Article]:
        """Récupère les articles qui ont été traités mais n'ont pas encore de cluster."""
        stmt = select(Article).where(
            Article.is_processed == True,
            Article.cluster_id == None, # Nouvelle logique pour les clusters
            Article.analysis.is_not(None) # Assurez-vous qu'une analyse existe
        ).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_articles_needing_pertinence(self, db: AsyncSession, limit: int = 500) -> List[Article]:
        """
        Récupère les articles qui ont un cluster mais pas encore de justification de pertinence.
        """
        stmt = select(Article).where(
            Article.cluster_id.isnot(None), # Nouvelle logique pour les clusters
            Article.pertinence_cluster.is_(None)
        ).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_neutral_summaries_by_cluster_id(self, db: AsyncSession, cluster_id: int) -> str:
        """
        Récupère les 'resume_neutre' de tous les articles d'un cluster via son ID
        et les retourne en une seule chaîne de caractères.
        """
        query = (
            select(Article.analysis['resume_neutre']) # Accès au JSON
            .filter(Article.cluster_id == cluster_id) # Filtre par ID du cluster
            .filter(Article.analysis.is_not(None))
        )
        result = await db.execute(query)
        summaries = result.scalars().all()
        return " ".join(summary for summary in summaries if summary)
    
    async def get_image_for_cluster_by_id(self, db: AsyncSession, cluster_id: int) -> Optional[List[str]]:
        """
        Récupère la liste des URLs d'images de l'article le plus pertinent d'un cluster (par ID).
        Retourne la liste complète d'image_urls du meilleur article.
        """
        query = (
            select(Article.image_urls)
            .filter(
                Article.cluster_id == cluster_id,
                Article.image_urls.isnot(None),
                Article.score_pertinence.isnot(None)
            )
            .order_by(desc(Article.score_pertinence))
            .limit(1)
        )
        result = await db.execute(query)
        image_urls_list = result.scalars().first() # Ceci est la liste entière des URLs de l'article
        return image_urls_list

    async def get_images_for_cluster_by_id(self, db: AsyncSession, cluster_id: int, score_min: int = 0) -> List[ImageInfo]:
        """
        Récupère une liste d'images pertinentes pour un cluster donné (par ID),
        filtrées par un score de pertinence minimum, et traitées en Python.
        """
        # La colonne Article.image_urls est une LISTE de chaînes.
        # Nous devons d'abord récupérer les articles et agréger les images en Python.
        query = (
            select(Article.image_urls, Article.score_pertinence, Article.title, Article.id)
            .filter(
                Article.cluster_id == cluster_id,
                Article.image_urls.isnot(None),
                Article.score_pertinence >= score_min,
            )
            .order_by(desc(Article.score_pertinence))
        )
        result = await db.execute(query)
        
        all_images_info: List[ImageInfo] = []
        for article_image_urls, score, title, article_id in result.all():
            if article_image_urls:
                for url in article_image_urls:
                    if url and isinstance(url, str) and not any(ext in url.lower() for ext in ['facebook.com/tr', 'pixel.gif', 'tr.gif', 'noscript=1']):
                        # Vous pouvez ajouter une logique de scoring ou de filtrage ici si nécessaire
                        all_images_info.append(ImageInfo(
                            image_url=url,
                            score_pertinence=score,
                            article_title=title,
                            article_id=article_id
                        ))
        
        # Pour limiter le nombre d'images retournées, vous pouvez trier et couper ici.
        # Par exemple, pour les 10 meilleures images basées sur le score de l'article parent.
        all_images_info.sort(key=lambda x: x.score_pertinence if x.score_pertinence is not None else 0, reverse=True)
        return all_images_info[:20] # Limiter à 20 images pour éviter une charge trop importante


crud_article = CRUDArticle()
# app/crud/crud_article.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, desc, update, func, join
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any

from app.models.veille import Article, Cluster # Importez Cluster pour les jointures
from app.schemas.veille import ArticleCreate, ArticleUpdate, ArticleAnalysis, ImageInfo, ArticleStatus #
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
        # eager-load `veille` pour exposer prompt + llm_provider dans ArticleResponse
        # sans déclencher de lazy-load (interdit en async).
        result = await db.execute(
            select(Article)
            .options(selectinload(Article.veille))
            .filter(Article.id == article_id)
        )
        return result.scalars().first()

    async def get_by_url(self, db: AsyncSession, url: str) -> Optional[Article]:
        result = await db.execute(
            select(Article)
            .options(selectinload(Article.veille))
            .filter(Article.source_url == url)
        )
        return result.scalars().first()

    async def get_all(
        self,
        db: AsyncSession,
        veille_id: Optional[int] = None, 
        status: Optional[ArticleStatus] = None, 
        score_min: Optional[int] = None,
        cluster_title: Optional[str] = None, 
        order_by_publication_date: Optional[bool] = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Article]:
        """
        Récupère une liste d'articles avec filtres.
        Le score est maintenant lu depuis le champ JSON 'analysis'.
        """
        query = select(Article).options(selectinload(Article.veille))

        if veille_id is not None:
            query = query.filter(Article.veille_id == veille_id)
        if cluster_title:
            query = query.join(Cluster, Article.cluster_id == Cluster.id).filter(Cluster.title == cluster_title)
        if status is not None:
            query = query.filter(Article.status == status)
        if score_min is not None:
            # Filtrer sur le score dans le champ JSON
            query = query.filter(Article.analysis['score_pertinence'].as_integer() >= score_min)
        
        if order_by_publication_date:
            query = query.order_by(desc(Article.publication_date))
        else:
            # Trier sur le score dans le champ JSON
            query = query.order_by(desc(Article.analysis['score_pertinence'].as_integer()))

        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def count(
        self,
        db: AsyncSession,
        veille_id: Optional[int] = None,
        status: Optional[ArticleStatus] = None,
        score_min: Optional[int] = None,
        cluster_title: Optional[str] = None,
    ) -> int:
        query = select(func.count()).select_from(Article)
        if veille_id is not None:
            query = query.filter(Article.veille_id == veille_id)
        if cluster_title:
            query = query.join(Cluster, Article.cluster_id == Cluster.id).filter(Cluster.title == cluster_title)
        if status is not None:
            query = query.filter(Article.status == status)
        if score_min is not None:
            query = query.filter(Article.analysis['score_pertinence'].as_integer() >= score_min)
        result = await db.execute(query)
        return int(result.scalar_one())

    async def update(self, db: AsyncSession, article_id: int, article_in: ArticleUpdate) -> Optional[Article]:
        db_article = await self.get(db, article_id)
        if not db_article:
            return None
        
        update_data = article_in.model_dump(exclude_unset=True)
        for var, value in update_data.items():
            if var == "analysis" and value is not None:
                setattr(db_article, var, value.model_dump())
            else:
                setattr(db_article, var, value)
        
        db.add(db_article)
        await db.commit()
        await db.refresh(db_article)
        return db_article

    async def get_analyses_by_urls(self, db: AsyncSession, urls: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Map source_url -> analyse JSON pour les articles DÉJÀ analysés (n'importe
        quelle veille). Sert à réutiliser une analyse existante au lieu de
        relancer le LLM sur un article déjà traité ailleurs (dédup du coût LLM).
        """
        if not urls:
            return {}
        stmt = select(Article.source_url, Article.analysis).where(
            Article.source_url.in_(list(set(urls))),
            Article.status == ArticleStatus.PROCESSED,
            Article.analysis.is_not(None),
        )
        result = await db.execute(stmt)
        out: Dict[str, Dict[str, Any]] = {}
        for url, analysis in result.all():
            if url not in out and analysis:
                out[url] = analysis
        return out

    async def create_or_update(self, db: AsyncSession, article_data: Dict[str, Any]) -> Article:
        """
        Crée ou met à jour un article basé sur le couple (veille_id, URL).

        Scopé PAR VEILLE : un article déjà présent dans une AUTRE veille n'est
        plus écrasé/volé — on crée une ligne distincte pour la veille courante.
        """
        result = await db.execute(
            select(Article).filter(
                Article.veille_id == article_data["veille_id"],
                Article.source_url == article_data["source_url"],
            )
        )
        db_article = result.scalars().first()
        
        filtered_data = {k: v for k, v in article_data.items() if hasattr(Article, k) and k not in ['id', 'scraping_date']}
        
        if 'analysis' in filtered_data and isinstance(filtered_data['analysis'], ArticleAnalysis):
            filtered_data['analysis'] = filtered_data['analysis'].model_dump()
        
        if db_article:
            for key, value in filtered_data.items():
                setattr(db_article, key, value)
            print(f"Mise à jour de l'article : {db_article.source_url}")
        else:
            if 'veille_id' not in filtered_data:
                raise ValueError("veille_id est requis pour la création d'un article.")

            db_article = Article(**filtered_data, scraping_date=func.now())
            db.add(db_article)
            print(f"Création d'un nouvel article : {db_article.source_url}")
            
        await db.commit()
        await db.refresh(db_article)
        return db_article

    async def delete(self, db: AsyncSession, article_id: int) -> Optional[int]:
        stmt = delete(Article).where(Article.id == article_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount

    async def delete_all(self, db: AsyncSession) -> int:
        result = await db.execute(delete(Article))
        deleted_rows_count = result.rowcount
        await db.commit()
        print(f"INFO: Tous les {deleted_rows_count} articles ont été supprimés de la base de données.")
        return deleted_rows_count
    
    # --- Fonctions spécialisées (adaptées) ---

    async def get_articles_without_cluster(self, db: AsyncSession, limit: int = 500) -> List[Article]:
        stmt = select(Article).where(
            Article.status == ArticleStatus.PROCESSED,
            Article.cluster_id == None, 
            Article.analysis.is_not(None) 
        ).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_clusterable_articles(self, db: AsyncSession, veille_id: int, limit: int = 1000) -> List[Article]:
        """
        Articles d'une veille éligibles au clustering v2 : PROCESSED, analysés,
        et pas encore rattachés à un cluster (cluster_id NULL — typiquement
        après purge des clusters non publiés).
        """
        stmt = (
            select(Article)
            .where(
                Article.veille_id == veille_id,
                Article.status == ArticleStatus.PROCESSED,
                Article.cluster_id.is_(None),
                Article.analysis.is_not(None),
            )
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def assign_cluster(self, db: AsyncSession, article_ids: List[int], cluster_id: int) -> int:
        """Rattache en masse une liste d'articles à un cluster (UPDATE unique)."""
        if not article_ids:
            return 0
        result = await db.execute(
            update(Article).where(Article.id.in_(article_ids)).values(cluster_id=cluster_id)
        )
        await db.commit()
        return result.rowcount or 0

    async def get_articles_needing_pertinence(self, db: AsyncSession, limit: int = 500) -> List[Article]:
        stmt = select(Article).where(
            Article.cluster_id.isnot(None), 
            Article.pertinence_cluster.is_(None)
        ).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_neutral_summaries_by_cluster_id(self, db: AsyncSession, cluster_id: int) -> str:
        query = (
            select(Article.analysis['resume_neutre']) 
            .filter(Article.cluster_id == cluster_id) 
            .filter(Article.analysis.is_not(None))
        )
        result = await db.execute(query)
        summaries = result.scalars().all()
        return " ".join(summary for summary in summaries if summary)
    
    async def get_image_for_cluster_by_id(self, db: AsyncSession, cluster_id: int) -> Optional[List[str]]:
        """
        Récupère les URLs d'images de l'article le plus pertinent (score via JSON) d'un cluster.
        """
        query = (
            select(Article.image_urls)
            .filter(
                Article.cluster_id == cluster_id,
                Article.image_urls.isnot(None),
                Article.analysis.isnot(None)
            )
            .order_by(desc(Article.analysis['score_pertinence'].as_integer()))
            .limit(1)
        )
        result = await db.execute(query)
        image_urls_list = result.scalars().first()
        return image_urls_list

    async def get_images_for_cluster_by_id(self, db: AsyncSession, cluster_id: int, score_min: int = 0) -> List[ImageInfo]:
        """
        Récupère les images pertinentes (score via JSON) pour un cluster.
        """
        query = (
            select(Article.image_urls, Article.analysis['score_pertinence'].as_integer(), Article.title, Article.id)
            .filter(
                Article.cluster_id == cluster_id,
                Article.image_urls.isnot(None),
                Article.analysis['score_pertinence'].as_integer() >= score_min,
            )
            .order_by(desc(Article.analysis['score_pertinence'].as_integer()))
        )
        result = await db.execute(query)
        
        all_images_info: List[ImageInfo] = []
        for article_image_urls, score, title, article_id in result.all():
            if article_image_urls:
                for url in article_image_urls:
                    if url and isinstance(url, str) and not any(ext in url.lower() for ext in ['facebook.com/tr', 'pixel.gif', 'tr.gif', 'noscript=1']):
                        all_images_info.append(ImageInfo(
                            image_url=url,
                            score_pertinence=score,
                            article_title=title,
                            article_id=article_id
                        ))
        
        all_images_info.sort(key=lambda x: x.score_pertinence if x.score_pertinence is not None else 0, reverse=True)
        return all_images_info[:20]


crud_article = CRUDArticle()
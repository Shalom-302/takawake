# backend/app/crud/crud_veille.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, desc, case
from typing import List, Optional
from sqlalchemy import update
from ..models import veille as veille_model
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List


# --- Fonctions de Lecture (Read) ---
async def get_article_by_id(db: AsyncSession, article_id: int) -> Optional[veille_model.Article]:
    """Récupère un article par sa clé primaire (ID)."""
    result = await db.execute(select(veille_model.Article).filter(veille_model.Article.id == article_id))
    return result.scalars().first()

async def get_articles(
    db: AsyncSession,
    published: Optional[bool] = None,
    score_min: Optional[int] = None,
    cluster: Optional[str] = None,
    day_category: Optional[str] = None,
    order_by_publication_date: Optional[bool] = True
) -> List[veille_model.Article]:
    """
    Récupère une liste d'articles avec filtres.
    Peut trier par date de publication (du plus récent au plus ancien) ou par score de pertinence.
    """
    query = select(veille_model.Article)
    if published is not None:
        query = query.filter(veille_model.Article.published == published)
    if cluster is not None:
        query = query.filter(veille_model.Article.sujet_cluster == cluster)
    if score_min is not None:
        query = query.filter(veille_model.Article.score_pertinence >= score_min)
    if day_category is not None:
        query = query.filter(veille_model.Article.day_category == day_category)
    
    if order_by_publication_date:
        query = query.order_by(desc(veille_model.Article.publication_date))
    else:
        query = query.order_by(desc(veille_model.Article.score_pertinence))
        
    result = await db.execute(query)
    articles_sequence = result.scalars().all()
    return list(articles_sequence)

async def get_articles_without_cluster(db: AsyncSession) -> List[veille_model.Article]:
    """Récupère tous les articles où le sujet_cluster est NULL ou une chaîne vide."""
    query = select(veille_model.Article).filter((veille_model.Article.sujet_cluster == None) | (veille_model.Article.sujet_cluster == ''))
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_articles_needing_pertinence(db: AsyncSession) -> List[veille_model.Article]:
    """
    Récupère les articles qui ont un cluster mais pas encore de justification de pertinence.
    """
    query = select(veille_model.Article).filter(
        (veille_model.Article.sujet_cluster.isnot(None)) &
        (veille_model.Article.sujet_cluster != '') &
        (veille_model.Article.pertinence_cluster.is_(None))
    )
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_neutral_summaries_by_cluster(db: AsyncSession, cluster_name: str) -> str:
    """
    Récupère les résumés neutres de tous les articles d'un cluster
    et les retourne en une seule chaîne de caractères.
    """
    # Cible directement la clé 'resume_neutre' dans la colonne JSON 'analysis'
    query = (
        select(veille_model.Article.analysis['resume_neutre'])
        .filter(veille_model.Article.sujet_cluster == cluster_name)
        .filter(veille_model.Article.analysis.isnot(None))
    )
    result = await db.execute(query)
    summaries = result.scalars().all()

    # Filtrer les résumés qui pourraient être None et les joindre.
    return " ".join(summary for summary in summaries if summary)

async def get_summary_article_by_cluster(db: AsyncSession, cluster_name: str) -> Optional[veille_model.Article]:
    """
    Récupère l'article de synthèse pour un cluster et y attache les images des autres articles du même cluster.
    """
    # Étape 1: Récupérer l'article de synthèse
    summary_query = select(veille_model.Article).filter(
        veille_model.Article.sujet_cluster == cluster_name,
        veille_model.Article.source == "Kaapi AI"
    )
    result = await db.execute(summary_query)
    summary_article = result.scalars().first()

    if not summary_article:
        return None

    # Initialisation pour garantir que le champ n'est jamais None
    summary_article.image_urls = []

    # Étape 2: Récupérer toutes les listes d'URLs d'images du cluster
    images_query = select(veille_model.Article.image_urls).filter(
        veille_model.Article.sujet_cluster == cluster_name,
        veille_model.Article.image_urls.isnot(None)
    )
    image_results = await db.execute(images_query)
    all_image_lists = image_results.scalars().all()

    # Étape 3: Aplatir la liste des listes et garantir l'unicité
    unique_images = set()
    for image_list in all_image_lists:
        if image_list:
            for url in image_list:
                if url and url.strip():
                    unique_images.add(url.strip())
    
    # Étape 4: Attacher la liste d'images à l'article de synthèse
    summary_article.image_urls = list(unique_images)

    return summary_article

async def get_slides_by_cluster(db: AsyncSession, cluster_name: str) -> Optional[List[dict]]:
    """
    Récupère les slides de l'article de synthèse pour un cluster spécifique.
    """
    summary_article = await get_summary_article_by_cluster(db, cluster_name)
    if summary_article:
        return summary_article.slides
    return None

async def get_image_for_cluster(db: AsyncSession, cluster_name: str) -> Optional[List[str]]:
    """
    Récupère la liste des URLs d'images de l'article le plus pertinent d'un cluster.
    """
    query = (
        select(veille_model.Article.image_urls)
        .filter(
            veille_model.Article.sujet_cluster == cluster_name,
            veille_model.Article.image_urls.isnot(None),
            veille_model.Article.score_pertinence.isnot(None),
            # On s'assure que la liste n'est pas vide. La syntaxe peut varier selon le dialecte SQL.
            # Pour PostgreSQL avec JSONB, on peut utiliser des opérateurs spécifiques si besoin.
            # Ici, on se contente de vérifier que le champ n'est pas NULL.
        )
        .order_by(desc(veille_model.Article.score_pertinence))
        .limit(1)
    )
    result = await db.execute(query)
    image_url = result.scalars().first()
    return image_url

async def get_images_for_cluster(db: AsyncSession, cluster_name: str, score_min: int) -> List[dict]:
    """
    Récupère une liste d'images pertinentes pour un cluster donné,
    filtrées par un score de pertinence minimum.
    """
    image_quality_case = case(
        (veille_model.Article.image_url.ilike('%.jpg%'), 1),
        (veille_model.Article.image_url.ilike('%.jpeg%'), 1),
        (veille_model.Article.image_url.ilike('%.png%'), 1),
        (veille_model.Article.image_url.ilike('%.webp%'), 1),
        else_=2
    )

    query = (
        select(
            veille_model.Article.image_url,
            veille_model.Article.score_pertinence,
            veille_model.Article.title
        )
        .filter(
            veille_model.Article.sujet_cluster == cluster_name,
            veille_model.Article.image_url.isnot(None),
            veille_model.Article.image_url != "",
            veille_model.Article.score_pertinence >= score_min,
            ~veille_model.Article.image_url.ilike('%facebook.com/tr%'),
            ~veille_model.Article.image_url.ilike('%pixel.gif%'),
            ~veille_model.Article.image_url.ilike('%tr.gif%'),
            ~veille_model.Article.image_url.ilike('%noscript=1%')
        )
        .order_by(image_quality_case, desc(veille_model.Article.score_pertinence))
    )
    result = await db.execute(query)
    images = result.all()
    
    return [
        {"image_url": url, "score_pertinence": score, "article_title": title}
        for url, score, title in images
    ]

# --- Fonctions d'Écriture (Create, Update, Delete) ---
async def create_or_update_article(db: AsyncSession, article_data: dict) -> veille_model.Article:
    """
    Crée un nouvel article ou met à jour un article existant basé sur son URL.
    Parfaitement compatible avec le modèle `Article` utilisant les dataclasses.
    """
    # On utilise `await` car la fonction `get_article_by_url` est asynchrone
    result = await db.execute(select(veille_model.Article).filter(veille_model.Article.url == article_data["url"]))
    db_article = result.scalars().first()
    
    # On prépare un dictionnaire contenant uniquement les champs valides pour le modèle
    valid_fields = {k: v for k, v in article_data.items() if hasattr(veille_model.Article, k)}

    if db_article:
        # --- MISE À JOUR ---
        # On met à jour chaque champ de l'objet existant.
        for key, value in valid_fields.items():
            setattr(db_article, key, value)
        print(f"Mise à jour de l'article : {db_article.url}")
    else:
        # --- CRÉATION ---
        # *** LA CORRECTION EST ICI ***
        # On crée l'objet en passant les arguments par mot-clé.
        # Comme le modèle `Article` a `id: Mapped[id_key] = mapped_column(init=False)`,
        # Python n'exigera pas de valeur pour `id` dans le constructeur.
        db_article = veille_model.Article(**valid_fields)
        db.add(db_article)
        print(f"Création d'un nouvel article : {db_article.url}")
        
    await db.commit()
    await db.refresh(db_article)
    return db_article

async def update_publish_status(db: AsyncSession, article_id: int, published: bool) -> Optional[veille_model.Article]:
    """
    Met à jour le statut de publication d'un article.
    """
    db_article = await get_article_by_id(db, article_id=article_id)
    if db_article:
        db_article.published = published
        await db.commit()
        await db.refresh(db_article)
    return db_article

async def update_slides_for_article(db: AsyncSession, article_id: int, slides: List[dict]) -> Optional[veille_model.Article]:
    """
    Met à jour le champ 'slides' d'un article spécifique.
    """
    db_article = await get_article_by_id(db, article_id=article_id)
    if db_article:
        db_article.slides = slides
        await db.commit()
        await db.refresh(db_article)
    return db_article


async def delete_all_articles(db: AsyncSession) -> int:
    """
    Supprime tous les articles de la table 'article'.
    """
    result = await db.execute(delete(veille_model.Article))
    deleted_rows_count = result.rowcount
    await db.commit()
    print(f"INFO: Tous les {deleted_rows_count} articles ont été supprimés de la base de données.")
    return deleted_rows_count



async def delete_summary_article_by_cluster(db: AsyncSession, cluster_name: str) -> int:
    """
    Supprime l'article de synthèse généré par l'IA pour un cluster spécifique.
    """
    result = await db.execute(delete(veille_model.Article).filter(veille_model.Article.sujet_cluster == cluster_name, veille_model.Article.source == "Kaapi AI"))
    deleted_rows_count = result.rowcount
    await db.commit()
    print(f"INFO: Tous les {deleted_rows_count} articles de synthèse ont été supprimés de la base de données.")
    return deleted_rows_count



async def delete_slides_by_cluster(db: AsyncSession, cluster_name: str) -> int:
    """
    Supprime UNIQUEMENT les slides des articles pour un cluster spécifique.
    Met la colonne 'slides' à NULL sans supprimer l'article.
    """
    result = await db.execute(
        update(veille_model.Article)
        .where(
            veille_model.Article.sujet_cluster == cluster_name,
            veille_model.Article.source == "Kaapi AI"
        )
        .values(slides=None)  # Met la colonne slides à NULL
    )
    updated_rows_count = result.rowcount
    await db.commit()
    print(f"INFO: Les slides ont été supprimés pour {updated_rows_count} articles du cluster '{cluster_name}'.")
    return updated_rows_count




async def get_distinct_clusters(db: AsyncSession) -> List[dict]:
    """
    Récupère chaque sujet de cluster unique avec la liste de toutes ses pertinences associées.
    Ignore les NULL et les chaînes vides.
    """
    query = (
        select(
            veille_model.Article.sujet_cluster,
            veille_model.Article.pertinence_cluster
        )
        .where(veille_model.Article.sujet_cluster.isnot(None))
        .where(veille_model.Article.sujet_cluster != "")
    )
    result = await db.execute(query)
    rows = result.all()

    # --- Regroupement logique ---
    clusters = {}
    for sujet, pertinence in rows:
        if not sujet:
            continue
        if sujet not in clusters:
            clusters[sujet] = []
        if pertinence and pertinence.strip():
            clusters[sujet].append(pertinence.strip())

    # --- Format final compatible avec Pydantic ---
    return [
        {"sujet_cluster": sujet, "pertinences": pertinences or []}
        for sujet, pertinences in clusters.items()
    ]

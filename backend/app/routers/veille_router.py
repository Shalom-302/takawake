from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from celery import Task
from typing import cast
from fastapi import status
from app.core.db import get_async_db
from app.crud import veille
from app.schemas import veille as veille_schema
from app.tasks.veille_tasks import run_veille_workflow_task, backfill_clusters_task, backfill_pertinence_task, generate_summary_article_task, generate_slides_task
from app.core.security import get_current_active_user


# router = APIRouter(dependencies=[Depends(get_current_active_user)])
router = APIRouter()

@router.post("/run", status_code=202, summary="Lancer une nouvelle veille en arrière-plan (Admin)")
def run_new_veille(
    query: str = Query(..., min_length=3, description="Le sujet de la veille, ex: 'Tendances Fintech'")
    # Note : cette route est maintenant `def` et non `async def` car elle est instantanée.
    # Elle n'a pas besoin de `Depends(get_async_db)` car elle ne touche pas à la DB.
):
    """
    Déclenche le processus de veille via Celery et répond immédiatement.
    Le travail lourd se fait en arrière-plan par un worker Celery.
    """
    try:
        print(f"Envoi de la tâche de veille pour '{query}' à Celery.")
        # On délègue le travail à Celery. `.delay()` envoie la tâche au broker (Redis).
        cast(Task,run_veille_workflow_task).delay(query)
        return {"message": "Tâche de veille lancée en arrière-plan. Les résultats seront disponibles via /articles dans ~30 minutes."}
    except Exception as e:
        # Gère le cas où le broker Celery/Redis est inaccessible
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=503, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.post("/backfill-clusters", status_code=202, summary="Étape 1: Assigner les clusters aux articles")
def run_backfill_clusters():
    """
    Déclenche une tâche de fond pour analyser les articles existants sans cluster
    et leur assigner un `sujet_cluster`. C'est la première étape du backfill.
    """
    try:
        print("Envoi de la tâche de backfill des clusters à Celery.")
        cast(Task, backfill_clusters_task).delay()
        return {"message": "Tâche de clustering lancée en arrière-plan."}
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=503, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.post("/backfill-pertinence", status_code=202, summary="Étape 2: Générer la pertinence pour chaque article")
def run_backfill_pertinence():
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
        raise HTTPException(status_code=503, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


from app.crud.crud_cluster import crud_cluster # Add this import

# ... other imports ...

@router.post("/clusters/{cluster_name}/generate-summary", status_code=202, summary="Étape 3: Générer un article de synthèse par cluster")
async def generate_cluster_summary(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel générer la synthèse."),
    db: AsyncSession = Depends(get_async_db) # Inject DB session
):
    """
    Déclenche une tâche de fond pour générer un article de synthèse basé sur tous les
    articles appartenant au cluster spécifié.
    """
    try:
        # Retrieve cluster by name
        db_cluster = await crud_cluster.get_by_title(db, title=cluster_name)
        if not db_cluster:
            raise HTTPException(status_code=404, detail=f"Cluster '{cluster_name}' non trouvé.")

        print(f"Envoi de la tâche de génération de synthèse pour le cluster '{cluster_name}' (ID: {db_cluster.id}) à Celery.")
        cast(Task, generate_summary_article_task).delay(db_cluster.id) # Pass cluster ID
        return {"message": f"Tâche de génération de synthèse pour le cluster '{cluster_name}' (ID: {db_cluster.id}) lancée en arrière-plan."}
    except HTTPException as http_e:
        raise http_e
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=503, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.post("/clusters/{cluster_name}/generate-slides", status_code=202, summary="Étape 4: Générer un carrousel de slides pour un cluster")
async def generate_cluster_slides(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel générer les slides."),
    db: AsyncSession = Depends(get_async_db) # Inject DB session
):
    """
    Déclenche une tâche de fond pour générer un carrousel de slides basé sur l'article
    de synthèse du cluster spécifié.
    """
    try:
        # Retrieve cluster by name
        db_cluster = await crud_cluster.get_by_title(db, title=cluster_name)
        if not db_cluster:
            raise HTTPException(status_code=404, detail=f"Cluster '{cluster_name}' non trouvé.")

        print(f"Envoi de la tâche de génération de slides pour le cluster '{cluster_name}' (ID: {db_cluster.id}) à Celery.")
        cast(Task, generate_slides_task).delay(db_cluster.id) # Pass cluster ID
        return {"message": f"Tâche de génération de slides pour le cluster '{cluster_name}' (ID: {db_cluster.id}) lancée en arrière-plan."}
    except HTTPException as http_e:
        raise http_e
    except Exception as e:
        print(f"ERREUR : Impossible de contacter le broker Celery. {e}")
        raise HTTPException(status_code=503, detail=f"Le service de tâches de fond est indisponible : {str(e)}")


@router.get("/articles", response_model=List[veille_schema.ArticleResponse], summary="Lister les articles analysés (Admin)")
async def get_articles(
    published: Optional[bool] = Query(None, description="Filtrer par statut de publication."),
    score_min: Optional[int] = Query(None, ge=1, le=10, description="Score de pertinence minimum."),
    cluster: Optional[str] = Query(None, description="Filtrer par sujet de cluster."),
    day_category: Optional[str] = Query(None, description="Filtrer par catégorie de jour (ex: 'Aujourd\'hui', 'Hier', 'Cette semaine', 'En semaine')."),
    order_by_publication_date: Optional[bool] = Query(True, description="Trier par date de publication (du plus récent au plus ancien)."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère les articles de la base de données. Rapide et sécurisé.
    """
    articles = await veille.get_articles(db=db, published=published, score_min=score_min, cluster=cluster, day_category=day_category, order_by_publication_date=order_by_publication_date)
    return articles


@router.get("/clusters", response_model=List[veille_schema.ClusterInfo], summary="Lister tous les sujets de cluster uniques avec leur pertinence")
async def get_clusters(db: AsyncSession = Depends(get_async_db)):
    """
    Récupère la liste de tous les sujets de cluster uniques pour peupler les filtres,
    en incluant la justification de la pertinence pour chaque cluster.
    """
    clusters = await veille.get_distinct_clusters(db=db)
    return clusters


@router.get("/clusters/{cluster_name}/summary", response_model=veille_schema.ArticleResponse, summary="Récupérer l'article de synthèse d'un cluster")
async def get_cluster_summary(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel récupérer la synthèse."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère l'article de synthèse généré par l'IA pour un cluster spécifique.
    """
    summary_article = await veille.get_summary_article_by_cluster(db, cluster_name)
    if not summary_article:
        raise HTTPException(status_code=404, detail="Aucun article de synthèse trouvé pour ce cluster.")
    return summary_article


@router.get("/clusters/{cluster_name}/slides", response_model=List[veille_schema.Slide], summary="Récupérer les slides d'un cluster")
async def get_cluster_slides(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel récupérer les slides."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère le carrousel de slides généré par l'IA pour un cluster spécifique.
    """
    slides = await veille.get_slides_by_cluster(db, cluster_name)
    if slides is None:
        raise HTTPException(status_code=404, detail="Aucun slide trouvé pour ce cluster. Avez-vous lancé la génération ?")
    return slides


@router.get("/clusters/{cluster_name}/image", response_model=List[str], summary="Récupérer les URLs d'images de l'article le plus pertinent pour un cluster")
async def get_cluster_image(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel récupérer l'image."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère la liste des URLs d'images de l'article le plus pertinent d'un cluster.
    """
    image_urls = await veille.get_image_for_cluster(db, cluster_name)
    if not image_urls:
        raise HTTPException(status_code=404, detail="Aucune image pertinente trouvée pour ce cluster.")
    return image_urls


@router.get("/clusters/{cluster_name}/images", response_model=List[veille_schema.ImageInfo], summary="Récupérer les images pertinentes pour un cluster")
async def get_cluster_images(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel récupérer les images."),
    score_min: int = Query(7, ge=1, le=10, description="Score de pertinence minimum pour les images."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Récupère une liste d'images pertinentes pour un cluster donné,
    filtrées par un score de pertinence minimum.
    """
    images = await veille.get_images_for_cluster(db, cluster_name, score_min)
    if not images:
        raise HTTPException(status_code=404, detail="Aucune image pertinente trouvée pour ce cluster avec le score spécifié.")
    return images

@router.post("/articles/{article_id}/publish", response_model=veille_schema.ArticleResponse, summary="Publier un article (Admin)")
async def publish_article(
    article_id: int,
    status: veille_schema.PublishStatusUpdate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Modifie le statut de publication d'un article. Rapide et sécurisé.
    """
    updated_article = await veille.update_publish_status(db, article_id=article_id, published=status.is_published)
    if not updated_article:
        raise HTTPException(status_code=404, detail="Article non trouvé.")
        
    if status.is_published:
        print(f"INFO: L'article {article_id} est maintenant marqué comme publié. Déclenchement de la diffusion...")
        # C'est ici que vous pourriez lancer une AUTRE tâche Celery pour la publication sociale.
        # from app.tasks.social import post_article_task
        # post_article_task.delay(article_id)

    return updated_article



@router.delete("/articles/all", status_code=status.HTTP_200_OK, summary="Supprimer tous les articles (Admin, DANGEREUX)")
async def delete_all_articles(
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime **tous** les articles de la base de données.
    
    **ATTENTION :** Cette opération est irréversible. Utilisez-la avec précaution,
    principalement pour le nettoyage en environnement de développement.
    """
    deleted_count = await veille.delete_all_articles(db=db)
    return {"message": f"{deleted_count} articles ont été supprimés avec succès."}


@router.delete("/clusters/{cluster_name}/summary", status_code=status.HTTP_200_OK, summary="Supprimer l'article de synthèse")
async def delete_summary_article_by_cluster(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel supprimer la synthèse."),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Supprime **l'article de synthèse** généré par l'IA pour un cluster spécifique.
    """
    deleted_count = await veille.delete_summary_article_by_cluster(db=db, cluster_name=cluster_name)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aucun article de synthèse trouvé pour ce cluster à supprimer.")
    return {"message": f"{deleted_count} articles de synthèse ont été supprimés avec succès."}


@router.delete("/clusters/{cluster_name}/slides", status_code=status.HTTP_200_OK, summary="Supprimer les slides")
async def delete_slides_cluster(
    cluster_name: str = Path(..., description="Le nom exact du cluster pour lequel supprimer les slides."),
    db: AsyncSession = Depends(get_async_db)

):
    """
    Supprime **les slides** générées par l'IA pour un cluster spécifique.
    """
    deleted_count = await veille.delete_slides_by_cluster(db=db, cluster_name=cluster_name)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aucune slide trouvée pour ce cluster à supprimer.")
    return {"message": f"{deleted_count} slides ont été supprimés avec succès."}
import asyncio
from app.core.celery import celery_app
from app.services import tekawake # Votre service de veille refactorisé
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings


# ============================================================
# 1️⃣ Tâche principale : exécuter un workflow de veille
# ============================================================
@celery_app.task(name="veille.run_workflow")
def run_veille_workflow_task(query: str):
    """
    Tâche Celery synchrone qui exécute un workflow de veille asynchrone.
    Elle crée et gère sa propre session de base de données.
    """
    async def async_workflow():
        print(f"--- Tâche Celery Démarrée : Veille pour '{query}' ---")

        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # Appelle la fonction de service refactorisée
                await tekawake.run_veille_workflow(db=session, query=query)

            print(f"--- Tâche de veille pour '{query}' terminée avec succès. ---")
            return {"status": "SUCCESS", "message": "Veille terminée."}
        except Exception as e:
            error_message = f"La tâche de veille a échoué pour la requête '{query}': {e}"
            print(f"--- ERREUR dans la Tâche Celery : {error_message} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session:
                await session.close()
                print("--- Session DB fermée proprement ---")
            await engine.dispose()

    return asyncio.run(async_workflow())


# ============================================================
# 2️⃣ Tâche secondaire : backfill des clusters
# ============================================================
@celery_app.task(name="veille.backfill_clusters")
def backfill_clusters_task():
    """
    Tâche Celery pour remplir les `cluster_id` manquants dans les articles
    et créer les clusters si nécessaire.
    """
    async def async_backfill():
        print("--- Tâche Celery Démarrée : Backfill des clusters ---")

        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # Appelle la fonction de service refactorisée
                await tekawake.backfill_clusters_service(db=session)
            print("--- Backfill terminé avec succès ---")
            return {"status": "SUCCESS"}
        except Exception as e:
            print(f"--- ERREUR dans la Tâche Celery de backfill : {e} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
                print("--- Session DB fermée proprement ---")
            await engine.dispose()

    return asyncio.run(async_backfill())


# ============================================================
# 3️⃣ Tâche tertiaire : backfill de la pertinence
# ============================================================
@celery_app.task(name="veille.backfill_pertinence")
def backfill_pertinence_task():
    """
    Tâche Celery pour générer la justification de pertinence pour les articles clusterisés.
    """
    async def async_backfill_pertinence():
        print("--- Tâche Celery Démarrée : Backfill de la pertinence ---")
        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # Appelle la fonction de service refactorisée
                await tekawake.backfill_pertinence_service(db=session)
            print("--- Backfill de pertinence terminé avec succès ---")
            return {"status": "SUCCESS"}
        except Exception as e:
            print(f"--- ERREUR dans la Tâche Celery de backfill de pertinence : {e} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
                print("--- Session DB fermée proprement ---")
            await engine.dispose()

    return asyncio.run(async_backfill_pertinence())

# =================================================================
# 4️⃣ Tâche de synthèse : générer un article par cluster
# =================================================================
@celery_app.task(name="veille.generate_summary_article")
def generate_summary_article_task(cluster_id: int): # <--- CHANGEMENT : cluster_id au lieu de cluster_name
    """
    Tâche Celery pour générer un article de synthèse pour un cluster donné.
    """
    async def async_generate_summary():
        print(f"--- Tâche Celery Démarrée : Génération d'un article de synthèse pour le cluster ID '{cluster_id}' ---")
        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # Appelle la fonction de service refactorisée avec cluster_id
                await tekawake.generate_article_by_cluster_belong(db=session, cluster_id=cluster_id)
            print(f"--- Génération d'article pour le cluster ID '{cluster_id}' terminée avec succès ---")
            return {"status": "SUCCESS"}
        except Exception as e:
            print(f"--- ERREUR dans la Tâche Celery de génération d'article : {e} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
                print("--- Session DB fermée proprement ---")
            await engine.dispose()

    return asyncio.run(async_generate_summary())

# =================================================================
# 5️⃣ Tâche de slides : générer un carrousel par article de synthèse
# =================================================================
@celery_app.task(name="veille.generate_slides")
def generate_slides_task(cluster_id: int): # <--- CHANGEMENT : cluster_id au lieu de cluster_name
    """
    Tâche Celery pour générer un carrousel de slides pour un cluster donné.
    """
    async def async_generate_slides():
        print(f"--- Tâche Celery Démarrée : Génération de slides pour le cluster ID '{cluster_id}' ---")
        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # Appelle la fonction de service refactorisée avec cluster_id
                await tekawake.generate_slides_for_summary_article(db=session, cluster_id=cluster_id)
            print(f"--- Génération de slides pour le cluster ID '{cluster_id}' terminée avec succès ---")
            return {"status": "SUCCESS"}
        except Exception as e:
            print(f"--- ERREUR dans la Tâche Celery de génération de slides : {e} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
                print("--- Session DB fermée proprement ---")
            await engine.dispose()

    return asyncio.run(async_generate_slides())
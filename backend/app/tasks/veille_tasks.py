import asyncio
from app.core.celery import celery_app
from app.services import tekawake as veille_service # <- Renommé de 'tekawake' à 'veille_service' pour plus de clarté
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings

# Nouveaux imports pour la gestion de l'état de Veille
from app.crud.crud_veille import crud_veille
from app.schemas.veille import VeilleCreate, VeilleUpdate # Importez VeilleUpdate
from app.models.veille import VeilleStatus


# ============================================================
# 1️⃣ Tâche principale : exécuter un workflow de veille
# ============================================================
@celery_app.task(name="veille.run_workflow")
def run_veille_workflow_task(query: str):
    """
    Tâche Celery qui orchestre le workflow de veille.
    1. Crée un objet Veille pour le suivi.
    2. Met son statut à PENDING.
    3. Lance le service de scraping/analyse.
    4. Gère les états SUCCESS ou FAILED.
    """
    async def async_workflow():
        print(f"--- Tâche Celery Démarrée : Veille pour '{query}' ---")

        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        veille_id = None
        session = None
        try:
            async with AsyncSessionFactory() as session:
                # 1. Créer la session de veille pour obtenir un ID et définir le statut PENDING
                veille_create_data = VeilleCreate(prompt=query)
                new_veille = await crud_veille.create(session, veille_create_data)
                veille_id = new_veille.id
                
                # Mettre à jour le statut initial à PENDING (même si le default est PENDING, c'est pour être explicite)
                await crud_veille.update(session, veille_id=veille_id, veille_in=VeilleUpdate(status=VeilleStatus.PENDING))
                print(f"Veille ID:{veille_id} créée avec statut PENDING.")
                
                # 2. Lancer le workflow avec l'ID (veille_service gérera la mise à jour finale de SUCCESS/FAILED)
                await veille_service.run_veille_workflow(db=session, query=query, veille_id=veille_id)

            print(f"--- Tâche de veille pour '{query}' (ID:{veille_id}) terminée avec succès. ---")
            return {"status": "SUCCESS", "message": "Veille terminée."}

        except Exception as e:
            error_message = f"La tâche de veille (ID:{veille_id}) a échoué pour la requête '{query}': {e}"
            print(f"--- ERREUR dans la Tâche Celery : {error_message} ---")
            
            # Le service veille_service.run_veille_workflow est censé mettre à jour le statut FAILED.
            # Cependant, si une erreur se produit AVANT ou PENDANT l'appel au service,
            # ou si le service échoue à mettre à jour, cette partie rattrape.
            if veille_id and session:
                try:
                    # On tente de mettre à jour si ce n'est pas déjà fait par le service
                    # On ne vérifie pas l'état précédent car c'est une tâche Celery catch-all
                    await crud_veille.update(session, veille_id=veille_id, veille_in=VeilleUpdate(status=VeilleStatus.FAILED, status_message=str(e)))
                    print(f"Veille ID:{veille_id} mise à jour avec le statut FAILED par la tâche Celery.")
                except Exception as db_error:
                    print(f"--- ERREUR CRITIQUE : Impossible de mettre à jour le statut de la veille ID:{veille_id} : {db_error} ---")

            return {"status": "FAILURE", "error": str(e)}
        
        finally:
            if session:
                await session.close()
            await engine.dispose()
            print("--- Session DB et engine disposés proprement ---")

    return asyncio.run(async_workflow())


# ============================================================
# 2️⃣ NOUVELLE TÂCHE : Orchestrateur de Backfill Complet
# ============================================================
@celery_app.task(name="veille.run_full_backfill")
def run_full_backfill_task():
    """
    Tâche Celery qui orchestre l'exécution séquentielle du backfill des clusters
    et du backfill de la pertinence.
    """
    async def async_full_backfill():
        print("--- Tâche Celery Démarrée : Backfill Complet Orchestré ---")

        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # CORRECTION : Appelle la fonction de service avec le bon nom
                await veille_service.run_full_backfill_service(db=session)
            print("--- Backfill Complet terminé avec succès ---")
            return {"status": "SUCCESS", "message": "Backfill complet terminé."}
        except Exception as e:
            error_message = f"La tâche Celery de backfill complet a échoué: {e}"
            print(f"--- ERREUR dans la Tâche Celery de backfill complet : {error_message} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
                print("--- Session DB fermée proprement ---")
            await engine.dispose()

    return asyncio.run(async_full_backfill())


# =================================================================
# 3️⃣ NOUVELLE TÂCHE : Orchestrateur de Génération de Contenu de Cluster
# =================================================================
@celery_app.task(name="veille.generate_cluster_content")
def generate_cluster_content_task(cluster_id: int):
    """
    Tâche Celery qui orchestre la génération de l'article de synthèse et des slides
    pour un cluster donné.
    """
    async def async_generate_content():
        print(f"--- Tâche Celery Démarrée : Génération de contenu pour le cluster ID '{cluster_id}' ---")
        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # CORRECTION : Appelle la fonction de service avec le bon nom
                await veille_service.generate_cluster_content_service(db=session, cluster_id=cluster_id)
            print(f"--- Génération de contenu pour le cluster ID '{cluster_id}' terminée avec succès ---")
            return {"status": "SUCCESS", "message": "Génération de contenu du cluster terminée."}
        except Exception as e:
            error_message = f"La tâche Celery de génération de contenu pour le cluster ID '{cluster_id}' a échoué: {e}"
            print(f"--- ERREUR dans la Tâche Celery de génération de contenu : {error_message} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
                print("--- Session DB fermée proprement ---")
            await engine.dispose()

    return asyncio.run(async_generate_content())

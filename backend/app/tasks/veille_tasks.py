import asyncio
from typing import Optional
from app.core.celery import celery_app
from app.services import tekawake as veille_service # <- Renommé de 'tekawake' à 'veille_service' pour plus de clarté
from app.services.llm_factory import OLLAMA_MODEL_OVERRIDE
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
def run_veille_workflow_task(
    query: str,
    llm_provider: str = "deepseek",
    ollama_model: Optional[str] = None,
):
    """
    Tâche Celery qui orchestre le workflow de veille.
    1. Crée un objet Veille pour le suivi.
    2. Met son statut à PENDING.
    3. Lance le service de scraping/analyse.
    4. Gère les états SUCCESS ou FAILED.

    `ollama_model` n'a d'effet que si `llm_provider == "ollama"` — il surcharge
    settings.OLLAMA_LLM_MODEL pour cette task uniquement (via ContextVar).
    """
    async def async_workflow():
        # ContextVar.set() dans une coro lancée par asyncio.run() reste scopé
        # à cette task — pas de fuite entre tasks Celery successives.
        if ollama_model:
            OLLAMA_MODEL_OVERRIDE.set(ollama_model)
        print(f"--- Tâche Celery Démarrée : Veille pour '{query}' (LLM: {llm_provider}{', model=' + ollama_model if ollama_model else ''}) ---")

        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        veille_id = None
        session = None
        try:
            async with AsyncSessionFactory() as session:
                # 1. Créer la session de veille pour obtenir un ID et définir le statut PENDING
                veille_create_data = VeilleCreate(prompt=query, llm_provider=llm_provider)
                new_veille = await crud_veille.create(session, veille_create_data)
                veille_id = new_veille.id

                # Mettre à jour le statut initial à PENDING (même si le default est PENDING, c'est pour être explicite)
                await crud_veille.update(session, veille_id=veille_id, veille_in=VeilleUpdate(status=VeilleStatus.PENDING))
                print(f"Veille ID:{veille_id} créée avec statut PENDING.")

                # 2. Lancer le workflow avec l'ID (veille_service gérera la mise à jour finale de SUCCESS/FAILED)
                await veille_service.run_veille_workflow(db=session, query=query, veille_id=veille_id, llm_provider=llm_provider)

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
def run_full_backfill_task(
    llm_provider: str = "deepseek",
    veille_id: Optional[int] = None,
    ollama_model: Optional[str] = None,
):
    """
    Tâche Celery qui orchestre l'exécution séquentielle du backfill des clusters
    et du backfill de la pertinence.

    veille_id fourni → ne traite que cette veille ; None → toutes les veilles.
    """
    async def async_full_backfill():
        if ollama_model:
            OLLAMA_MODEL_OVERRIDE.set(ollama_model)
        print(f"--- Tâche Celery Démarrée : Backfill Complet Orchestré (LLM: {llm_provider}{', model=' + ollama_model if ollama_model else ''}, veille: {veille_id or 'toutes'}) ---")

        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # CORRECTION : Appelle la fonction de service avec le bon nom
                await veille_service.run_full_backfill_service(db=session, llm_provider=llm_provider, veille_id=veille_id)
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


# ============================================================
# 3️⃣ TÂCHE : Ré-indexation (vectorisation) des articles d'une veille
# ============================================================
@celery_app.task(name="veille.reindex_articles")
def reindex_articles_task(veille_id: int):
    """
    (Re)vectorise dans Qdrant les articles PROCESSED d'une veille existante.

    À lancer quand une veille a des articles mais aucun vecteur (indexation
    initiale échouée) → indispensable avant de pouvoir clusteriser.
    """
    async def async_reindex():
        print(f"--- Tâche Celery Démarrée : Ré-indexation des articles (veille: {veille_id}) ---")
        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                count = await veille_service.reindex_articles_for_veille(db=session, veille_id=veille_id)
            print(f"--- Ré-indexation veille {veille_id} terminée : {count} vecteur(s) upserté(s) ---")
            return {"status": "SUCCESS", "indexed": count}
        except Exception as e:
            print(f"--- ERREUR ré-indexation veille {veille_id} : {e} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
            await engine.dispose()

    return asyncio.run(async_reindex())


# =================================================================
# 3️⃣ NOUVELLE TÂCHE : Orchestrateur de Génération de Contenu de Cluster
# =================================================================
@celery_app.task(name="veille.generate_cluster_content")
def generate_cluster_content_task(
    cluster_id: int,
    llm_provider: str = "deepseek",
    ollama_model: Optional[str] = None,
):
    """
    Tâche Celery qui orchestre la génération de l'article de synthèse et des slides
    pour un cluster donné.
    """
    async def async_generate_content():
        if ollama_model:
            OLLAMA_MODEL_OVERRIDE.set(ollama_model)
        print(f"--- Tâche Celery Démarrée : Génération de contenu pour le cluster ID '{cluster_id}' (LLM: {llm_provider}{', model=' + ollama_model if ollama_model else ''}) ---")
        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                # CORRECTION : Appelle la fonction de service avec le bon nom
                await veille_service.generate_cluster_content_service(db=session, cluster_id=cluster_id, llm_provider=llm_provider)
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


# =================================================================
# 4️⃣ TÂCHE : Ré-illustration des slides d'un cluster (Unsplash)
# =================================================================
@celery_app.task(name="veille.regenerate_slide_images")
def regenerate_slide_images_task(
    cluster_id: int,
    llm_provider: str = "deepseek",
    ollama_model: Optional[str] = None,
):
    """
    Tâche Celery qui ré-illustre les slides d'un cluster via Unsplash (requête
    dérivée du texte de chaque slide par le LLM).
    """
    async def async_regenerate():
        if ollama_model:
            OLLAMA_MODEL_OVERRIDE.set(ollama_model)
        print(f"--- Tâche Celery Démarrée : Ré-illustration des slides du cluster ID '{cluster_id}' (LLM: {llm_provider}) ---")
        engine = create_async_engine(settings.ASYNC_DB_URL, echo=False, future=True)
        AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

        session = None
        try:
            async with AsyncSessionFactory() as session:
                await veille_service.regenerate_slide_images_service(db=session, cluster_id=cluster_id, llm_provider=llm_provider)
            print(f"--- Ré-illustration des slides du cluster ID '{cluster_id}' terminée ---")
            return {"status": "SUCCESS", "message": "Images des slides régénérées."}
        except Exception as e:
            print(f"--- ERREUR ré-illustration slides cluster ID '{cluster_id}' : {e} ---")
            return {"status": "FAILURE", "error": str(e)}
        finally:
            if session is not None:
                await session.close()
            await engine.dispose()

    return asyncio.run(async_regenerate())

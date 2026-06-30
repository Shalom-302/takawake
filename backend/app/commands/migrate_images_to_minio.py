"""
Migration one-shot : rapatrie les images des clusters existants vers MinIO.

Parcourt tous les clusters et pousse dans MinIO :
  - cover_image_url (+ snapshot cover_image_url_ai)
  - slides[].image_url (+ snapshot slides_ai[].image_url)

Sources prises en charge (cf. app/services/storage.py) :
  - anciens uploads disque servis sous {API_PREFIX}/uploads/<name>
  - URLs distantes http(s) (Unsplash, images d'articles scrapées)

Idempotent : une URL déjà servie par notre stockage est ignorée → le script
peut être relancé sans dupliquer. Best-effort : une image qui échoue (404,
fichier disque absent…) garde son URL d'origine et n'interrompt pas la migration.

Usage (dans le conteneur api) :
    python -m app.commands.migrate_images_to_minio
    python -m app.commands.migrate_images_to_minio --dry-run
    python -m app.commands.migrate_images_to_minio --limit 50
"""

import argparse
import asyncio
import logging

from sqlalchemy import update
from sqlalchemy.future import select

from app.core.db import AsyncSessionFactory
# Enregistre TOUT le graphe de modèles SQLAlchemy (User↔PushSubscription, etc.)
# avant la 1re requête : en commande standalone (sans app.main), un import partiel
# déclencherait "expression 'PushSubscription' failed to locate a name".
import app.models  # noqa: F401
from app.models.veille import Cluster
from app.services import storage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migrate_images")


def _slides_urls(slides) -> list:
    """URLs d'images présentes dans une liste de slides (dicts)."""
    if not slides:
        return []
    return [s.get("image_url") for s in slides if isinstance(s, dict)]


async def _migrate_cluster(cid: int, *, dry_run: bool) -> bool:
    """Migre un cluster. Retourne True si au moins une image a (été) migré(e)."""
    async with AsyncSessionFactory() as db:
        cluster = (
            await db.execute(select(Cluster).where(Cluster.id == cid))
        ).scalars().first()
        if cluster is None:
            return False

        # On capture les valeurs AVANT tout stockage : store_bytes() commit sur
        # la session et expirerait l'instance (lazy-load interdit en async).
        cover = cluster.cover_image_url
        cover_ai = cluster.cover_image_url_ai
        slides = cluster.slides
        slides_ai = cluster.slides_ai

        # --- Dry-run : strictement read-only (aucun download, aucun stockage) ---
        if dry_run:
            candidates = [cover, cover_ai, *_slides_urls(slides), *_slides_urls(slides_ai)]
            to_migrate = sum(1 for u in candidates if storage.would_migrate(u))
            if to_migrate:
                logger.info("[dry-run] cluster %s : %d image(s) à migrer.", cid, to_migrate)
            return to_migrate > 0

        # --- Mode réel : rapatriement effectif dans MinIO ---
        new_cover = await storage.ensure_url_stored(db, cover)
        new_cover_ai = await storage.ensure_url_stored(db, cover_ai)
        new_slides = await storage.ensure_slides_stored(db, slides)
        new_slides_ai = await storage.ensure_slides_stored(db, slides_ai)

        changed = (
            new_cover != cover
            or new_cover_ai != cover_ai
            or new_slides != slides
            or new_slides_ai != slides_ai
        )
        if not changed:
            return False

        # Écriture finale via UPDATE ciblé (instance déjà expirée par les commits
        # intermédiaires de store_bytes → on n'y touche plus directement).
        await db.execute(
            update(Cluster)
            .where(Cluster.id == cid)
            .values(
                cover_image_url=new_cover,
                cover_image_url_ai=new_cover_ai,
                slides=new_slides,
                slides_ai=new_slides_ai,
            )
        )
        await db.commit()
        logger.info("cluster %s : images migrées vers MinIO.", cid)
        return True


async def main(dry_run: bool, limit: int | None) -> None:
    async with AsyncSessionFactory() as db:
        query = select(Cluster.id).order_by(Cluster.id)
        if limit:
            query = query.limit(limit)
        ids = list((await db.execute(query)).scalars().all())

    logger.info("%d cluster(s) à examiner%s.", len(ids),
                " (dry-run)" if dry_run else "")
    migrated = 0
    for cid in ids:
        try:
            if await _migrate_cluster(cid, dry_run=dry_run):
                migrated += 1
        except Exception as e:  # noqa: BLE001 — un cluster KO ne bloque pas le reste
            logger.error("cluster %s : échec migration : %s", cid, e)

    logger.info("Terminé : %d/%d cluster(s) %s.", migrated, len(ids),
                "à migrer" if dry_run else "migrés")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migre les images des clusters vers MinIO.")
    parser.add_argument("--dry-run", action="store_true",
                        help="N'écrit rien, liste seulement ce qui serait migré.")
    parser.add_argument("--limit", type=int, default=None,
                        help="Limiter au N premiers clusters (test).")
    args = parser.parse_args()
    asyncio.run(main(dry_run=args.dry_run, limit=args.limit))

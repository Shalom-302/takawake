"""
Stockage des images de la veille dans MinIO (objet) avec métadonnées en Postgres.

Principe : les octets vont dans MinIO, Postgres ne garde qu'une ligne `StoredFile`
qui pointe dessus. On réutilise intégralement le provider MinIO du plugin
`file_storage` (aucune logique S3 dupliquée) et on sert les octets via la route
publique déjà montée :

    {API_PREFIX}/public/file-storage/files/{id}/preview

Servir par cette route (plutôt qu'une URL présignée MinIO) est *proxy-safe* : le
navigateur tape l'API, jamais `minio:9000` directement — on évite tout le casse-tête
endpoint interne vs public.

Tout est best-effort sur les échecs réseau : si MinIO ou un download échoue, on
renvoie l'URL d'origine inchangée plutôt que de casser la génération/édition
(même philosophie que services/slide_images.py).
"""

import io
import os
import re
import uuid
import logging
import mimetypes
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import urlparse, unquote

import httpx
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.plugins.file_storage.models import (
    StorageProvider,
    StoredFile,
    get_provider_instance,
)

logger = logging.getLogger(__name__)

# Préfixe d'objet dans le bucket pour ranger les images éditoriales de la veille.
_VEILLE_PREFIX = "veille"

# Fragment qui identifie une URL déjà servie par notre stockage (idempotence).
_INTERNAL_MARKER = "/public/file-storage/files/"

# Extensions d'images reconnues pour nommer proprement les objets.
_EXT_BY_MIME = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
}


# --------------------------------------------------------------------------- #
# Provider MinIO par défaut (auto-créé au 1er usage à partir des settings)
# --------------------------------------------------------------------------- #
async def get_or_create_default_minio_provider(db: AsyncSession) -> StorageProvider:
    """
    Récupère le provider MinIO par défaut en base, ou le crée à partir des
    settings (MINIO_*). Évite d'imposer une commande d'init manuelle : le 1er
    upload suffit à provisionner la config. Le bucket lui-même est créé par
    `initialize()` du provider au moment où on instancie le client.
    """
    result = await db.execute(
        select(StorageProvider).where(
            StorageProvider.provider_type == "minio",
            StorageProvider.is_default.is_(True),
        )
    )
    provider = result.scalars().first()
    if provider:
        return provider

    # Pas de provider par défaut → on le crée depuis la config.
    provider = StorageProvider(
        name="MinIO Storage",
        provider_type="minio",
        is_default=True,
        is_active=True,
        bucket_name=settings.MINIO_BUCKET,
        region=None,
        endpoint_url=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        config_options={
            "secure": settings.MINIO_SECURE,
            "public_endpoint_url": settings.MINIO_PUBLIC_ENDPOINT or None,
        },
    )
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    logger.info("Provider MinIO par défaut créé (bucket '%s').", settings.MINIO_BUCKET)
    return provider


# --------------------------------------------------------------------------- #
# Helpers internes
# --------------------------------------------------------------------------- #
def _safe_name(name: str) -> str:
    """Nettoie un nom de fichier pour servir de clé d'objet."""
    name = os.path.basename(name or "")
    name = re.sub(r"[^\w\-.]", "_", name)
    return name or "image"


def _guess_ext(content_type: Optional[str], fallback_name: str = "") -> str:
    """Extension à partir du content-type, repli sur le nom, puis .bin."""
    if content_type and content_type in _EXT_BY_MIME:
        return _EXT_BY_MIME[content_type]
    ext = os.path.splitext(fallback_name)[1]
    if ext:
        return ext
    guessed = mimetypes.guess_extension(content_type or "") if content_type else None
    return guessed or ".bin"


def public_url_for(stored: StoredFile) -> str:
    """URL relative servie par l'API (proxy-safe), comme l'ancien /api/uploads/."""
    return f"{settings.API_PREFIX}/public/file-storage/files/{stored.id}/preview"


def is_internal_storage_url(url: Optional[str]) -> bool:
    """True si l'URL pointe déjà vers notre stockage (→ ne rien refaire)."""
    return bool(url) and _INTERNAL_MARKER in url


def would_migrate(url: Optional[str]) -> bool:
    """
    Prédicat *read-only* : True si `ensure_url_stored` rapatrierait cette URL dans
    MinIO (URL distante http(s) ou ancien upload local), False sinon (vide, déjà
    interne, data:, chemin non géré). Sert au dry-run sans aucun effet de bord.
    """
    if not url or is_internal_storage_url(url):
        return False
    if url.startswith("http://") or url.startswith("https://"):
        return True
    return _is_local_upload_url(url)


# --------------------------------------------------------------------------- #
# Écriture dans MinIO + ligne Postgres
# --------------------------------------------------------------------------- #
async def store_bytes(
    db: AsyncSession,
    content: bytes,
    *,
    original_filename: str,
    content_type: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> StoredFile:
    """
    Pousse `content` dans MinIO et crée la ligne `StoredFile` correspondante.
    Retourne le StoredFile (avec id) ; utiliser `public_url_for()` pour l'URL.
    """
    provider_row = await get_or_create_default_minio_provider(db)

    # Instanciation du client MinIO (bloquant : crée le bucket au besoin).
    provider = await run_in_threadpool(get_provider_instance, provider_row)

    content_type = content_type or mimetypes.guess_type(original_filename)[0] \
        or "application/octet-stream"
    ext = _guess_ext(content_type, original_filename)
    safe = _safe_name(original_filename)
    if not safe.lower().endswith(ext.lower()):
        safe = f"{safe}{ext}"
    storage_path = f"{_VEILLE_PREFIX}/{uuid.uuid4().hex}_{safe}"

    # Upload (bloquant) dans un threadpool pour ne pas bloquer la boucle async.
    await run_in_threadpool(
        provider.upload_file, io.BytesIO(content), storage_path, content_type
    )

    stored = StoredFile(
        provider_id=provider_row.id,
        filename=storage_path.split("/")[-1],
        original_filename=os.path.basename(original_filename) or safe,
        storage_path=storage_path,
        file_size=len(content),
        mime_type=content_type,
        file_metadata={"source": "veille", **(metadata or {})},
    )
    db.add(stored)
    await db.commit()
    await db.refresh(stored)
    return stored


async def store_bytes_url(db: AsyncSession, content: bytes, **kwargs) -> str:
    """Comme store_bytes mais renvoie directement l'URL preview."""
    stored = await store_bytes(db, content, **kwargs)
    return public_url_for(stored)


# --------------------------------------------------------------------------- #
# Récupération de la source (distant ou disque local) puis stockage
# --------------------------------------------------------------------------- #
async def _download_remote(url: str) -> Optional[tuple[bytes, Optional[str]]]:
    """Télécharge une URL distante. (bytes, content_type) ou None si échec."""
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.get(url, timeout=20.0)
            resp.raise_for_status()
        content_type = (resp.headers.get("content-type") or "").split(";")[0].strip()
        return resp.content, (content_type or None)
    except Exception as e:  # noqa: BLE001 — best-effort
        logger.warning("[storage] Échec download '%s': %s", url, e)
        return None


def _read_local_upload(url: str) -> Optional[tuple[bytes, Optional[str]]]:
    """Lit un fichier servi sous {API_PREFIX}/uploads/<name> depuis UPLOAD_DIR."""
    name = os.path.basename(urlparse(url).path)
    path = os.path.join(settings.UPLOAD_DIR, name)
    if not os.path.isfile(path):
        logger.warning("[storage] Fichier local introuvable: %s", path)
        return None
    try:
        with open(path, "rb") as fh:
            content = fh.read()
        return content, (mimetypes.guess_type(path)[0])
    except Exception as e:  # noqa: BLE001 — best-effort
        logger.warning("[storage] Échec lecture locale '%s': %s", path, e)
        return None


def _is_local_upload_url(url: str) -> bool:
    """
    True si l'URL est un ANCIEN upload disque servi sous /uploads/.

    Ne s'applique qu'aux chemins *relatifs* (ex. /api/uploads/abc.jpg). Une URL
    absolue http(s) n'est jamais un upload local — même si son chemin contient
    « /uploads/ » (typique de WordPress : /wp-content/uploads/...). Ce cas est
    traité en amont par la branche download distant.
    """
    if url.startswith("http://") or url.startswith("https://"):
        return False
    return "/uploads/" in url


async def ensure_url_stored(db: AsyncSession, url: Optional[str]) -> Optional[str]:
    """
    Garantit qu'une URL d'image pointe vers MinIO (via notre route preview).

    - vide / None / déjà interne  → renvoyée telle quelle (idempotent)
    - ancien upload disque /uploads/ → relue sur disque puis poussée dans MinIO
    - URL distante http(s) (Unsplash, image scrapée) → miroir dans MinIO
    - autre (data:, chemin inconnu) → renvoyée telle quelle

    Best-effort : en cas d'échec réseau/disque, renvoie l'URL d'origine.
    """
    if not url or is_internal_storage_url(url):
        return url

    fetched: Optional[tuple[bytes, Optional[str]]] = None
    original_name = os.path.basename(urlparse(url).path) or "image"
    original_name = unquote(original_name)

    # Ordre important : une URL absolue http(s) est TOUJOURS distante, même si
    # son chemin contient « /uploads/ » (cas WordPress). On teste donc le schéma
    # avant la détection d'upload local (qui ne vaut que pour les chemins relatifs).
    if url.startswith("http://") or url.startswith("https://"):
        fetched = await _download_remote(url)
    elif _is_local_upload_url(url):
        fetched = _read_local_upload(url)
    else:
        # data:, chemin relatif non géré, etc. → on ne touche pas.
        return url

    if not fetched or not fetched[0]:
        return url  # échec → on garde l'URL d'origine

    content, content_type = fetched
    try:
        stored = await store_bytes(
            db,
            content,
            original_filename=original_name,
            content_type=content_type,
            metadata={"mirrored_from": url},
        )
        return public_url_for(stored)
    except Exception as e:  # noqa: BLE001 — best-effort
        logger.warning("[storage] Échec stockage MinIO pour '%s': %s", url, e)
        return url


async def delete_stored_file(db: AsyncSession, file_id: int) -> bool:
    """
    Supprime une image stockée : l'objet dans MinIO + sa ligne `StoredFile`.
    Best-effort sur l'objet MinIO (si déjà absent, on supprime quand même la
    ligne). Retourne False si l'id n'existe pas.
    """
    stored = await db.get(StoredFile, file_id)
    if not stored:
        return False

    provider_row = await db.get(StorageProvider, stored.provider_id)
    if provider_row is not None:
        try:
            provider = await run_in_threadpool(get_provider_instance, provider_row)
            await run_in_threadpool(provider.delete_file, stored.storage_path)
        except Exception as e:  # noqa: BLE001 — best-effort sur l'objet
            logger.warning("[storage] Échec suppression objet MinIO '%s': %s",
                           stored.storage_path, e)

    await db.delete(stored)
    await db.commit()
    return True


async def ensure_slides_stored(
    db: AsyncSession, slides: Optional[Sequence[Dict[str, Any]]]
) -> Optional[List[Dict[str, Any]]]:
    """
    Applique ensure_url_stored à l'`image_url` de chaque slide (liste de dicts).
    Renvoie une nouvelle liste ; None/[] inchangés. Ne mute pas l'entrée.
    """
    if not slides:
        return slides
    out: List[Dict[str, Any]] = []
    for slide in slides:
        slide = dict(slide)  # copie défensive
        if slide.get("image_url"):
            slide["image_url"] = await ensure_url_stored(db, slide["image_url"])
        out.append(slide)
    return out

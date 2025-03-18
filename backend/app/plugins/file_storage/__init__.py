"""
File storage plugin for Kaapi

This plugin allows managing file storage with different providers:
- Local storage (file system)
- MinIO (compatible S3, for local development)
- Amazon S3
- Google Cloud Storage

It also includes image processing features:
- Generation of thumbnails
- Image optimization
- Image transformations (resizing, cropping, etc.)
"""

from fastapi import APIRouter

from .main import router as main_router
from .routes.folders import router as folders_router
from .routes.images import router as images_router

# Router principal grouping all sub-routers
router = APIRouter()

# Include all sub-routers
router.include_router(main_router)
router.include_router(folders_router)
router.include_router(images_router)

__all__ = ["router"]

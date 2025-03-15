"""
PWA Support Plugin for Kaapi

This plugin adds Progressive Web App capabilities to your Kaapi application:
- Web App Manifest management
- Service Worker for offline support
- Push Notifications
"""

from .main import get_router

# Call get_router() to obtain a FastAPI router
router = get_router()

__all__ = ["router"]

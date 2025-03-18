"""
Privacy Compliance Plugin for Kaapi

This plugin adds GDPR compliance and privacy management features
to your Kaapi application.
"""

__version__ = "1.0.0"

from .main import get_router

# Call get_router() to obtain a FastAPI router
router = get_router()

__all__ = ["router"]

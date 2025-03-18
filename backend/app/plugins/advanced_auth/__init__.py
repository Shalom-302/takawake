"""
Advanced Authentication Plugin
==============================

A comprehensive authentication system with support for multiple providers,
secure session management, and advanced security features.
"""
from typing import Dict, Any, Optional, List
import logging
from fastapi import FastAPI, Depends

from app.core.config import settings
from .routes import router

__version__ = "1.0.0"

logger = logging.getLogger(__name__)


def init_app(app: FastAPI, **kwargs) -> None:
    """
    Initialize the plugin and register its routes with the FastAPI app.
    
    Args:
        app: FastAPI application
        **kwargs: Additional initialization parameters
    """
    # Include the router
    app.include_router(router)
    
    logger.info("Advanced Authentication plugin initialized")
    
    # Register plugin with the registry if available
    try:
        from app.api.deps import get_plugin_registry
        from app.core.plugin import PluginRegistry
        
        registry: PluginRegistry = kwargs.get("plugin_registry")
        if registry:
            registry.register_plugin(
                name="advanced_auth",
                version=__version__,
                description="Advanced authentication plugin with multiple providers",
                routes=router.routes
            )
    except (ImportError, AttributeError):
        # Plugin registry not available, just continue
        pass

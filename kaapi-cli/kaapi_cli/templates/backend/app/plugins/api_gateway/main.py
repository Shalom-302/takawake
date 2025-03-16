"""
API Gateway plugin for secure API exposures.

Serves as a secure gateway for exposing internal functionality to external
applications via authenticated APIs with comprehensive documentation.
"""

import logging
from typing import Optional, Dict, Any, List, Callable

from fastapi import FastAPI, Depends, APIRouter
from sqlalchemy.orm import Session

from app.core.db import engine, SessionLocal
from app.core.db import get_db

from .models.api_key import ApiKeyDB
from .models.audit import ApiAuditLogDB
from .models.rate_limit import RateLimitDB
from .routes.registry import RouteRegistry
from .config import ApiGatewayConfig
from .router import ApiGatewayRouter
from .security.auth import ApiKeyAuth
from .docs.openapi import OpenAPIGenerator

# Setup logging
logger = logging.getLogger(__name__)


class ApiGatewayPlugin:
    """
    Plugin for exposing secure API endpoints to external applications with
    authentication, authorization, rate limiting, and comprehensive documentation.
    """
    
    name = "api_gateway"
    
    def __init__(self):
        """Initialize the API Gateway plugin."""
        self.app = None
        self.router = None
        self.initialized = False
        self.tables_created = False
        self.config = ApiGatewayConfig()
    
    def initialize(self, app: FastAPI, **config) -> None:
        """
        Initialize the API Gateway plugin.
        
        Args:
            app: FastAPI application
            **config: Plugin configuration
        """
        if self.initialized:
            logger.info("API Gateway plugin already initialized")
            return
        
        self.app = app
        
        # Load configuration
        for key, value in config.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)
        
        # Create database tables
        self._create_tables()
        
        # Create API Gateway router
        self.router = ApiGatewayRouter(
            app=app,
            db_session=self._get_db_session,
            config=self.config
        )
        
        # Initialize the router (adds middleware, admin routes, etc.)
        self.router.initialize()
        
        logger.info("API Gateway plugin initialized")
        self.initialized = True
    
    def _create_tables(self) -> None:
        """Create database tables required by the plugin."""
        if self.tables_created:
            return
        
        # Create tables
        ApiKeyDB.__table__.create(bind=engine, checkfirst=True)
        ApiAuditLogDB.__table__.create(bind=engine, checkfirst=True)
        RateLimitDB.__table__.create(bind=engine, checkfirst=True)
        
        logger.info("API Gateway database tables created")
        self.tables_created = True
    
    def _get_db_session(self) -> Session:
        """
        Get a database session.
        
        Returns:
            SQLAlchemy database session
        """
        db = SessionLocal()
        try:
            return db
        finally:
            db.close()
    
    def register_api(
        self,
        router,
        namespace: str,
        version: Optional[str] = None,
        requires_api_key: bool = True,
        permissions: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> None:
        """
        Register an API router with the gateway.
        
        Args:
            router: FastAPI router to expose as an API
            namespace: Namespace for the API (e.g., 'users', 'payments')
            version: API version (defaults to config default_version)
            requires_api_key: Whether the API requires an API key
            permissions: List of permissions required for the API
            tags: OpenAPI tags for the API
        """
        if not self.initialized:
            logger.warning("Cannot register API: API Gateway plugin not initialized")
            return
        
        # Include the router in the API Gateway
        self.router.include_router(
            router=router,
            namespace=namespace,
            version=version,
            requires_api_key=requires_api_key,
            permissions=permissions,
            tags=tags
        )
        
        logger.info(f"Registered API: {namespace} (version: {version or self.config.default_version})")
    
    def require_api_key(
        self,
        permissions: Optional[List[str]] = None,
        optional: bool = False
    ) -> Callable:
        """
        Create a dependency that requires a valid API key with specific permissions.
        
        Args:
            permissions: List of required permissions (format: 'namespace:resource:action')
            optional: Whether the API key is optional
            
        Returns:
            FastAPI dependency function
        """
        if not self.initialized:
            logger.warning("API Gateway plugin not initialized")
            raise RuntimeError("API Gateway plugin not initialized")
        
        return self.router.require_api_key(
            permissions=permissions,
            optional=optional
        )
    
    def get_documentation(self, title: Optional[str] = None) -> Dict[str, Any]:
        """
        Get OpenAPI documentation for all registered API routes.
        
        Args:
            title: Custom title for the documentation
            
        Returns:
            OpenAPI schema as dictionary
        """
        if not self.initialized:
            logger.warning("API Gateway plugin not initialized")
            return {}
        
        return OpenAPIGenerator.generate_openapi_spec(
            title=title or self.config.api_title,
            description=self.config.api_description,
            version=self.config.api_version,
            app=self.app
        )
    
    def get_routes(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all registered API routes.
        
        Args:
            namespace: Optional namespace to filter by
            
        Returns:
            List of route metadata dictionaries
        """
        routes = []
        
        if namespace:
            route_metadata_list = RouteRegistry.get_routes_by_namespace(namespace)
        else:
            route_metadata_list = RouteRegistry.get_all_routes()
        
        for route in route_metadata_list:
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name,
                "namespace": route.namespace,
                "version": route.version,
                "permissions": route.permissions,
                "tags": route.tags,
                "deprecated": route.deprecated
            })
        
        return routes
    
    def get_namespaces(self) -> List[str]:
        """
        Get all registered API namespaces.
        
        Returns:
            List of namespace names
        """
        return RouteRegistry.get_all_namespaces()
    
    def get_versions(self, namespace: str) -> List[str]:
        """
        Get all versions for a namespace.
        
        Args:
            namespace: API namespace
            
        Returns:
            List of version strings
        """
        return RouteRegistry.get_versions(namespace)


# Create plugin instance
plugin = ApiGatewayPlugin()


# Standard plugin interface functions required by __init__.py

def initialize_plugin(app: FastAPI, **config) -> None:
    """
    Initialize the API Gateway plugin.
    
    Args:
        app: FastAPI application
        **config: Plugin configuration
    
    This function is used as the standard entry point for plugin initialization
    as expected by the Kaapi plugin system.
    """
    plugin.initialize(app, **config)


def get_plugin_info() -> Dict[str, Any]:
    """
    Get information about the API Gateway plugin.
    
    Returns:
        Plugin information dictionary
    """
    return {
        "name": "API Gateway",
        "description": "Secure API Gateway for exposing internal functionality to external applications",
        "version": "1.0.0",
        "author": "Kaapi",
        "license": "Same as Kaapi framework",
        "features": [
            "API Key Authentication",
            "Permission-based Authorization",
            "Rate Limiting",
            "Audit Logging",
            "OpenAPI Documentation",
            "IP and Origin Restrictions",
            "Admin Interface"
        ],
        "dependencies": [
            "fastapi",
            "sqlalchemy",
            "pydantic"
        ]
    }


def get_router() -> APIRouter:
    """
    Get the main API router for the plugin.
    
    Returns:
        FastAPI router with all API Gateway routes
    """
    if not plugin.initialized:
        raise RuntimeError("API Gateway plugin is not initialized")
    
    from .admin.routes import get_admin_router
    return get_admin_router(plugin.config)

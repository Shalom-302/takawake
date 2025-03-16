"""
Main module for KYC (Know Your Customer) plugin.

This plugin provides functionality for user identity verification,
with special support for regions with low infrastructure through
simplified KYC processes.
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, APIRouter, Depends

from app.core.db import get_db
from sqlalchemy.orm import Session

from .routes import (
    get_verification_router,
    get_profile_router,
    get_region_router,
    get_simplified_kyc_router,
    get_dashboard_router
)

from .utils.security import initialize_kyc_security, kyc_security

logger = logging.getLogger(__name__)

# Global variables
kyc_initialized = False

# Pre-initialize routers to avoid None returns
kyc_admin_router = APIRouter(prefix="/kyc/admin", tags=["KYC Admin"])
kyc_user_router = APIRouter(prefix="/kyc", tags=["KYC"])


def on_plugin_init(app: FastAPI, **kwargs):
    """
    Initialize the KYC plugin.
    
    Args:
        app: FastAPI application
        **kwargs: Additional arguments
    """
    global kyc_initialized, kyc_admin_router, kyc_user_router
    
    logger.info("Initializing KYC plugin")
    
    # Initialize security utilities
    initialize_kyc_security()
    
    # Clear existing routes if any (for reinitialization cases)
    if hasattr(kyc_admin_router, "routes"):
        kyc_admin_router.routes.clear()
    
    if hasattr(kyc_user_router, "routes"):
        kyc_user_router.routes.clear()
    
    # Add admin routes
    kyc_admin_router.include_router(
        get_dashboard_router(),
        prefix="/dashboard",
        tags=["KYC Dashboard"]
    )
    
    # Add user routes
    kyc_user_router.include_router(
        get_verification_router(),
        prefix="/verifications",
        tags=["KYC Verifications"]
    )
    
    kyc_user_router.include_router(
        get_profile_router(),
        prefix="/profiles",
        tags=["KYC Profiles"]
    )
    
    kyc_user_router.include_router(
        get_region_router(),
        prefix="/regions",
        tags=["KYC Regions"]
    )
    
    kyc_user_router.include_router(
        get_simplified_kyc_router(),
        prefix="/simplified",
        tags=["Simplified KYC"]
    )
    
    # Log initialization
    logger.info("KYC plugin initialized")
    kyc_initialized = True
    
    return {
        "status": "success",
        "message": "KYC plugin initialized"
    }


def on_plugin_shutdown(app: FastAPI, **kwargs):
    """
    Shutdown the KYC plugin.
    
    Args:
        app: FastAPI application
        **kwargs: Additional arguments
    """
    global kyc_initialized
    
    logger.info("Shutting down KYC plugin")
    
    # Perform any cleanup needed
    kyc_security.cleanup()
    
    # Log shutdown
    logger.info("KYC plugin shutdown complete")
    kyc_initialized = False
    
    return {
        "status": "success",
        "message": "KYC plugin shutdown"
    }


def on_db_migrate(db: Session, **kwargs):
    """
    Migrate the database for KYC plugin.
    
    Args:
        db: Database session
        **kwargs: Additional arguments
    """
    # This function is called during database migrations
    # You can perform any plugin-specific migrations here
    logger.info("Running KYC plugin migrations")
    
    return {
        "status": "success",
        "message": "KYC plugin migrations completed"
    }


def get_admin_router():
    """
    Get the KYC admin router.
    
    Returns:
        FastAPI router for KYC admin routes
    """
    global kyc_admin_router
    return kyc_admin_router


def get_api_router():
    """
    Get the KYC API router.
    
    Returns:
        FastAPI router for KYC API routes
    """
    global kyc_user_router
    return kyc_user_router


def get_plugin_info():
    """
    Get information about the KYC plugin.
    
    Returns:
        Dictionary with plugin information
    """
    return {
        "name": "KYC Plugin",
        "version": "1.0.0",
        "description": "Know Your Customer verification and identity management",
        "author": "Kaapi Team",
        "features": [
            "Identity verification",
            "Profile management",
            "Regional adaptability for different infrastructure levels",
            "Simplified KYC for low-infrastructure regions",
            "Admin dashboard with verification metrics"
        ],
        "initialized": kyc_initialized
    }

"""
Digital Signature and Timestamping plugin main module.

This module serves as the entry point for the digital signature plugin,
providing initialization and configuration functionality for secure
document signing and timestamping.
"""

import logging
from fastapi import FastAPI, APIRouter

from app.plugins.digital_signature.routes.signature import get_signature_router
from app.plugins.digital_signature.routes.timestamp import get_timestamp_router
from app.plugins.digital_signature.routes.verification import get_verification_router
from app.plugins.digital_signature.utils.security import initialize_signature_security

logger = logging.getLogger(__name__)


class DigitalSignaturePlugin:
    """
    Digital Signature and Timestamping plugin for certifying document integrity.
    
    This plugin provides functionality for digitally signing documents,
    timestamping data to prove its existence at a particular time,
    and verifying the authenticity of signed documents using PKI.
    """
    
    def __init__(self):
        """Initialize the digital signature plugin."""
        self.router = APIRouter()
        self.name = "digital_signature"
        self.initialized = False
    
    def init_app(self, app: FastAPI, prefix: str = "/digital-signature") -> None:
        """
        Initialize the plugin with the FastAPI application.
        
        Args:
            app: FastAPI application
            prefix: URL prefix for the plugin
        """
        if self.initialized:
            logger.warning("Digital signature plugin already initialized")
            return
            
        # Initialize security components
        initialize_signature_security()
        
        # Set up routers
        self.router.prefix = prefix
        self.router.tags = ["Digital Signature"]
        
        # Add sub-routers
        signature_router = get_signature_router()
        timestamp_router = get_timestamp_router()
        verification_router = get_verification_router()
        
        self.router.include_router(
            signature_router,
            prefix="/sign",
            tags=["Document Signing"]
        )
        
        self.router.include_router(
            timestamp_router,
            prefix="/timestamp",
            tags=["Secure Timestamping"]
        )
        
        self.router.include_router(
            verification_router,
            prefix="/verify",
            tags=["Signature Verification"]
        )
        
        # Include the router in the main app
        app.include_router(self.router)
        
        # Mark as initialized
        self.initialized = True
        logger.info("Digital signature plugin initialized")


# Create a singleton instance
digital_signature_plugin = DigitalSignaturePlugin()

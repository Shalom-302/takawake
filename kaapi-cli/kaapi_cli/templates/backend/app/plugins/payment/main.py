"""
Payment plugin for Kaapi.

This plugin provides comprehensive payment processing functionality, including:
- Multiple payment providers (M-Pesa, Flutterwave, Stripe, PayPal, etc.)
- Support for African payment methods
- Multi-user approval workflows
- Full payment lifecycle support
- Refund functionality (full and partial)
- Recurring payments and subscriptions
- Notification system
"""
import logging
from typing import Dict, Any, List

from fastapi import FastAPI
from sqlalchemy.orm import Session

from app.core.db import Base, engine
from app.core.config import settings

from .models.payment import PaymentDB, PaymentApprovalStepDB, PaymentTransactionDB, PaymentRefundDB
from .routes.payment_routes import router as payment_router
from .routes.webhook_routes import router as webhook_router
from .routes.refund_routes import router as refund_router
from .routes.subscription_routes import router as subscription_router
from .providers.provider_factory import PaymentProviderFactory
from .utils.config import load_payment_config, init_payment_settings
from .tests.test_providers import register_test_routes

logger = logging.getLogger("kaapi.payment")

def create_tables():
    """Create all necessary database tables."""

    # Create tables
    logger.info("Creating payment plugin tables if they don't exist")
    Base.metadata.create_all(bind=engine)

def init_app(app: FastAPI) -> None:
    """
    Initialize the payment plugin.
    
    Args:
        app: FastAPI application
    """
    # Create tables first
    create_tables()
    
    # Register routes
    app.include_router(payment_router, prefix="/api/v1", tags=["payments"])
    app.include_router(webhook_router, prefix="/api/v1", tags=["payments-webhooks"])
    app.include_router(refund_router, prefix="/api/v1", tags=["payments"])
    app.include_router(subscription_router, prefix="/api/v1", tags=["payments-subscriptions"])
    
    # Register test routes if in test mode
    if settings.ENVIRONMENT.lower() in ["test", "development"]:
        register_test_routes(app)
        logger.info("Registered payment test routes")
    
    # Initialize settings
    init_payment_settings()
    
    # Initialize providers
    init_providers()
    
    logger.info("Payment plugin initialized")

def init_db_tables(engine: Any, session: Session) -> None:
    """
    Initialize database tables for the payment plugin.
    
    Args:
        engine: SQLAlchemy engine
        session: SQLAlchemy session
    """
    # Create tables
    Base.metadata.create_all(bind=engine, tables=[
        PaymentDB.__table__,
        PaymentApprovalStepDB.__table__,
        PaymentTransactionDB.__table__,
        PaymentRefundDB.__table__,
        SubscriptionDB.__table__,
        SubscriptionItemDB.__table__,
        SubscriptionHistoryDB.__table__
    ])
    
    logger.info("Payment plugin database tables initialized")

def init_providers() -> None:
    """Initialize and register payment providers."""
    config = load_payment_config()
    
    # Import all provider modules to ensure they register themselves
    from .providers import mpesa, flutterwave, stripe, paypal, paystack, cinetpay
    
    # Initialize registered providers with their configurations
    for provider_id, provider_config in config.get("providers", {}).items():
        if provider_config.get("enabled", False):
            logger.info(f"Initializing payment provider: {provider_id}")
            try:
                PaymentProviderFactory.initialize_provider_from_config(provider_id, provider_config)
            except Exception as e:
                logger.error(f"Failed to initialize payment provider {provider_id}: {str(e)}")
    
    logger.info(f"Initialized {len(PaymentProviderFactory.get_available_providers())} payment providers")

def get_plugin_info() -> Dict[str, Any]:
    """
    Get information about the payment plugin.
    
    Returns:
        Plugin information
    """
    return {
        "name": "Payment",
        "version": "1.0.0",
        "description": "Comprehensive payment processing with multi-provider support",
        "author": "Kaapi Team",
        "features": [
            "Multiple payment providers",
            "African payment methods",
            "Multi-user approval workflows",
            "Full payment lifecycle",
            "Refund functionality (full and partial)",
            "Recurring payments and subscriptions",
            "Notification system"
        ],
        "enabled_providers": [
            provider.name for provider in PaymentProviderFactory.get_providers().values()
        ],
        "config_file": "config.json"
    }

def get_supported_payment_methods() -> List[Dict[str, Any]]:
    """
    Get list of supported payment methods.
    
    Returns:
        List of payment methods with details
    """
    # Get all enabled providers
    providers = PaymentProviderFactory.get_providers()
    
    # Collect all payment methods
    payment_methods = {}
    for provider_id, provider in providers.items():
        for method in provider.supported_methods:
            if method not in payment_methods:
                payment_methods[method] = {
                    "id": method,
                    "name": method.replace("_", " ").title(),
                    "providers": []
                }
            
            payment_methods[method]["providers"].append({
                "id": provider_id,
                "name": provider.name
            })
    
    return list(payment_methods.values())

"""
Main module for the Payment Plugin.

This module initializes the payment plugin, sets up routes and integrates
with the main application.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.plugins.workflow.main import workflow_engine

from .models.payment import (
    PaymentCreate, 
    PaymentUpdate, 
    PaymentStatus,
    PaymentMethod,
    PaymentResponse,
    PaymentApproval
)
from .models.provider import ProviderResponse
from .utils.config import payment_settings
from .providers.provider_factory import PaymentProviderFactory
from .workflows.approval_workflow import payment_approval_workflow

# Create router
router = APIRouter(
    prefix="/api/v1/payments",
    tags=["payments"],
    responses={404: {"description": "Not found"}},
)

# Setup logging
logger = logging.getLogger("kaapi.payment")

@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all payments with optional filtering by status."""
    from .utils.payment_service import get_payments
    return get_payments(db, current_user, skip, limit, status)

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new payment."""
    from .utils.payment_service import create_payment_service
    return create_payment_service(db, payment, current_user)

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get details of a specific payment."""
    from .utils.payment_service import get_payment_by_id
    return get_payment_by_id(db, payment_id, current_user)

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a payment."""
    from .utils.payment_service import update_payment_service
    return update_payment_service(db, payment_id, payment, current_user)

@router.post("/{payment_id}/process", response_model=PaymentResponse)
async def process_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Process a payment through the appropriate payment provider."""
    from .utils.payment_service import process_payment_service
    return process_payment_service(db, payment_id, current_user)

@router.post("/{payment_id}/cancel", response_model=PaymentResponse)
async def cancel_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cancel a payment."""
    from .utils.payment_service import cancel_payment_service
    return cancel_payment_service(db, payment_id, current_user)

@router.post("/{payment_id}/approve", response_model=PaymentResponse)
async def approve_payment(
    payment_id: int,
    approval: PaymentApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approve a payment in a multi-user approval workflow."""
    from .utils.payment_service import approve_payment_service
    return approve_payment_service(db, payment_id, approval, current_user)

@router.post("/{payment_id}/reject", response_model=PaymentResponse)
async def reject_payment(
    payment_id: int,
    reason: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reject a payment in a multi-user approval workflow."""
    from .utils.payment_service import reject_payment_service
    return reject_payment_service(db, payment_id, reason, current_user)

@router.get("/providers", response_model=List[ProviderResponse])
async def list_providers(
    current_user: User = Depends(get_current_active_user)
):
    """List all available payment providers."""
    from .utils.payment_service import get_available_providers
    return get_available_providers()

@router.get("/methods", response_model=List[Dict[str, Any]])
async def list_payment_methods(
    current_user: User = Depends(get_current_active_user)
):
    """List all available payment methods."""
    from .utils.payment_service import get_available_payment_methods
    return get_available_payment_methods()

@router.post("/webhook/{provider}", status_code=status.HTTP_200_OK)
async def payment_webhook(
    provider: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle webhooks from payment providers."""
    from .utils.webhook_handler import handle_webhook
    return await handle_webhook(db, provider, request)

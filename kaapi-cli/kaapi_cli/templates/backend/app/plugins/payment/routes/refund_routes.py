"""
Refund routes for the payment plugin.

This module defines API routes for refund operations.
"""
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Path, Query

from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps.auth import get_current_active_user
from app.models.user import User

from ..models.payment import RefundCreate, RefundResponse
from ..utils.refund_service import (
    create_refund,
    process_refund,
    cancel_refund,
    get_refund,
    get_refunds_for_payment,
    verify_refund_status
)

logger = logging.getLogger("kaapi.payment.refund_routes")

router = APIRouter()


@router.post("/payments/{payment_id}/refunds", response_model=RefundResponse, tags=["payments"])
async def create_refund_route(
    payment_id: int = Path(..., title="Payment ID"),
    refund_data: RefundCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a refund request for a payment.
    
    Args:
        payment_id: ID of the payment to refund
        refund_data: Refund data including amount and reason
        db: Database session
        current_user: Authenticated user making the request
    
    Returns:
        Created refund
    """
    try:
        refund = await create_refund(
            db=db,
            payment_id=payment_id,
            refund_data=refund_data,
            current_user=current_user
        )
        return refund
    except ValueError as e:
        logger.error(f"Error creating refund: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating refund: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.post("/payments/refunds/{refund_id}/process", response_model=RefundResponse, tags=["payments"])
async def process_refund_route(
    refund_id: int = Path(..., title="Refund ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Process a refund with the payment provider.
    
    Args:
        refund_id: ID of the refund to process
        db: Database session
        current_user: Authenticated user making the request
    
    Returns:
        Processed refund
    """
    try:
        refund = await process_refund(
            db=db,
            refund_id=refund_id,
            current_user=current_user
        )
        return refund
    except ValueError as e:
        logger.error(f"Error processing refund: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error processing refund: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.post("/payments/refunds/{refund_id}/cancel", response_model=RefundResponse, tags=["payments"])
async def cancel_refund_route(
    refund_id: int = Path(..., title="Refund ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel a pending refund.
    
    Args:
        refund_id: ID of the refund to cancel
        db: Database session
        current_user: Authenticated user making the request
    
    Returns:
        Cancelled refund
    """
    try:
        refund = await cancel_refund(
            db=db,
            refund_id=refund_id,
            current_user=current_user
        )
        return refund
    except ValueError as e:
        logger.error(f"Error cancelling refund: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error cancelling refund: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.get("/payments/refunds/{refund_id}", response_model=RefundResponse, tags=["payments"])
async def get_refund_route(
    refund_id: int = Path(..., title="Refund ID"),
    verify: bool = Query(False, title="Verify status with provider"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a refund by ID.
    
    Args:
        refund_id: ID of the refund to retrieve
        verify: Whether to verify the refund status with the provider
        db: Database session
        current_user: Authenticated user making the request
    
    Returns:
        Refund details
    """
    try:
        if verify:
            refund = await verify_refund_status(db=db, refund_id=refund_id)
        else:
            refund = await get_refund(db=db, refund_id=refund_id)
        return refund
    except ValueError as e:
        logger.error(f"Error getting refund: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error getting refund: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.get("/payments/{payment_id}/refunds", response_model=List[RefundResponse], tags=["payments"])
async def get_refunds_for_payment_route(
    payment_id: int = Path(..., title="Payment ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all refunds for a payment.
    
    Args:
        payment_id: ID of the payment to get refunds for
        db: Database session
        current_user: Authenticated user making the request
    
    Returns:
        List of refunds for the payment
    """
    try:
        refunds = await get_refunds_for_payment(db=db, payment_id=payment_id)
        return refunds
    except Exception as e:
        logger.error(f"Unexpected error getting refunds: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

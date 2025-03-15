"""
Base payment provider.

This module defines the base interface for payment providers.
"""
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

from ..models.provider import (
    PaymentProviderConfig,
    PaymentRequest,
    ProviderResponse,
    RefundRequest
)
from ..models.payment import PaymentStatus, RefundStatus
from ..models.subscription import SubscriptionCreate, SubscriptionResponse, SubscriptionUpdate, SubscriptionCancelRequest

logger = logging.getLogger("kaapi.payment.provider")

class BasePaymentProvider(ABC):
    """Base payment provider interface."""
    
    def __init__(self, config: PaymentProviderConfig):
        """Initialize the provider with configuration."""
        self.config = config
    
    @property
    @abstractmethod
    def id(self) -> str:
        """Get provider ID."""
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Get provider name."""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Get provider description."""
        pass
    
    @property
    def is_enabled(self) -> bool:
        """Check if provider is enabled."""
        return True
    
    @property
    @abstractmethod
    def supported_methods(self) -> List[str]:
        """Get supported payment methods."""
        pass
    
    @property
    @abstractmethod
    def supported_currencies(self) -> List[str]:
        """Get supported currencies."""
        pass
    
    @property
    def supports_refunds(self) -> bool:
        """Check if provider supports refunds."""
        return True
    
    @property
    def supports_partial_refunds(self) -> bool:
        """Check if provider supports partial refunds."""
        return True
    
    @abstractmethod
    async def process_payment(self, payment_request: PaymentRequest) -> ProviderResponse:
        """
        Process a payment through this provider.
        
        Args:
            payment_request: Payment request details
            
        Returns:
            Provider response with payment details
        """
        pass
    
    @abstractmethod
    async def verify_payment(self, reference: str) -> ProviderResponse:
        """
        Verify a payment with the provider.
        
        Args:
            reference: Provider reference to verify
            
        Returns:
            Provider response with payment status
        """
        pass
    
    @abstractmethod
    async def cancel_payment(self, reference: str) -> ProviderResponse:
        """
        Cancel a payment with the provider.
        
        Args:
            reference: Provider reference to cancel
            
        Returns:
            Provider response with cancellation result
        """
        pass
    
    async def process_refund(self, refund_request: RefundRequest) -> ProviderResponse:
        """
        Process a refund through this provider.
        
        Args:
            refund_request: Refund request details
            
        Returns:
            Provider response with refund details
        """
        if not self.supports_refunds:
            return ProviderResponse(
                success=False,
                status=RefundStatus.FAILED,
                provider_reference="",
                message=f"Provider {self.id} does not support refunds",
                raw_response={"error": "refunds_not_supported"}
            )
        
        if not self.supports_partial_refunds and refund_request.is_partial:
            return ProviderResponse(
                success=False,
                status=RefundStatus.FAILED,
                provider_reference="",
                message=f"Provider {self.id} does not support partial refunds",
                raw_response={"error": "partial_refunds_not_supported"}
            )
        
        # Default implementation that should be overridden
        logger.warning(f"Using default refund implementation for provider {self.id}")
        return ProviderResponse(
            success=False,
            status=RefundStatus.FAILED,
            provider_reference="",
            message="Refund not implemented",
            raw_response={"error": "not_implemented"}
        )
    
    async def verify_refund(self, reference: str) -> ProviderResponse:
        """
        Verify a refund with the provider.
        
        Args:
            reference: Provider reference to verify
            
        Returns:
            Provider response with refund status
        """
        if not self.supports_refunds:
            return ProviderResponse(
                success=False,
                status=RefundStatus.FAILED,
                provider_reference=reference,
                message=f"Provider {self.id} does not support refunds",
                raw_response={"error": "refunds_not_supported"}
            )
        
        # Default implementation that should be overridden
        logger.warning(f"Using default refund verification implementation for provider {self.id}")
        return ProviderResponse(
            success=False,
            status=RefundStatus.FAILED,
            provider_reference=reference,
            message="Refund verification not implemented",
            raw_response={"error": "not_implemented"}
        )
    
    @abstractmethod
    async def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """
        Handle webhook data from the provider.
        
        Args:
            payload: Webhook payload
            headers: Webhook headers
            
        Returns:
            Processed webhook data or None if not applicable
        """
        pass
    
    @abstractmethod
    async def create_subscription(self, subscription: SubscriptionCreate) -> SubscriptionResponse:
        """Create a new subscription with the provider."""
        pass

    @abstractmethod
    async def update_subscription(self, subscription_id: str, update_data: SubscriptionUpdate) -> SubscriptionResponse:
        """Update an existing subscription with the provider."""
        pass

    @abstractmethod
    async def cancel_subscription(self, subscription_id: str, cancel_request: SubscriptionCancelRequest) -> SubscriptionResponse:
        """Cancel a subscription with the provider."""
        pass

    @abstractmethod
    async def pause_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """Pause a subscription with the provider."""
        pass

    @abstractmethod
    async def resume_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """Resume a paused subscription with the provider."""
        pass

    @abstractmethod
    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get subscription details from the provider."""
        pass

    @abstractmethod
    async def list_customer_subscriptions(self, customer_id: str) -> List[Dict[str, Any]]:
        """List all subscriptions for a customer."""
        pass

    @property
    @abstractmethod
    def supports_subscriptions(self) -> bool:
        """Whether this provider supports subscriptions."""
        return False

"""
Hub2 payment provider implementation.

This module provides integration with the Hub2 payment service.
"""
import logging
import json
import aiohttp
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import hmac
import hashlib
import base64

from ..models.provider import PaymentProviderConfig, PaymentRequest, ProviderResponse, RefundRequest, RefundResponse
from ..models.payment import PaymentStatus, RefundStatus
from ..models.subscription import (
    SubscriptionCreate,
    SubscriptionResponse,
    SubscriptionUpdate,
    SubscriptionCancelRequest,
    SubscriptionStatus
)
from .base_provider import BasePaymentProvider
from .provider_factory import PaymentProviderFactory

logger = logging.getLogger("kaapi.payment.hub2")

@PaymentProviderFactory.register
class Hub2Provider(BasePaymentProvider):
    """Hub2 payment provider implementation."""
    
    provider_id = "hub2"
    provider_name = "Hub2"
    logo_url = "https://hub2.io/wp-content/uploads/2023/03/hub2-logo-new.png"
    
    def __init__(self, config: PaymentProviderConfig):
        """Initialize the provider with configuration."""
        super().__init__(config)
        self.api_base_url = "https://api.hub2.io"
        self.api_key = config.secret_key
        self.api_client_id = config.public_key  # Client ID is stored in public_key
        self.webhook_secret = config.webhook_secret
        self.payment_success_url = config.success_url
        self.payment_cancel_url = config.cancel_url
        self.metadata = {
            "website": "https://hub2.io/",
            "docs": "https://docs.hub2.io/"
        }
    
    @property
    def id(self) -> str:
        """Get provider ID."""
        return self.provider_id
    
    @property
    def name(self) -> str:
        """Get provider name."""
        return self.provider_name
    
    @property
    def description(self) -> str:
        """Get provider description."""
        return "Hub2 payment processing service for Africa and Middle East"
    
    @property
    def supported_methods(self) -> List[str]:
        """Get supported payment methods."""
        return ["card", "bank_transfer", "mobile_money", "ussd", "qr"]
    
    @property
    def supported_currencies(self) -> List[str]:
        """Get supported currencies."""
        return ["USD", "EUR", "XOF", "NGN", "GHS", "KES", "UGX", "TZS", "RWF", "ZAR"]
    
    @property
    def supported_countries(self) -> List[str]:
        """Get supported countries."""
        return ["BJ", "BF", "CI", "GH", "GN", "ML", "NE", "NG", "SN", "TG", "KE", "UG", "TZ", "RW", "ZA"]
    
    @property
    def supports_subscriptions(self) -> bool:
        """Whether this provider supports subscriptions."""
        return True
        
    async def process_payment(self, payment_request: PaymentRequest) -> ProviderResponse:
        """
        Process a payment through Hub2.
        
        Args:
            payment_request: Payment request details
            
        Returns:
            Provider response with payment details
        """
        try:
            # Prepare the payment data for Hub2
            payment_data = {
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "reference": payment_request.reference or f"kaapi-payment-{datetime.now().timestamp()}",
                "email": payment_request.customer_email,
                "callback_url": self.payment_success_url,
                "return_url": self.payment_success_url,
                "cancel_url": self.payment_cancel_url,
                "metadata": {
                    "order_id": payment_request.order_id,
                    "customer_id": payment_request.customer_id,
                    **(payment_request.metadata if payment_request.metadata else {})
                }
            }
            
            # Add payment method if specified
            if payment_request.payment_method:
                payment_data["payment_method"] = payment_request.payment_method
            
            # Initialize the payment
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/v1/payments/initialize",
                    headers=headers,
                    json=payment_data
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 payment error: {result}")
                        return ProviderResponse(
                            success=False,
                            status=PaymentStatus.FAILED,
                            provider_reference="",
                            message=result.get("message", "Payment initialization failed"),
                            raw_response=result
                        )
                    
                    # Extract important data from the response
                    data = result.get("data", {})
                    payment_url = data.get("payment_url")
                    payment_id = data.get("payment_id")
                    
                    return ProviderResponse(
                        success=True,
                        status=PaymentStatus.PENDING,
                        provider_reference=payment_id,
                        message="Payment initialized successfully",
                        raw_response=result,
                        redirect_url=payment_url
                    )
                    
        except Exception as e:
            logger.error(f"Hub2 payment error: {str(e)}")
            return ProviderResponse(
                success=False,
                status=PaymentStatus.FAILED,
                provider_reference="",
                message=str(e),
                raw_response={"error": str(e)}
            )
    
    async def verify_payment(self, reference: str) -> ProviderResponse:
        """
        Verify a payment with Hub2.
        
        Args:
            reference: Provider reference to verify
            
        Returns:
            Provider response with payment status
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/v1/payments/{reference}/verify",
                    headers=headers
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 verification error: {result}")
                        return ProviderResponse(
                            success=False,
                            status=PaymentStatus.FAILED,
                            provider_reference=reference,
                            message=result.get("message", "Payment verification failed"),
                            raw_response=result
                        )
                    
                    # Extract data from the response
                    data = result.get("data", {})
                    status = data.get("status")
                    
                    # Map Hub2 status to our status
                    payment_status = self._map_hub2_status_to_internal(status)
                    
                    # Get amount and currency
                    amount = data.get("amount", 0)
                    currency = data.get("currency", "USD")
                    
                    # Extract metadata if available
                    metadata = data.get("metadata", {})
                    order_id = metadata.get("order_id") if metadata else None
                    
                    return ProviderResponse(
                        success=payment_status == PaymentStatus.SUCCESS,
                        status=payment_status,
                        provider_reference=reference,
                        message=f"Payment {payment_status.value}",
                        raw_response=result,
                        amount=amount,
                        currency=currency,
                        order_id=order_id
                    )
                    
        except Exception as e:
            logger.error(f"Hub2 verification error: {str(e)}")
            return ProviderResponse(
                success=False,
                status=PaymentStatus.UNKNOWN,
                provider_reference=reference,
                message=str(e),
                raw_response={"error": str(e)}
            )
    
    async def cancel_payment(self, reference: str) -> ProviderResponse:
        """
        Cancel a payment with Hub2.
        
        Args:
            reference: Provider reference to cancel
            
        Returns:
            Provider response with cancellation result
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/v1/payments/{reference}/cancel",
                    headers=headers
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 cancel payment error: {result}")
                        return ProviderResponse(
                            success=False,
                            status=PaymentStatus.FAILED,
                            provider_reference=reference,
                            message=result.get("message", "Payment cancellation failed"),
                            raw_response=result
                        )
                    
                    return ProviderResponse(
                        success=True,
                        status=PaymentStatus.CANCELLED,
                        provider_reference=reference,
                        message="Payment canceled successfully",
                        raw_response=result
                    )
                    
        except Exception as e:
            logger.error(f"Hub2 cancel payment error: {str(e)}")
            return ProviderResponse(
                success=False,
                status=PaymentStatus.UNKNOWN,
                provider_reference=reference,
                message=str(e),
                raw_response={"error": str(e)}
            )
    
    async def process_refund(self, refund_request: RefundRequest) -> ProviderResponse:
        """
        Process a refund through Hub2.
        
        Args:
            refund_request: Refund request details
            
        Returns:
            Provider response with refund details
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            refund_data = {
                "payment_id": refund_request.payment_reference,
                "amount": refund_request.amount if refund_request.amount else None,
                "reason": refund_request.reason if refund_request.reason else "Customer requested refund"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/v1/refunds/create",
                    headers=headers,
                    json=refund_data
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 refund error: {result}")
                        return ProviderResponse(
                            success=False,
                            status=RefundStatus.FAILED,
                            provider_reference=refund_request.payment_reference,
                            message=result.get("message", "Refund failed"),
                            raw_response=result
                        )
                    
                    # Extract data from the response
                    data = result.get("data", {})
                    refund_id = data.get("refund_id")
                    refund_status = data.get("status")
                    
                    # Map Hub2 refund status to our status
                    internal_status = self._map_hub2_refund_status_to_internal(refund_status)
                    
                    return ProviderResponse(
                        success=True,
                        status=internal_status,
                        provider_reference=refund_id,
                        message=f"Refund {internal_status.value}",
                        raw_response=result
                    )
                    
        except Exception as e:
            logger.error(f"Hub2 refund error: {str(e)}")
            return ProviderResponse(
                success=False,
                status=RefundStatus.FAILED,
                provider_reference="",
                message=str(e),
                raw_response={"error": str(e)}
            )
    
    async def verify_refund(self, reference: str) -> ProviderResponse:
        """
        Verify a refund with Hub2.
        
        Args:
            reference: Provider reference to verify
            
        Returns:
            Provider response with refund status
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/v1/refunds/{reference}",
                    headers=headers
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 refund verification error: {result}")
                        return ProviderResponse(
                            success=False,
                            status=RefundStatus.FAILED,
                            provider_reference=reference,
                            message=result.get("message", "Refund verification failed"),
                            raw_response=result
                        )
                    
                    # Extract data from the response
                    data = result.get("data", {})
                    refund_status = data.get("status")
                    
                    # Map Hub2 refund status to our status
                    internal_status = self._map_hub2_refund_status_to_internal(refund_status)
                    
                    return ProviderResponse(
                        success=internal_status != RefundStatus.FAILED,
                        status=internal_status,
                        provider_reference=reference,
                        message=f"Refund {internal_status.value}",
                        raw_response=result
                    )
                    
        except Exception as e:
            logger.error(f"Hub2 refund verification error: {str(e)}")
            return ProviderResponse(
                success=False,
                status=RefundStatus.UNKNOWN,
                provider_reference=reference,
                message=str(e),
                raw_response={"error": str(e)}
            )
            
    async def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """
        Handle webhook data from Hub2.
        
        Args:
            payload: Webhook payload
            headers: Webhook headers
            
        Returns:
            Processed webhook data or None if not applicable
        """
        try:
            # Verify webhook signature
            signature = headers.get("x-hub2-signature")
            if not signature or not self._verify_webhook_signature(signature, payload):
                logger.warning("Invalid Hub2 webhook signature")
                return None
                
            # Process based on event type
            event_type = payload.get("event")
            data = payload.get("data", {})
            
            if event_type == "payment.successful":
                # Handle successful payment
                return {
                    "type": "payment",
                    "action": "success",
                    "reference": data.get("payment_id"),
                    "amount": data.get("amount", 0),
                    "currency": data.get("currency", "USD"),
                    "customer_email": data.get("customer", {}).get("email"),
                    "metadata": data.get("metadata", {})
                }
            elif event_type == "payment.failed":
                # Handle failed payment
                return {
                    "type": "payment",
                    "action": "failed",
                    "reference": data.get("payment_id"),
                    "amount": data.get("amount", 0),
                    "currency": data.get("currency", "USD"),
                    "customer_email": data.get("customer", {}).get("email"),
                    "metadata": data.get("metadata", {})
                }
            elif event_type == "refund.processed":
                # Handle processed refund
                return {
                    "type": "refund",
                    "action": "processed",
                    "reference": data.get("refund_id"),
                    "payment_reference": data.get("payment_id"),
                    "amount": data.get("amount", 0),
                    "currency": data.get("currency", "USD")
                }
            elif event_type == "subscription.created":
                # Handle new subscription
                return {
                    "type": "subscription",
                    "action": "created",
                    "reference": data.get("subscription_id"),
                    "customer_email": data.get("customer", {}).get("email"),
                    "plan": data.get("plan", {}).get("name")
                }
            elif event_type == "subscription.cancelled":
                # Handle canceled subscription
                return {
                    "type": "subscription",
                    "action": "canceled",
                    "reference": data.get("subscription_id"),
                    "customer_email": data.get("customer", {}).get("email")
                }
            
            # Return raw payload for unhandled events
            return {
                "type": "unhandled",
                "event": event_type,
                "data": data
            }
                
        except Exception as e:
            logger.error(f"Hub2 webhook error: {str(e)}")
            return None
    
    def _verify_webhook_signature(self, signature: str, payload: Dict[str, Any]) -> bool:
        """
        Verify Hub2 webhook signature.
        
        Args:
            signature: The signature from the webhook header
            payload: The webhook payload
            
        Returns:
            True if signature is valid, False otherwise
        """
        if not self.webhook_secret:
            logger.warning("No webhook secret configured for Hub2")
            return False
            
        try:
            # Convert payload to string
            payload_string = json.dumps(payload)
            
            # Create HMAC signature
            computed_hmac = hmac.new(
                self.webhook_secret.encode("utf-8"),
                payload_string.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            
            return computed_hmac == signature
            
        except Exception as e:
            logger.error(f"Error verifying Hub2 webhook signature: {str(e)}")
            return False
    
    def _map_hub2_status_to_internal(self, status: str) -> PaymentStatus:
        """
        Map Hub2 payment status to internal status.
        
        Args:
            status: Hub2 payment status
            
        Returns:
            Internal payment status
        """
        status_map = {
            "successful": PaymentStatus.SUCCESS,
            "completed": PaymentStatus.SUCCESS,
            "failed": PaymentStatus.FAILED,
            "cancelled": PaymentStatus.CANCELLED,
            "canceled": PaymentStatus.CANCELLED,
            "pending": PaymentStatus.PENDING,
            "refunded": PaymentStatus.REFUNDED,
            "partially_refunded": PaymentStatus.PARTIALLY_REFUNDED
        }
        
        return status_map.get(status.lower(), PaymentStatus.UNKNOWN)
    
    def _map_hub2_refund_status_to_internal(self, status: str) -> RefundStatus:
        """
        Map Hub2 refund status to internal status.
        
        Args:
            status: Hub2 refund status
            
        Returns:
            Internal refund status
        """
        status_map = {
            "pending": RefundStatus.PENDING,
            "processing": RefundStatus.PENDING,
            "successful": RefundStatus.SUCCESS,
            "completed": RefundStatus.SUCCESS,
            "failed": RefundStatus.FAILED
        }
        
        return status_map.get(status.lower(), RefundStatus.UNKNOWN)

    async def create_subscription(self, subscription: SubscriptionCreate) -> SubscriptionResponse:
        """
        Create a new subscription with Hub2.
        
        Args:
            subscription: Subscription data
            
        Returns:
            Subscription response with provider data
        """
        try:
            # First check if we need to create a customer
            customer_id = await self._get_or_create_customer(subscription.customer_email)
            
            # Create or get a plan
            plan_id = await self._create_or_get_plan(
                subscription.name,
                subscription.description,
                subscription.amount,
                subscription.currency,
                subscription.billing_period,
                subscription.billing_interval
            )
            
            if not plan_id:
                logger.error("Failed to create or get Hub2 plan")
                raise ValueError("Failed to create Hub2 plan")
            
            # Create the subscription
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            # Prepare trial data if enabled
            trial_data = {}
            if subscription.trial_enabled and subscription.trial_end_date:
                trial_days = (subscription.trial_end_date - (subscription.trial_start_date or datetime.now())).days
                if trial_days > 0:
                    trial_data = {
                        "trial_enabled": True,
                        "trial_days": trial_days
                    }
            
            subscription_data = {
                "customer_id": customer_id,
                "plan_id": plan_id,
                "start_date": datetime.now().strftime("%Y-%m-%d") if not subscription.start_date else subscription.start_date.strftime("%Y-%m-%d"),
                "metadata": subscription.metadata or {},
                **trial_data
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/v1/subscriptions/create",
                    headers=headers,
                    json=subscription_data
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 subscription error: {result}")
                        raise ValueError(f"Failed to create subscription: {result.get('message', 'Unknown error')}")
                    
                    data = result.get("data", {})
                    
                    # Map status
                    status = self._map_hub2_subscription_status_to_internal(data.get("status"))
                    
                    # Determine next billing date
                    next_billing_date = None
                    if data.get("next_billing_date"):
                        try:
                            next_billing_date = datetime.strptime(data.get("next_billing_date"), "%Y-%m-%d")
                        except:
                            pass
                    
                    # Prepare response
                    response = SubscriptionResponse(
                        id=0,  # Will be set by database
                        name=subscription.name,
                        description=subscription.description,
                        status=status,
                        amount=subscription.amount,
                        currency=subscription.currency,
                        billing_period=subscription.billing_period,
                        billing_interval=subscription.billing_interval,
                        customer_id=subscription.customer_id,
                        customer_email=subscription.customer_email,
                        created_by_id=subscription.created_by_id,
                        created_at=datetime.now(),
                        updated_at=datetime.now(),
                        start_date=subscription.start_date or datetime.now(),
                        end_date=None,
                        next_billing_date=next_billing_date,
                        trial_enabled=subscription.trial_enabled,
                        trial_start_date=subscription.trial_start_date,
                        trial_end_date=subscription.trial_end_date,
                        payment_method_id=None,
                        payment_provider="hub2",
                        provider_subscription_id=data.get("subscription_id"),
                        auto_renew=True,
                        metadata={
                            "hub2_customer_id": customer_id,
                            "hub2_plan_id": plan_id,
                            **(subscription.metadata or {})
                        },
                        is_active=status == SubscriptionStatus.ACTIVE.value,
                        is_past_due=status == SubscriptionStatus.PAST_DUE.value,
                        is_canceled=status == SubscriptionStatus.CANCELED.value,
                        is_in_trial=subscription.trial_enabled and subscription.trial_end_date and subscription.trial_end_date > datetime.now(),
                        days_until_next_billing=None
                    )
                    
                    return response
        
        except Exception as e:
            logger.error(f"Hub2 subscription error: {str(e)}")
            raise ValueError(f"Failed to create subscription: {str(e)}")
    
    async def update_subscription(self, subscription_id: str, update_data: SubscriptionUpdate) -> SubscriptionResponse:
        """
        Update an existing subscription with Hub2.
        
        Args:
            subscription_id: Hub2 subscription ID
            update_data: Data to update
            
        Returns:
            Updated subscription response
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            # Prepare update data
            update_payload = {}
            
            # Add auto_renew if provided
            if update_data.auto_renew is not None:
                update_payload["auto_renew"] = update_data.auto_renew
            
            # If plan details are changing, we might need to update the plan
            if update_data.amount is not None or update_data.billing_period is not None or update_data.billing_interval is not None:
                # Get current subscription to extract details
                current_sub = await self.get_subscription(subscription_id)
                
                # Create or get updated plan
                plan_id = await self._create_or_get_plan(
                    update_data.name or current_sub.get("name", "Updated Plan"),
                    update_data.description or current_sub.get("description", ""),
                    update_data.amount or current_sub.get("amount", 0),
                    update_data.currency or current_sub.get("currency", "USD"),
                    update_data.billing_period or current_sub.get("billing_period", "monthly"),
                    update_data.billing_interval or current_sub.get("billing_interval", 1)
                )
                
                if plan_id:
                    update_payload["plan_id"] = plan_id
            
            # Add metadata if provided
            if update_data.metadata:
                update_payload["metadata"] = update_data.metadata
                
            # If nothing to update, return current subscription
            if not update_payload:
                subscription_data = await self.get_subscription(subscription_id)
                return SubscriptionResponse(
                    id=0,
                    name=update_data.name or "",
                    description=update_data.description or "",
                    status=subscription_data.get("status"),
                    amount=subscription_data.get("amount", 0),
                    currency=subscription_data.get("currency", ""),
                    billing_period=subscription_data.get("billing_period", ""),
                    billing_interval=subscription_data.get("billing_interval", 0),
                    customer_id=None,
                    customer_email=subscription_data.get("customer_email"),
                    created_by_id=None,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    start_date=subscription_data.get("start_date"),
                    end_date=subscription_data.get("end_date"),
                    next_billing_date=subscription_data.get("next_billing_date"),
                    trial_enabled=subscription_data.get("is_in_trial", False),
                    trial_start_date=None,
                    trial_end_date=None,
                    payment_method_id=None,
                    payment_provider="hub2",
                    provider_subscription_id=subscription_id,
                    auto_renew=subscription_data.get("auto_renew", False),
                    metadata=update_data.metadata or subscription_data.get("metadata", {}),
                    is_active=subscription_data.get("is_active", False),
                    is_past_due=subscription_data.get("is_past_due", False),
                    is_canceled=subscription_data.get("is_canceled", False),
                    is_in_trial=subscription_data.get("is_in_trial", False),
                    days_until_next_billing=None
                )
            
            # Update subscription
            async with aiohttp.ClientSession() as session:
                async with session.put(
                    f"{self.api_base_url}/v1/subscriptions/{subscription_id}",
                    headers=headers,
                    json=update_payload
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 subscription update error: {result}")
                        raise ValueError(f"Failed to update subscription: {result.get('message', 'Unknown error')}")
            
            # Get updated subscription details
            subscription_data = await self.get_subscription(subscription_id)
            
            # Prepare response
            response = SubscriptionResponse(
                id=0,
                name=update_data.name or subscription_data.get("name", ""),
                description=update_data.description or subscription_data.get("description", ""),
                status=subscription_data.get("status"),
                amount=update_data.amount or subscription_data.get("amount", 0),
                currency=update_data.currency or subscription_data.get("currency", ""),
                billing_period=update_data.billing_period or subscription_data.get("billing_period", ""),
                billing_interval=update_data.billing_interval or subscription_data.get("billing_interval", 0),
                customer_id=None,
                customer_email=subscription_data.get("customer_email"),
                created_by_id=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                start_date=subscription_data.get("start_date"),
                end_date=subscription_data.get("end_date"),
                next_billing_date=subscription_data.get("next_billing_date"),
                trial_enabled=subscription_data.get("is_in_trial", False),
                trial_start_date=None,
                trial_end_date=None,
                payment_method_id=None,
                payment_provider="hub2",
                provider_subscription_id=subscription_id,
                auto_renew=subscription_data.get("auto_renew", False),
                metadata=update_data.metadata or subscription_data.get("metadata", {}),
                is_active=subscription_data.get("is_active", False),
                is_past_due=subscription_data.get("is_past_due", False),
                is_canceled=subscription_data.get("is_canceled", False),
                is_in_trial=subscription_data.get("is_in_trial", False),
                days_until_next_billing=None
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Hub2 subscription update error: {str(e)}")
            raise ValueError(f"Failed to update subscription: {str(e)}")

    async def cancel_subscription(self, subscription_id: str, cancel_request: Optional[SubscriptionCancelRequest] = None) -> SubscriptionResponse:
        """
        Cancel an existing subscription with Hub2.
        
        Args:
            subscription_id: Hub2 subscription ID
            cancel_request: Optional cancel request data
            
        Returns:
            Cancelled subscription response
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            # Prepare cancellation data
            cancel_payload = {}
            
            # Add cancellation reason if provided
            if cancel_request and cancel_request.reason:
                cancel_payload["reason"] = cancel_request.reason
                
            # Add immediate flag if provided
            if cancel_request and cancel_request.immediate:
                cancel_payload["cancel_immediate"] = True
                
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/v1/subscriptions/{subscription_id}/cancel",
                    headers=headers,
                    json=cancel_payload
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 subscription cancellation error: {result}")
                        raise ValueError(f"Failed to cancel subscription: {result.get('message', 'Unknown error')}")
            
            # Get updated subscription details
            subscription_data = await self.get_subscription(subscription_id)
            
            # Prepare response
            response = SubscriptionResponse(
                id=0,
                name=subscription_data.get("name", ""),
                description=subscription_data.get("description", ""),
                status=SubscriptionStatus.CANCELED.value,
                amount=subscription_data.get("amount", 0),
                currency=subscription_data.get("currency", ""),
                billing_period=subscription_data.get("billing_period", ""),
                billing_interval=subscription_data.get("billing_interval", 0),
                customer_id=None,
                customer_email=subscription_data.get("customer_email"),
                created_by_id=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                start_date=subscription_data.get("start_date"),
                end_date=datetime.now() if cancel_request and cancel_request.immediate else subscription_data.get("end_date"),
                next_billing_date=None,
                trial_enabled=subscription_data.get("is_in_trial", False),
                trial_start_date=None,
                trial_end_date=None,
                payment_method_id=None,
                payment_provider="hub2",
                provider_subscription_id=subscription_id,
                auto_renew=False,
                metadata=subscription_data.get("metadata", {}),
                is_active=False,
                is_past_due=False,
                is_canceled=True,
                is_in_trial=False,
                days_until_next_billing=None
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Hub2 subscription cancellation error: {str(e)}")
            raise ValueError(f"Failed to cancel subscription: {str(e)}")
            
    async def pause_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """
        Pause an existing subscription with Hub2.
        Note: Hub2 doesn't directly support pausing, so we'll implement a disable for auto-renew.
        
        Args:
            subscription_id: Hub2 subscription ID
            
        Returns:
            Paused subscription response
        """
        try:
            # Hub2 doesn't directly support pausing, so we'll disable auto-renewal
            # This is similar to what we did for PayStack
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            pause_payload = {
                "auto_renew": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.put(
                    f"{self.api_base_url}/v1/subscriptions/{subscription_id}",
                    headers=headers,
                    json=pause_payload
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 subscription pause error: {result}")
                        raise ValueError(f"Failed to pause subscription: {result.get('message', 'Unknown error')}")
            
            # Get updated subscription details
            subscription_data = await self.get_subscription(subscription_id)
            
            # Prepare response
            response = SubscriptionResponse(
                id=0,
                name=subscription_data.get("name", ""),
                description=subscription_data.get("description", ""),
                status=SubscriptionStatus.PAUSED.value,  # We mark it as paused in our system
                amount=subscription_data.get("amount", 0),
                currency=subscription_data.get("currency", ""),
                billing_period=subscription_data.get("billing_period", ""),
                billing_interval=subscription_data.get("billing_interval", 0),
                customer_id=None,
                customer_email=subscription_data.get("customer_email"),
                created_by_id=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                start_date=subscription_data.get("start_date"),
                end_date=subscription_data.get("end_date"),
                next_billing_date=None,  # Since auto-renew is disabled
                trial_enabled=subscription_data.get("is_in_trial", False),
                trial_start_date=None,
                trial_end_date=None,
                payment_method_id=None,
                payment_provider="hub2",
                provider_subscription_id=subscription_id,
                auto_renew=False,
                metadata={
                    **subscription_data.get("metadata", {}),
                    "paused_at": datetime.now().isoformat()
                },
                is_active=False,  # Paused is not active
                is_past_due=False,
                is_canceled=False,
                is_in_trial=False,
                days_until_next_billing=None
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Hub2 subscription pause error: {str(e)}")
            raise ValueError(f"Failed to pause subscription: {str(e)}")
            
    async def resume_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """
        Resume a paused subscription with Hub2.
        Note: Since Hub2 doesn't directly support pausing, we just re-enable auto-renew.
        If the subscription has ended, we'll need to create a new one.
        
        Args:
            subscription_id: Hub2 subscription ID
            
        Returns:
            Resumed subscription response or indication that a new subscription is needed
        """
        try:
            # First check if the subscription is still active
            subscription_data = await self.get_subscription(subscription_id)
            
            # If the subscription has ended, we need to create a new one
            if subscription_data.get("status") == SubscriptionStatus.CANCELED.value or \
               subscription_data.get("status") == SubscriptionStatus.EXPIRED.value or \
               (subscription_data.get("end_date") and \
                datetime.strptime(subscription_data.get("end_date"), "%Y-%m-%d") < datetime.now()):
                
                # Return a response indicating a new subscription is needed
                return SubscriptionResponse(
                    id=0,
                    name=subscription_data.get("name", ""),
                    description=subscription_data.get("description", ""),
                    status=SubscriptionStatus.EXPIRED.value,
                    amount=subscription_data.get("amount", 0),
                    currency=subscription_data.get("currency", ""),
                    billing_period=subscription_data.get("billing_period", ""),
                    billing_interval=subscription_data.get("billing_interval", 0),
                    customer_id=None,
                    customer_email=subscription_data.get("customer_email"),
                    created_by_id=None,
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    start_date=subscription_data.get("start_date"),
                    end_date=subscription_data.get("end_date"),
                    next_billing_date=None,
                    trial_enabled=False,
                    trial_start_date=None,
                    trial_end_date=None,
                    payment_method_id=None,
                    payment_provider="hub2",
                    provider_subscription_id=subscription_id,
                    auto_renew=False,
                    metadata={
                        **subscription_data.get("metadata", {}),
                        "needs_new_subscription": True,
                        "resumed_attempt": datetime.now().isoformat()
                    },
                    is_active=False,
                    is_past_due=False,
                    is_canceled=True,
                    is_in_trial=False,
                    days_until_next_billing=None,
                    message="Subscription has ended. Please create a new subscription."
                )
            
            # If the subscription is still active, just resume it by enabling auto-renew
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            resume_payload = {
                "auto_renew": True
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.put(
                    f"{self.api_base_url}/v1/subscriptions/{subscription_id}",
                    headers=headers,
                    json=resume_payload
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 subscription resume error: {result}")
                        raise ValueError(f"Failed to resume subscription: {result.get('message', 'Unknown error')}")
            
            # Get updated subscription details
            subscription_data = await self.get_subscription(subscription_id)
            
            # Prepare response
            response = SubscriptionResponse(
                id=0,
                name=subscription_data.get("name", ""),
                description=subscription_data.get("description", ""),
                status=SubscriptionStatus.ACTIVE.value,  # Mark as active
                amount=subscription_data.get("amount", 0),
                currency=subscription_data.get("currency", ""),
                billing_period=subscription_data.get("billing_period", ""),
                billing_interval=subscription_data.get("billing_interval", 0),
                customer_id=None,
                customer_email=subscription_data.get("customer_email"),
                created_by_id=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                start_date=subscription_data.get("start_date"),
                end_date=subscription_data.get("end_date"),
                next_billing_date=subscription_data.get("next_billing_date"),
                trial_enabled=subscription_data.get("is_in_trial", False),
                trial_start_date=None,
                trial_end_date=None,
                payment_method_id=None,
                payment_provider="hub2",
                provider_subscription_id=subscription_id,
                auto_renew=True,
                metadata={
                    **subscription_data.get("metadata", {}),
                    "resumed_at": datetime.now().isoformat()
                },
                is_active=True,
                is_past_due=False,
                is_canceled=False,
                is_in_trial=subscription_data.get("is_in_trial", False),
                days_until_next_billing=None
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Hub2 subscription resume error: {str(e)}")
            raise ValueError(f"Failed to resume subscription: {str(e)}")

    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Get subscription details from Hub2.
        
        Args:
            subscription_id: Hub2 subscription ID
            
        Returns:
            Dictionary with subscription details
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/v1/subscriptions/{subscription_id}",
                    headers=headers
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 get subscription error: {result}")
                        raise ValueError(f"Failed to get subscription: {result.get('message', 'Unknown error')}")
                    
                    data = result.get("data", {})
                    
                    # Map status
                    status = self._map_hub2_subscription_status_to_internal(data.get("status"))
                    
                    # Determine dates
                    start_date = None
                    end_date = None
                    next_billing_date = None
                    
                    if data.get("start_date"):
                        try:
                            start_date = datetime.strptime(data.get("start_date"), "%Y-%m-%d")
                        except:
                            pass
                            
                    if data.get("end_date"):
                        try:
                            end_date = datetime.strptime(data.get("end_date"), "%Y-%m-%d")
                        except:
                            pass
                            
                    if data.get("next_billing_date"):
                        try:
                            next_billing_date = datetime.strptime(data.get("next_billing_date"), "%Y-%m-%d")
                        except:
                            pass
                    
                    # Extract plan details
                    plan = data.get("plan", {})
                    amount = plan.get("amount", 0)
                    currency = plan.get("currency", "USD")
                    billing_period = "monthly"  # Default
                    billing_interval = 1  # Default
                    
                    # Try to extract billing details from plan name or interval
                    if plan.get("interval"):
                        interval_parts = plan.get("interval", "").lower().split("_")
                        if len(interval_parts) >= 2:
                            try:
                                billing_interval = int(interval_parts[0])
                                if "day" in interval_parts[1]:
                                    billing_period = "daily"
                                elif "week" in interval_parts[1]:
                                    billing_period = "weekly"
                                elif "month" in interval_parts[1]:
                                    billing_period = "monthly"
                                elif "year" in interval_parts[1]:
                                    billing_period = "yearly"
                            except:
                                pass
                    
                    # Extract customer email
                    customer = data.get("customer", {})
                    customer_email = customer.get("email", "")
                    
                    # Check if subscription is in trial
                    is_in_trial = data.get("is_in_trial", False)
                    
                    # Check auto-renew status
                    auto_renew = data.get("auto_renew", True)
                    
                    # Prepare the response
                    subscription_data = {
                        "name": plan.get("name", ""),
                        "description": plan.get("description", ""),
                        "status": status,
                        "amount": amount,
                        "currency": currency,
                        "billing_period": billing_period,
                        "billing_interval": billing_interval,
                        "customer_email": customer_email,
                        "start_date": start_date,
                        "end_date": end_date,
                        "next_billing_date": next_billing_date,
                        "is_in_trial": is_in_trial,
                        "auto_renew": auto_renew,
                        "metadata": data.get("metadata", {}),
                        "is_active": status == SubscriptionStatus.ACTIVE.value,
                        "is_past_due": status == SubscriptionStatus.PAST_DUE.value,
                        "is_canceled": status == SubscriptionStatus.CANCELED.value
                    }
                    
                    return subscription_data
        
        except Exception as e:
            logger.error(f"Hub2 get subscription error: {str(e)}")
            raise ValueError(f"Failed to get subscription: {str(e)}")
    
    async def list_customer_subscriptions(self, customer_email: str) -> List[Dict[str, Any]]:
        """
        List all subscriptions for a customer with Hub2.
        
        Args:
            customer_email: Customer email
            
        Returns:
            List of dictionaries with subscription details
        """
        try:
            # First get customer ID
            customer_id = await self._get_or_create_customer(customer_email, create_if_not_exists=False)
            
            if not customer_id:
                logger.info(f"Customer with email {customer_email} not found in Hub2")
                return []
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/v1/customers/{customer_id}/subscriptions",
                    headers=headers
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("status") != "success":
                        logger.error(f"Hub2 list subscriptions error: {result}")
                        raise ValueError(f"Failed to list subscriptions: {result.get('message', 'Unknown error')}")
                    
                    subscriptions = result.get("data", [])
                    
                    # Process each subscription
                    result_list = []
                    for sub in subscriptions:
                        try:
                            subscription_id = sub.get("id")
                            # Get full details for each subscription
                            subscription_data = await self.get_subscription(subscription_id)
                            result_list.append(subscription_data)
                        except Exception as sub_error:
                            logger.error(f"Error getting subscription details: {str(sub_error)}")
                            continue
                    
                    return result_list
        
        except Exception as e:
            logger.error(f"Hub2 list subscriptions error: {str(e)}")
            raise ValueError(f"Failed to list subscriptions: {str(e)}")
    
    async def _get_or_create_customer(self, email: str, create_if_not_exists: bool = True) -> Optional[str]:
        """
        Get or create a customer in Hub2.
        
        Args:
            email: Customer email
            create_if_not_exists: Whether to create the customer if not found
            
        Returns:
            Customer ID or None if not found/created
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            # First try to find the customer
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/v1/customers",
                    headers=headers,
                    params={"email": email}
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200 and result.get("status") == "success":
                        customers = result.get("data", [])
                        if customers:
                            # Return the first matching customer
                            return customers[0].get("id")
            
            # If customer not found and we're allowed to create
            if create_if_not_exists:
                customer_data = {
                    "email": email,
                    "first_name": email.split("@")[0],  # Default name from email
                    "metadata": {
                        "source": "kaapi"
                    }
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{self.api_base_url}/v1/customers",
                        headers=headers,
                        json=customer_data
                    ) as response:
                        result = await response.json()
                        
                        if response.status == 200 and result.get("status") == "success":
                            return result.get("data", {}).get("id")
            
            # Customer not found or created
            return None
            
        except Exception as e:
            logger.error(f"Hub2 get/create customer error: {str(e)}")
            return None
    
    async def _create_or_get_plan(
        self, 
        name: str, 
        description: str, 
        amount: float, 
        currency: str,
        billing_period: str,
        billing_interval: int
    ) -> Optional[str]:
        """
        Create or get a subscription plan in Hub2.
        
        Args:
            name: Plan name
            description: Plan description
            amount: Plan amount
            currency: Plan currency
            billing_period: Billing period (daily, weekly, monthly, yearly)
            billing_interval: Billing interval
            
        Returns:
            Plan ID or None if failed
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Client-ID": self.api_client_id,
                "Content-Type": "application/json"
            }
            
            # Map billing period to Hub2 interval
            interval = "monthly"  # Default
            if billing_period == "daily":
                interval = f"{billing_interval}_days"
            elif billing_period == "weekly":
                interval = f"{billing_interval}_weeks"
            elif billing_period == "monthly":
                interval = f"{billing_interval}_months"
            elif billing_period == "yearly":
                interval = f"{billing_interval}_years"
                
            # Generate a unique plan code
            plan_code = f"kaapi_{name.lower().replace(' ', '_')}_{currency.lower()}_{interval}"
            
            # First check if the plan already exists
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/v1/plans",
                    headers=headers,
                    params={"code": plan_code}
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200 and result.get("status") == "success":
                        plans = result.get("data", [])
                        if plans:
                            # Return the first matching plan
                            return plans[0].get("id")
            
            # If plan not found, create it
            plan_data = {
                "name": name,
                "description": description,
                "amount": amount,
                "currency": currency,
                "interval": interval,
                "code": plan_code,
                "metadata": {
                    "source": "kaapi",
                    "billing_period": billing_period,
                    "billing_interval": billing_interval
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/v1/plans",
                    headers=headers,
                    json=plan_data
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200 and result.get("status") == "success":
                        return result.get("data", {}).get("id")
            
            # Plan not found or created
            return None
            
        except Exception as e:
            logger.error(f"Hub2 create/get plan error: {str(e)}")
            return None
    
    def _map_hub2_subscription_status_to_internal(self, status: str) -> str:
        """
        Map Hub2 subscription status to internal status.
        
        Args:
            status: Hub2 subscription status
            
        Returns:
            Internal subscription status
        """
        status_map = {
            "active": SubscriptionStatus.ACTIVE.value,
            "canceled": SubscriptionStatus.CANCELED.value,
            "cancelled": SubscriptionStatus.CANCELED.value,
            "past_due": SubscriptionStatus.PAST_DUE.value,
            "unpaid": SubscriptionStatus.PAST_DUE.value,
            "incomplete": SubscriptionStatus.PENDING.value,
            "trialing": SubscriptionStatus.ACTIVE.value,
            "trial": SubscriptionStatus.ACTIVE.value,
            "paused": SubscriptionStatus.PAUSED.value,
            "completed": SubscriptionStatus.EXPIRED.value,
            "expired": SubscriptionStatus.EXPIRED.value
        }
        
        return status_map.get(status.lower() if status else "", SubscriptionStatus.UNKNOWN.value)

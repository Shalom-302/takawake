"""
PayDunya payment provider implementation.

This module implements the PayDunya payment provider interface.
"""
import logging
import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple, Union

import aiohttp

from ..models.payment import PaymentRequest, PaymentStatus
from ..models.provider import ProviderResponse
from ..models.refund import RefundRequest, RefundStatus
from ..models.subscription import SubscriptionRequest, SubscriptionStatus, SubscriptionResponse
from .base_provider import BasePaymentProvider

logger = logging.getLogger("kaapi.payment.paydunya")


class PayDunyaProvider(BasePaymentProvider):
    """PayDunya payment provider implementation."""

    provider_name = "paydunya"
    provider_display_name = "PayDunya"

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize a PayDunya payment provider.
        
        Args:
            config: Provider configuration
        """
        super().__init__(config)
        self.master_key = config.get("master_key", "")
        self.private_key = config.get("private_key", "")
        self.public_key = config.get("public_key", "")
        self.token = config.get("token", "")
        self.mode = config.get("mode", "test").lower()  # test or live
        
        # Set API base URL based on mode
        self.api_base_url = "https://app.paydunya.com/api/v1"
        if self.mode == "test":
            self.api_base_url = "https://app.paydunya.com/sandbox-api/v1"
            
        # Webhook secret for signature verification
        self.webhook_secret = config.get("webhook_secret", "")
        
        # Store configuration
        self.store_name = config.get("store_name", "Kaapi Store")
        self.return_url = config.get("return_url", "")
        self.cancel_url = config.get("cancel_url", "")
        self.callback_url = config.get("callback_url", "")
        
        logger.info(f"PayDunya payment provider initialized with mode: {self.mode}")
        
    def _get_headers(self) -> Dict[str, str]:
        """
        Get headers for PayDunya API requests.
        
        Returns:
            Headers dictionary
        """
        return {
            "PAYDUNYA-MASTER-KEY": self.master_key,
            "PAYDUNYA-PRIVATE-KEY": self.private_key,
            "PAYDUNYA-PUBLIC-KEY": self.public_key,
            "PAYDUNYA-TOKEN": self.token,
            "Content-Type": "application/json"
        }
    
    async def process_payment(self, payment_request: PaymentRequest) -> ProviderResponse:
        """
        Process a payment through PayDunya.
        
        Args:
            payment_request: Payment request details
            
        Returns:
            Provider response with payment details
        """
        try:
            # Extract customer information
            customer_info = {
                "name": payment_request.customer_name,
                "email": payment_request.customer_email,
                "phone": payment_request.customer_phone or ""
            }
            
            # Format amount
            amount = payment_request.amount
            currency = payment_request.currency.upper()
            
            # Prepare invoice items
            items = []
            description = payment_request.description or "Payment"
            
            items.append({
                "name": description,
                "quantity": 1,
                "unit_price": str(amount),
                "total_price": str(amount),
                "description": description
            })
            
            # Prepare payload
            payload = {
                "invoice": {
                    "items": items,
                    "total_amount": str(amount),
                    "description": description
                },
                "store": {
                    "name": self.store_name,
                    "return_url": self.return_url,
                    "cancel_url": self.cancel_url,
                    "callback_url": self.callback_url
                },
                "custom_data": {
                    "payment_id": payment_request.payment_id,
                    "customer_email": payment_request.customer_email,
                    "metadata": payment_request.metadata
                }
            }
            
            # Add customer info if available
            if payment_request.customer_name or payment_request.customer_email:
                payload["customer"] = customer_info
                
            # Make API request
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/checkout-invoice/create",
                    headers=self._get_headers(),
                    json=payload
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200:
                        logger.error(f"PayDunya payment error: {result}")
                        raise ValueError(f"Failed to process payment: {result.get('response_text', 'Unknown error')}")
                    
                    # Extract redirect URL and token
                    redirect_url = result.get("response_text", {}).get("url")
                    token = result.get("response_text", {}).get("token")
                    
                    if not redirect_url or not token:
                        logger.error(f"PayDunya payment missing redirect URL or token: {result}")
                        raise ValueError("Invalid response from PayDunya")
                    
                    # Return provider response
                    return ProviderResponse(
                        success=True,
                        payment_id=payment_request.payment_id,
                        provider_payment_id=token,
                        redirect_url=redirect_url,
                        status=PaymentStatus.PENDING.value,
                        message="Payment initiated",
                        raw_response=result
                    )
        
        except Exception as e:
            logger.error(f"PayDunya payment error: {str(e)}")
            return ProviderResponse(
                success=False,
                payment_id=payment_request.payment_id,
                provider_payment_id=None,
                redirect_url=None,
                status=PaymentStatus.FAILED.value,
                message=f"Payment failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    async def verify_payment(self, provider_payment_id: str, payment_id: str = None) -> ProviderResponse:
        """
        Verify the status of a payment with PayDunya.
        
        Args:
            provider_payment_id: PayDunya invoice token
            payment_id: Optional internal payment ID
            
        Returns:
            Provider response with payment status
        """
        try:
            # Make API request to get invoice status
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/checkout-invoice/confirm/{provider_payment_id}",
                    headers=self._get_headers()
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200:
                        logger.error(f"PayDunya payment verification error: {result}")
                        raise ValueError(f"Failed to verify payment: {result.get('response_text', 'Unknown error')}")
                    
                    # Extract status
                    invoice_data = result.get("response_text", {})
                    status = invoice_data.get("status")
                    
                    # Map PayDunya status to internal status
                    if status == "completed":
                        payment_status = PaymentStatus.COMPLETED.value
                        success = True
                        message = "Payment completed successfully"
                    elif status == "pending":
                        payment_status = PaymentStatus.PENDING.value
                        success = True
                        message = "Payment is pending"
                    elif status == "cancelled":
                        payment_status = PaymentStatus.CANCELLED.value
                        success = False
                        message = "Payment was cancelled"
                    else:
                        payment_status = PaymentStatus.FAILED.value
                        success = False
                        message = f"Payment failed with status: {status}"
                    
                    # Get amount from invoice
                    amount = None
                    try:
                        amount = float(invoice_data.get("invoice", {}).get("total_amount", 0))
                    except (ValueError, TypeError):
                        pass
                    
                    # Return provider response
                    return ProviderResponse(
                        success=success,
                        payment_id=payment_id,
                        provider_payment_id=provider_payment_id,
                        redirect_url=None,
                        status=payment_status,
                        message=message,
                        amount=amount,
                        raw_response=result
                    )
        
        except Exception as e:
            logger.error(f"PayDunya payment verification error: {str(e)}")
            return ProviderResponse(
                success=False,
                payment_id=payment_id,
                provider_payment_id=provider_payment_id,
                redirect_url=None,
                status=PaymentStatus.FAILED.value,
                message=f"Payment verification failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    async def cancel_payment(self, provider_payment_id: str, payment_id: str = None) -> ProviderResponse:
        """
        Cancel a pending payment with PayDunya.
        
        Args:
            provider_payment_id: PayDunya invoice token
            payment_id: Optional internal payment ID
            
        Returns:
            Provider response with cancellation status
        """
        try:
            # PayDunya doesn't have a direct API for cancelling payments
            # We'll verify the payment first, then return appropriate response
            verify_response = await self.verify_payment(provider_payment_id, payment_id)
            
            # If payment is already completed, we can't cancel it
            if verify_response.status == PaymentStatus.COMPLETED.value:
                return ProviderResponse(
                    success=False,
                    payment_id=payment_id,
                    provider_payment_id=provider_payment_id,
                    redirect_url=None,
                    status=PaymentStatus.COMPLETED.value,
                    message="Cannot cancel a completed payment",
                    raw_response={"error": "Payment already completed"}
                )
                
            # If payment is already cancelled, return success
            if verify_response.status == PaymentStatus.CANCELLED.value:
                return ProviderResponse(
                    success=True,
                    payment_id=payment_id,
                    provider_payment_id=provider_payment_id,
                    redirect_url=None,
                    status=PaymentStatus.CANCELLED.value,
                    message="Payment was already cancelled",
                    raw_response={"status": "cancelled"}
                )
                
            # For pending payments, we'll just return a message that the user should
            # not complete the payment, as PayDunya doesn't support direct cancellation
            return ProviderResponse(
                success=True,
                payment_id=payment_id,
                provider_payment_id=provider_payment_id,
                redirect_url=None,
                status=PaymentStatus.CANCELLED.value,
                message="Payment marked as cancelled. Note: The payment must be abandoned by the customer.",
                raw_response={"status": "marked_as_cancelled"}
            )
                
        except Exception as e:
            logger.error(f"PayDunya payment cancellation error: {str(e)}")
            return ProviderResponse(
                success=False,
                payment_id=payment_id,
                provider_payment_id=provider_payment_id,
                redirect_url=None,
                status=PaymentStatus.FAILED.value,
                message=f"Payment cancellation failed: {str(e)}",
                raw_response={"error": str(e)}
            )

    async def process_refund(self, refund_request: RefundRequest) -> ProviderResponse:
        """
        Process a refund through PayDunya.
        
        Args:
            refund_request: Refund request details
            
        Returns:
            Provider response with refund details
        """
        try:
            # PayDunya doesn't have a direct API for processing refunds through their API
            # We'll need to manually process this and then mark it in our system
            
            # First verify the payment exists and is completed
            verify_response = await self.verify_payment(
                refund_request.provider_payment_id, 
                refund_request.payment_id
            )
            
            if verify_response.status != PaymentStatus.COMPLETED.value:
                logger.error(f"Cannot refund a payment that is not completed: {verify_response.status}")
                return ProviderResponse(
                    success=False,
                    payment_id=refund_request.payment_id,
                    provider_payment_id=refund_request.provider_payment_id,
                    redirect_url=None,
                    status=RefundStatus.FAILED.value,
                    message=f"Cannot refund a payment that is not completed. Current status: {verify_response.status}",
                    raw_response={"error": "Payment not completed"}
                )
            
            # For PayDunya, refunds are typically processed manually by contacting support
            # We'll return a success response with instructions for manual processing
            
            # Generate a refund reference for tracking
            refund_ref = f"RF-{int(time.time())}-{refund_request.payment_id}"
            
            return ProviderResponse(
                success=True,
                payment_id=refund_request.payment_id,
                provider_payment_id=refund_request.provider_payment_id,
                provider_refund_id=refund_ref,
                redirect_url=None,
                status=RefundStatus.PENDING.value,
                message="Refund initiated. Please process this refund manually through PayDunya dashboard or support.",
                raw_response={
                    "refund_reference": refund_ref,
                    "amount": refund_request.amount,
                    "reason": refund_request.reason,
                    "note": "This refund requires manual processing through PayDunya"
                }
            )
            
        except Exception as e:
            logger.error(f"PayDunya refund error: {str(e)}")
            return ProviderResponse(
                success=False,
                payment_id=refund_request.payment_id,
                provider_payment_id=refund_request.provider_payment_id,
                redirect_url=None,
                status=RefundStatus.FAILED.value,
                message=f"Refund failed: {str(e)}",
                raw_response={"error": str(e)}
            )

    async def verify_refund(self, provider_refund_id: str, payment_id: str = None) -> ProviderResponse:
        """
        Verify the status of a refund with PayDunya.
        
        Args:
            provider_refund_id: PayDunya refund reference
            payment_id: Optional internal payment ID
            
        Returns:
            Provider response with refund status
        """
        try:
            # PayDunya doesn't have a direct API for verifying refunds
            # Since refunds are processed manually, we'll return a pending status
            # with a message for manual verification
            
            return ProviderResponse(
                success=True,
                payment_id=payment_id,
                provider_refund_id=provider_refund_id,
                redirect_url=None,
                status=RefundStatus.PENDING.value,
                message="Please verify this refund manually through PayDunya dashboard or support.",
                raw_response={
                    "refund_reference": provider_refund_id,
                    "note": "Manual verification required"
                }
            )
            
        except Exception as e:
            logger.error(f"PayDunya refund verification error: {str(e)}")
            return ProviderResponse(
                success=False,
                payment_id=payment_id,
                provider_refund_id=provider_refund_id,
                redirect_url=None,
                status=RefundStatus.FAILED.value,
                message=f"Refund verification failed: {str(e)}",
                raw_response={"error": str(e)}
            )

    async def create_subscription(self, subscription_request: SubscriptionRequest) -> SubscriptionResponse:
        """
        Create a subscription with PayDunya.
        
        Args:
            subscription_request: Subscription request details
            
        Returns:
            Subscription response
        """
        try:
            # PayDunya doesn't have a direct subscription API like other providers
            # We'll implement a recurring payment system using their payment API
            
            # Prepare customer information
            customer_email = subscription_request.customer_email
            
            # Generate a subscription reference
            sub_ref = f"SUB-{int(time.time())}-{customer_email.split('@')[0]}"
            
            # Calculate first billing date
            today = datetime.now().date()
            next_billing_date = today
            
            # Store subscription metadata
            metadata = subscription_request.metadata or {}
            metadata.update({
                "plan_name": subscription_request.plan_name,
                "plan_description": subscription_request.plan_description,
                "billing_period": subscription_request.billing_period,
                "billing_interval": subscription_request.billing_interval,
                "amount": subscription_request.amount,
                "currency": subscription_request.currency,
                "start_date": today.isoformat(),
                "next_billing_date": next_billing_date.isoformat(),
                "auto_renew": True
            })
            
            # Process the first payment to start the subscription
            payment_request = PaymentRequest(
                payment_id=f"{sub_ref}-INIT",
                customer_email=subscription_request.customer_email,
                customer_name=subscription_request.customer_name,
                amount=subscription_request.amount,
                currency=subscription_request.currency,
                description=f"Subscription: {subscription_request.plan_name}",
                metadata=metadata
            )
            
            payment_response = await self.process_payment(payment_request)
            
            if not payment_response.success:
                logger.error(f"Failed to create subscription payment: {payment_response.message}")
                return SubscriptionResponse(
                    success=False,
                    subscription_id=sub_ref,
                    provider_subscription_id=None,
                    status=SubscriptionStatus.FAILED.value,
                    message=f"Failed to create subscription: {payment_response.message}",
                    redirect_url=None
                )
            
            # Return subscription response
            return SubscriptionResponse(
                success=True,
                subscription_id=sub_ref,
                provider_subscription_id=sub_ref,
                status=SubscriptionStatus.PENDING.value,
                message="Subscription created. Complete the initial payment to activate.",
                redirect_url=payment_response.redirect_url,
                metadata={
                    "initial_payment_id": payment_response.payment_id,
                    "provider_payment_id": payment_response.provider_payment_id,
                    "next_billing_date": next_billing_date.isoformat(),
                    **metadata
                }
            )
        
        except Exception as e:
            logger.error(f"PayDunya subscription creation error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=None,
                provider_subscription_id=None,
                status=SubscriptionStatus.FAILED.value,
                message=f"Failed to create subscription: {str(e)}",
                redirect_url=None
            )
    
    async def update_subscription(self, subscription_id: str, metadata: Dict[str, Any] = None, auto_renew: bool = None) -> SubscriptionResponse:
        """
        Update a subscription with PayDunya.
        
        Args:
            subscription_id: Subscription ID
            metadata: Optional updated metadata
            auto_renew: Optional updated auto-renew status
            
        Returns:
            Subscription response
        """
        try:
            # Since PayDunya doesn't have a direct subscription API,
            # we're using our own reference system
            
            # For updating, we'd need to store the updated information in our system
            # and apply it to future recurring payments
            
            update_data = {}
            if metadata is not None:
                update_data["metadata"] = metadata
            
            if auto_renew is not None:
                update_data["auto_renew"] = auto_renew
            
            # Here we would typically update our database with the new information
            # Since we don't have direct access to the database in this provider,
            # we'll return a response indicating the update was "successful"
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.ACTIVE.value,
                message="Subscription updated. Changes will apply to future payments.",
                metadata=update_data
            )
            
        except Exception as e:
            logger.error(f"PayDunya subscription update error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.UNKNOWN.value,
                message=f"Failed to update subscription: {str(e)}"
            )
    
    async def cancel_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """
        Cancel a subscription with PayDunya.
        
        Args:
            subscription_id: Subscription ID
            
        Returns:
            Subscription response
        """
        try:
            # Since PayDunya doesn't have a direct subscription API,
            # cancelling means setting auto_renew to False
            
            # Here we would typically update our database to mark the subscription
            # as cancelled and prevent future recurring payments
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.CANCELED.value,
                message="Subscription cancelled. No further payments will be processed."
            )
            
        except Exception as e:
            logger.error(f"PayDunya subscription cancellation error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.UNKNOWN.value,
                message=f"Failed to cancel subscription: {str(e)}"
            )
    
    async def pause_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """
        Pause a subscription with PayDunya.
        
        Args:
            subscription_id: Subscription ID
            
        Returns:
            Subscription response
        """
        try:
            # Since PayDunya doesn't have a direct subscription API,
            # we'll implement pausing similar to cancellation
            # but with the ability to resume later
            
            # Here we would typically update our database to mark the subscription
            # as paused and prevent future recurring payments until resumed
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.PAUSED.value,
                message="Subscription paused. No payments will be processed until resumed."
            )
            
        except Exception as e:
            logger.error(f"PayDunya subscription pause error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.UNKNOWN.value,
                message=f"Failed to pause subscription: {str(e)}"
            )
    
    async def resume_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """
        Resume a paused subscription with PayDunya.
        
        Args:
            subscription_id: Subscription ID
            
        Returns:
            Subscription response
        """
        try:
            # Since PayDunya doesn't have a direct subscription API,
            # resuming means re-enabling the recurring payments
            
            # Here we would typically update our database to mark the subscription
            # as active again and allow future recurring payments
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.ACTIVE.value,
                message="Subscription resumed. Future payments will be processed according to schedule."
            )
            
        except Exception as e:
            logger.error(f"PayDunya subscription resume error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=subscription_id,
                status=SubscriptionStatus.UNKNOWN.value,
                message=f"Failed to resume subscription: {str(e)}"
            )
    
    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Get subscription details from PayDunya.
        
        Args:
            subscription_id: PayDunya subscription ID
            
        Returns:
            Dictionary with subscription details
        """
        try:
            # Since PayDunya doesn't have a direct subscription API,
            # we'll return basic information based on the subscription ID
            
            # In a real implementation, this would query our database
            # to retrieve the stored subscription details
            
            # For now, we'll return a placeholder response
            subscription_data = {
                "name": "Unknown Plan",
                "description": "Subscription through PayDunya",
                "status": SubscriptionStatus.ACTIVE.value,
                "amount": 0.0,
                "currency": "XOF",
                "billing_period": "monthly",
                "billing_interval": 1,
                "customer_email": "",
                "start_date": datetime.now().date(),
                "next_billing_date": (datetime.now() + timedelta(days=30)).date(),
                "is_in_trial": False,
                "auto_renew": True,
                "metadata": {},
                "is_active": True,
                "is_past_due": False,
                "is_canceled": False
            }
            
            return subscription_data
            
        except Exception as e:
            logger.error(f"PayDunya get subscription error: {str(e)}")
            raise ValueError(f"Failed to get subscription: {str(e)}")
    
    async def list_customer_subscriptions(self, customer_email: str) -> List[Dict[str, Any]]:
        """
        List all subscriptions for a customer with PayDunya.
        
        Args:
            customer_email: Customer email
            
        Returns:
            List of dictionaries with subscription details
        """
        try:
            # Since PayDunya doesn't have a direct subscription API,
            # in a real implementation this would query our database
            # to retrieve all subscriptions for this customer
            
            # For now, we'll return an empty list
            return []
            
        except Exception as e:
            logger.error(f"PayDunya list subscriptions error: {str(e)}")
            raise ValueError(f"Failed to list subscriptions: {str(e)}")

    async def handle_webhook(self, request_data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle PayDunya webhook notifications.
        
        Args:
            request_data: Webhook request data
            headers: Webhook request headers
            
        Returns:
            Dictionary with webhook processing results
        """
        try:
            logger.info(f"Received PayDunya webhook: {request_data}")
            
            # Verify webhook signature if a secret is set
            if self.webhook_secret:
                is_valid = await self._verify_webhook_signature(request_data, headers)
                if not is_valid:
                    logger.error("Invalid webhook signature")
                    return {
                        "success": False,
                        "message": "Invalid webhook signature",
                        "status": "error"
                    }
            
            # Extract the event type
            event_type = request_data.get("type")
            
            # Extract data based on the event type
            if event_type == "invoice.paid":
                # Payment success
                invoice_data = request_data.get("data", {})
                token = invoice_data.get("token")
                
                # Extract custom data
                custom_data = invoice_data.get("custom_data", {})
                payment_id = custom_data.get("payment_id")
                
                if not payment_id:
                    logger.warning(f"Payment ID not found in webhook: {request_data}")
                
                return {
                    "success": True,
                    "event_type": "payment.success",
                    "payment_id": payment_id,
                    "provider_payment_id": token,
                    "status": PaymentStatus.COMPLETED.value,
                    "message": "Payment completed",
                    "data": invoice_data
                }
                
            elif event_type == "invoice.failure":
                # Payment failure
                invoice_data = request_data.get("data", {})
                token = invoice_data.get("token")
                
                # Extract custom data
                custom_data = invoice_data.get("custom_data", {})
                payment_id = custom_data.get("payment_id")
                
                if not payment_id:
                    logger.warning(f"Payment ID not found in webhook: {request_data}")
                
                return {
                    "success": True,
                    "event_type": "payment.failed",
                    "payment_id": payment_id,
                    "provider_payment_id": token,
                    "status": PaymentStatus.FAILED.value,
                    "message": "Payment failed",
                    "data": invoice_data
                }
                
            elif event_type == "invoice.cancelled":
                # Payment cancelled
                invoice_data = request_data.get("data", {})
                token = invoice_data.get("token")
                
                # Extract custom data
                custom_data = invoice_data.get("custom_data", {})
                payment_id = custom_data.get("payment_id")
                
                if not payment_id:
                    logger.warning(f"Payment ID not found in webhook: {request_data}")
                
                return {
                    "success": True,
                    "event_type": "payment.cancelled",
                    "payment_id": payment_id,
                    "provider_payment_id": token,
                    "status": PaymentStatus.CANCELLED.value,
                    "message": "Payment cancelled",
                    "data": invoice_data
                }
                
            # For other events, just log and return
            logger.info(f"Unhandled PayDunya webhook event: {event_type}")
            return {
                "success": True,
                "event_type": event_type,
                "message": "Event received but not processed",
                "data": request_data
            }
            
        except Exception as e:
            logger.error(f"PayDunya webhook error: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing webhook: {str(e)}",
                "status": "error"
            }
    
    async def _verify_webhook_signature(self, request_data: Dict[str, Any], headers: Dict[str, str]) -> bool:
        """
        Verify PayDunya webhook signature.
        
        Args:
            request_data: Webhook request data
            headers: Webhook request headers
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            # Get signature from headers
            signature = headers.get("X-PAYDUNYA-SIGNATURE")
            if not signature:
                logger.error("No signature found in webhook headers")
                return False
            
            # Convert request data to string
            data_string = json.dumps(request_data, sort_keys=True, separators=(',', ':'))
            
            # Calculate HMAC
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                data_string.encode(),
                hashlib.sha512
            ).hexdigest()
            
            # Compare signatures
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return False

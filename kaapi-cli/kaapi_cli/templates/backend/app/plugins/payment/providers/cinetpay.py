"""
CinetPay payment provider implementation.

This module implements the CinetPay payment provider interface.
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

logger = logging.getLogger("kaapi.payment.cinetpay")


class CinetPayProvider(BasePaymentProvider):
    """CinetPay payment provider implementation."""

    provider_name = "cinetpay"
    provider_display_name = "CinetPay"

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize a CinetPay payment provider.
        
        Args:
            config: Provider configuration
        """
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.site_id = config.get("site_id", "")
        self.mode = config.get("mode", "test").lower()  # test or live
        
        # Set API base URL based on mode
        self.api_base_url = "https://api-checkout.cinetpay.com/v2"
        if self.mode == "test":
            self.api_base_url = "https://api-checkout.cinetpay.com/v2/sandbox"
            
        # Webhook secret for signature verification
        self.webhook_secret = config.get("webhook_secret", "")
        
        # Store configuration
        self.return_url = config.get("return_url", "")
        self.cancel_url = config.get("cancel_url", "")
        self.notify_url = config.get("notify_url", "")
        
        logger.info(f"CinetPay payment provider initialized with mode: {self.mode}")

    async def process_payment(self, payment_request: PaymentRequest) -> ProviderResponse:
        """
        Process a payment through CinetPay.
        
        Args:
            payment_request: Payment request details
            
        Returns:
            Provider response with payment details
        """
        try:
            # Extract customer information
            customer_name = payment_request.customer_name or "Customer"
            customer_email = payment_request.customer_email or ""
            customer_phone = payment_request.customer_phone or ""
            
            # Format amount (CinetPay expects amount in smallest currency unit)
            # For most currencies this is 100 = 1 unit (e.g., 100 cents = 1 USD)
            amount = int(payment_request.amount * 100)
            currency = payment_request.currency.upper()
            
            # Generate a unique transaction ID
            transaction_id = f"TX-{int(time.time())}-{payment_request.payment_id}"
            
            # Prepare the payment data
            payment_data = {
                "apikey": self.api_key,
                "site_id": self.site_id,
                "transaction_id": transaction_id,
                "amount": amount,
                "currency": currency,
                "description": payment_request.description or "Payment",
                "customer_name": customer_name,
                "customer_email": customer_email,
                "customer_phone_number": customer_phone,
                "return_url": self.return_url,
                "cancel_url": self.cancel_url,
                "notify_url": self.notify_url,
                "metadata": {
                    "payment_id": payment_request.payment_id,
                    "custom_data": payment_request.metadata
                },
                "channels": "ALL"  # Accept all payment channels
            }
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/payment",
                    json=payment_data
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200 or result.get("code") != "201":
                        logger.error(f"CinetPay payment error: {result}")
                        raise ValueError(f"Failed to process payment: {result.get('message', 'Unknown error')}")
                    
                    # Extract payment URL and data
                    payment_data = result.get("data", {})
                    payment_url = payment_data.get("payment_url")
                    payment_token = payment_data.get("payment_token")
                    
                    if not payment_url:
                        logger.error(f"CinetPay payment missing payment URL: {result}")
                        raise ValueError("Invalid response from CinetPay")
                    
                    # Return provider response
                    return ProviderResponse(
                        success=True,
                        payment_id=payment_request.payment_id,
                        provider_payment_id=payment_token or transaction_id,
                        redirect_url=payment_url,
                        status=PaymentStatus.PENDING.value,
                        message="Payment initiated",
                        raw_response=result
                    )
        
        except Exception as e:
            logger.error(f"CinetPay payment error: {str(e)}")
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
        Verify the status of a payment with CinetPay.
        
        Args:
            provider_payment_id: CinetPay payment token or transaction ID
            payment_id: Optional internal payment ID
            
        Returns:
            Provider response with payment status
        """
        try:
            # Prepare the verification data
            verification_data = {
                "apikey": self.api_key,
                "site_id": self.site_id,
                "transaction_id": provider_payment_id
            }
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/payment/check",
                    json=verification_data
                ) as response:
                    result = await response.json()
                    
                    if response.status != 200:
                        logger.error(f"CinetPay payment verification error: {result}")
                        raise ValueError(f"Failed to verify payment: {result.get('message', 'Unknown error')}")
                    
                    # Extract payment status
                    payment_data = result.get("data", {})
                    status_code = payment_data.get("status")
                    
                    # Map CinetPay status to internal status
                    if status_code == "ACCEPTED":
                        payment_status = PaymentStatus.COMPLETED.value
                        success = True
                        message = "Payment completed successfully"
                    elif status_code == "PENDING":
                        payment_status = PaymentStatus.PENDING.value
                        success = True
                        message = "Payment is pending"
                    elif status_code == "CANCELED":
                        payment_status = PaymentStatus.CANCELLED.value
                        success = False
                        message = "Payment was cancelled"
                    elif status_code == "REFUSED":
                        payment_status = PaymentStatus.FAILED.value
                        success = False
                        message = "Payment was refused"
                    else:
                        payment_status = PaymentStatus.FAILED.value
                        success = False
                        message = f"Payment failed with status: {status_code}"
                    
                    # Get amount from response
                    amount = None
                    try:
                        amount = float(payment_data.get("amount", 0)) / 100  # Convert from cents
                    except (ValueError, TypeError):
                        pass
                    
                    # Get currency from response
                    currency = payment_data.get("currency")
                    
                    # Return provider response
                    return ProviderResponse(
                        success=success,
                        payment_id=payment_id,
                        provider_payment_id=provider_payment_id,
                        redirect_url=None,
                        status=payment_status,
                        message=message,
                        amount=amount,
                        currency=currency,
                        raw_response=result
                    )
        
        except Exception as e:
            logger.error(f"CinetPay payment verification error: {str(e)}")
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
        Cancel a pending payment with CinetPay.
        
        Args:
            provider_payment_id: CinetPay payment token or transaction ID
            payment_id: Optional internal payment ID
            
        Returns:
            Provider response with cancellation status
        """
        try:
            # CinetPay doesn't have a direct API for cancelling payments
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
            # not complete the payment, as CinetPay doesn't support direct cancellation
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
            logger.error(f"CinetPay payment cancellation error: {str(e)}")
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
        Process a refund through CinetPay.
        
        Args:
            refund_request: Refund request details
            
        Returns:
            Provider response with refund details
        """
        try:
            # CinetPay doesn't have a direct API for processing refunds through their API
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
            
            # For CinetPay, refunds are typically processed manually by contacting support
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
                message="Refund initiated. Please process this refund manually through CinetPay dashboard or support.",
                raw_response={
                    "refund_reference": refund_ref,
                    "amount": refund_request.amount,
                    "reason": refund_request.reason,
                    "note": "This refund requires manual processing through CinetPay"
                }
            )
            
        except Exception as e:
            logger.error(f"CinetPay refund error: {str(e)}")
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
        Verify the status of a refund with CinetPay.
        
        Args:
            provider_refund_id: CinetPay refund reference
            payment_id: Optional internal payment ID
            
        Returns:
            Provider response with refund status
        """
        try:
            # CinetPay doesn't have a direct API for verifying refunds
            # Since refunds are processed manually, we'll return a pending status
            # with a message for manual verification
            
            return ProviderResponse(
                success=True,
                payment_id=payment_id,
                provider_refund_id=provider_refund_id,
                redirect_url=None,
                status=RefundStatus.PENDING.value,
                message="Please verify this refund manually through CinetPay dashboard or support.",
                raw_response={
                    "refund_reference": provider_refund_id,
                    "note": "Manual verification required"
                }
            )
            
        except Exception as e:
            logger.error(f"CinetPay refund verification error: {str(e)}")
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
        Create a subscription with CinetPay.
        
        Args:
            subscription_request: Subscription request details
            
        Returns:
            Subscription response with subscription details
        """
        try:
            # CinetPay doesn't have a direct subscription API
            # We'll implement this by creating a normal payment first,
            # and then storing subscription details for future payments
            
            # Create a payment request for the first payment
            payment_request = PaymentRequest(
                payment_id=subscription_request.subscription_id,
                amount=subscription_request.amount,
                currency=subscription_request.currency,
                description=subscription_request.description or "Subscription payment",
                customer_email=subscription_request.customer_email,
                customer_name=subscription_request.customer_name,
                customer_phone=subscription_request.customer_phone,
                metadata={
                    "subscription_id": subscription_request.subscription_id,
                    "is_subscription": True,
                    "subscription_period": subscription_request.interval,
                    "billing_cycle": subscription_request.interval,
                    "autorenew": subscription_request.auto_renew,
                    "start_date": datetime.now().isoformat(),
                    "custom_data": subscription_request.metadata
                }
            )
            
            # Process the initial payment
            payment_response = await self.process_payment(payment_request)
            
            if not payment_response.success:
                logger.error(f"Failed to create initial payment for subscription: {payment_response.message}")
                return SubscriptionResponse(
                    success=False,
                    subscription_id=subscription_request.subscription_id,
                    provider_subscription_id=None,
                    redirect_url=None,
                    status=SubscriptionStatus.FAILED.value,
                    message=f"Failed to create subscription: {payment_response.message}",
                    raw_response=payment_response.raw_response
                )
            
            # Generate a subscription reference
            subscription_ref = f"SUB-{int(time.time())}-{subscription_request.subscription_id}"
            
            # For subscription, we need to return the payment URL for the first payment
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_request.subscription_id,
                provider_subscription_id=subscription_ref,
                redirect_url=payment_response.redirect_url,
                status=SubscriptionStatus.ACTIVE.value,
                message="Subscription created. Customer must complete the first payment.",
                amount=subscription_request.amount,
                currency=subscription_request.currency,
                interval=subscription_request.interval,
                provider_payment_id=payment_response.provider_payment_id,
                next_payment_date=(datetime.now() + self._get_interval_timedelta(subscription_request.interval)).isoformat(),
                raw_response={
                    "subscription_reference": subscription_ref,
                    "initial_payment": payment_response.raw_response,
                    "note": "Manual renewal required for future payments"
                }
            )
            
        except Exception as e:
            logger.error(f"CinetPay subscription creation error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_request.subscription_id,
                provider_subscription_id=None,
                redirect_url=None,
                status=SubscriptionStatus.FAILED.value,
                message=f"Subscription creation failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    def _get_interval_timedelta(self, interval: str) -> timedelta:
        """Convert interval string to timedelta."""
        interval = interval.lower()
        if interval == "daily":
            return timedelta(days=1)
        elif interval == "weekly":
            return timedelta(weeks=1)
        elif interval == "monthly":
            return timedelta(days=30)
        elif interval == "quarterly":
            return timedelta(days=90)
        elif interval == "biannual":
            return timedelta(days=182)
        elif interval == "annual":
            return timedelta(days=365)
        else:
            return timedelta(days=30)  # Default to monthly
    
    async def update_subscription(self, provider_subscription_id: str, metadata: Dict[str, Any] = None, 
                                  auto_renew: bool = None, subscription_id: str = None) -> SubscriptionResponse:
        """
        Update a subscription with CinetPay.
        
        Args:
            provider_subscription_id: CinetPay subscription reference
            metadata: Optional updated metadata
            auto_renew: Optional updated auto_renew setting
            subscription_id: Optional internal subscription ID
            
        Returns:
            Subscription response with update status
        """
        try:
            # CinetPay doesn't have a direct subscription API
            # We'll return a success response with updated metadata for our records
            
            response_metadata = {}
            if metadata is not None:
                response_metadata["metadata"] = metadata
                
            if auto_renew is not None:
                response_metadata["auto_renew"] = auto_renew
                
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.ACTIVE.value,
                message="Subscription updated in local records. Note: Changes are only reflected locally.",
                raw_response=response_metadata
            )
            
        except Exception as e:
            logger.error(f"CinetPay subscription update error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.FAILED.value,
                message=f"Subscription update failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    async def cancel_subscription(self, provider_subscription_id: str, subscription_id: str = None) -> SubscriptionResponse:
        """
        Cancel a subscription with CinetPay.
        
        Args:
            provider_subscription_id: CinetPay subscription reference
            subscription_id: Optional internal subscription ID
            
        Returns:
            Subscription response with cancellation status
        """
        try:
            # CinetPay doesn't have a direct subscription API
            # We'll return a success response for our records
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.CANCELLED.value,
                message="Subscription cancelled in local records. No further payments will be processed.",
                raw_response={"status": "cancelled"}
            )
            
        except Exception as e:
            logger.error(f"CinetPay subscription cancellation error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.FAILED.value,
                message=f"Subscription cancellation failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    async def pause_subscription(self, provider_subscription_id: str, subscription_id: str = None) -> SubscriptionResponse:
        """
        Pause a subscription with CinetPay.
        
        Args:
            provider_subscription_id: CinetPay subscription reference
            subscription_id: Optional internal subscription ID
            
        Returns:
            Subscription response with pause status
        """
        try:
            # CinetPay doesn't have a direct subscription API
            # We'll return a success response for our records
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.PAUSED.value,
                message="Subscription paused in local records. No payments will be processed until resumed.",
                raw_response={"status": "paused"}
            )
            
        except Exception as e:
            logger.error(f"CinetPay subscription pause error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.FAILED.value,
                message=f"Subscription pause failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    async def resume_subscription(self, provider_subscription_id: str, subscription_id: str = None) -> SubscriptionResponse:
        """
        Resume a paused subscription with CinetPay.
        
        Args:
            provider_subscription_id: CinetPay subscription reference
            subscription_id: Optional internal subscription ID
            
        Returns:
            Subscription response with resume status
        """
        try:
            # CinetPay doesn't have a direct subscription API
            # We'll return a success response for our records
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.ACTIVE.value,
                message="Subscription resumed in local records. Payments will be processed on schedule.",
                raw_response={"status": "active"}
            )
            
        except Exception as e:
            logger.error(f"CinetPay subscription resume error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.FAILED.value,
                message=f"Subscription resume failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    async def get_subscription(self, provider_subscription_id: str, subscription_id: str = None) -> SubscriptionResponse:
        """
        Get subscription details from CinetPay.
        
        Args:
            provider_subscription_id: CinetPay subscription reference
            subscription_id: Optional internal subscription ID
            
        Returns:
            Subscription response with subscription details
        """
        try:
            # CinetPay doesn't have a direct subscription API
            # We'll return a generic response for our records
            
            return SubscriptionResponse(
                success=True,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.ACTIVE.value,
                message="Subscription details retrieved from local records. Note: This doesn't reflect actual status in CinetPay.",
                raw_response={"provider_subscription_id": provider_subscription_id}
            )
            
        except Exception as e:
            logger.error(f"CinetPay subscription details retrieval error: {str(e)}")
            return SubscriptionResponse(
                success=False,
                subscription_id=subscription_id,
                provider_subscription_id=provider_subscription_id,
                redirect_url=None,
                status=SubscriptionStatus.FAILED.value,
                message=f"Failed to retrieve subscription details: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    async def list_customer_subscriptions(self, customer_email: str) -> List[SubscriptionResponse]:
        """
        List subscriptions for a customer with CinetPay.
        
        Args:
            customer_email: Customer email
            
        Returns:
            List of subscription responses
        """
        try:
            # CinetPay doesn't have a direct subscription API
            # We'll return an empty list since we can't query by customer email
            
            return []
            
        except Exception as e:
            logger.error(f"CinetPay customer subscriptions listing error: {str(e)}")
            return []
            
    async def handle_webhook(self, data: Dict[str, Any], headers: Dict[str, str]) -> ProviderResponse:
        """
        Handle webhook notifications from CinetPay.
        
        Args:
            data: Webhook data
            headers: Request headers
            
        Returns:
            Provider response
        """
        try:
            logger.info(f"Received CinetPay webhook: {data}")
            
            # Verify webhook signature if available
            signature_header = headers.get("x-cinetpay-signature")
            if signature_header and self.webhook_secret:
                is_valid = self._verify_webhook_signature(data, signature_header)
                if not is_valid:
                    logger.error("Invalid CinetPay webhook signature")
                    return ProviderResponse(
                        success=False,
                        message="Invalid webhook signature",
                        raw_response={"error": "Invalid signature"}
                    )
            
            # Extract transaction ID and data
            transaction_id = data.get("transaction_id")
            if not transaction_id:
                logger.error("Missing transaction_id in CinetPay webhook")
                return ProviderResponse(
                    success=False,
                    message="Missing transaction_id in webhook data",
                    raw_response={"error": "Missing transaction_id"}
                )
            
            cpm_trans_status = data.get("cpm_trans_status")
            cpm_error_message = data.get("cpm_error_message")
            
            # Extract payment ID from metadata if available
            metadata = data.get("metadata", {})
            payment_id = metadata.get("payment_id")
            
            # Map CinetPay status to internal status
            if cpm_trans_status == "ACCEPTED":
                payment_status = PaymentStatus.COMPLETED.value
                success = True
                message = "Payment completed successfully"
            elif cpm_trans_status == "PENDING":
                payment_status = PaymentStatus.PENDING.value
                success = True
                message = "Payment is pending"
            elif cpm_trans_status == "CANCELED":
                payment_status = PaymentStatus.CANCELLED.value
                success = False
                message = "Payment was cancelled"
            elif cpm_trans_status == "REFUSED":
                payment_status = PaymentStatus.FAILED.value
                success = False
                message = f"Payment was refused: {cpm_error_message or 'Unknown reason'}"
            else:
                payment_status = PaymentStatus.FAILED.value
                success = False
                message = f"Payment failed with status: {cpm_trans_status}"
            
            # Get amount and currency from the webhook data
            amount = None
            try:
                amount = float(data.get("amount", 0)) / 100  # Convert from cents
            except (ValueError, TypeError):
                pass
            
            currency = data.get("currency")
            
            # Return provider response
            return ProviderResponse(
                success=success,
                payment_id=payment_id,
                provider_payment_id=transaction_id,
                status=payment_status,
                message=message,
                amount=amount,
                currency=currency,
                raw_response=data
            )
            
        except Exception as e:
            logger.error(f"CinetPay webhook processing error: {str(e)}")
            return ProviderResponse(
                success=False,
                message=f"Webhook processing failed: {str(e)}",
                raw_response={"error": str(e)}
            )
    
    def _verify_webhook_signature(self, data: Dict[str, Any], signature: str) -> bool:
        """
        Verify the signature of a CinetPay webhook.
        
        Args:
            data: Webhook data
            signature: Signature from the webhook header
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            # Convert the data to a sorted JSON string
            payload = json.dumps(data, sort_keys=True)
            
            # Calculate HMAC with SHA256
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures using hmac.compare_digest to prevent timing attacks
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Error verifying CinetPay webhook signature: {str(e)}")
            return False

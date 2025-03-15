"""
Stripe payment provider for the Kaapi payment plugin.

This module implements the Stripe payment provider for processing payments,
refunds, and subscriptions.
"""
import logging
import stripe
from typing import Dict, Any, Optional, List
import asyncio
from datetime import datetime

from ..models.provider import PaymentRequest, PaymentResponse, RefundRequest, RefundResponse
from ..models.payment import PaymentStatus, RefundStatus
from .base_provider import BasePaymentProvider
from .provider_factory import PaymentProviderFactory

logger = logging.getLogger("kaapi.payment.stripe")

@PaymentProviderFactory.register
class StripeProvider(BasePaymentProvider):
    """Stripe payment provider implementation."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the Stripe provider.
        
        Args:
            config: Provider configuration
        """
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.webhook_secret = config.get("webhook_secret", "")
        self.success_url = config.get("success_url", "")
        self.cancel_url = config.get("cancel_url", "")
        
        # Set the API key
        stripe.api_key = self.api_key
        
        # Default currency if not specified
        self.default_currency = config.get("default_currency", "USD")
        
        # Set provider information
        self._name = "Stripe"
        self._id = "stripe"
        self._description = "Stripe payment processor"
        self._supported_methods = ["card", "bank_transfer", "alipay", "wechat", "sepa"]
        self._supported_currencies = ["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "HKD", "SGD", "CHF"]
        self._supports_refunds = True
        self._supports_partial_refunds = True
        
        logger.info(f"Stripe payment provider initialized")
    
    async def process_payment(self, request: PaymentRequest) -> PaymentResponse:
        """
        Process a payment request with Stripe.
        
        Args:
            request: Payment request
            
        Returns:
            Payment response
        """
        try:
            # Create a payment intent or checkout session based on the request type
            if request.payment_method == "card" and request.card_details:
                # Direct charge with card details
                return await self._process_direct_charge(request)
            else:
                # Create a checkout session for other payment methods
                return await self._create_checkout_session(request)
                
        except Exception as e:
            logger.error(f"Error processing Stripe payment: {str(e)}")
            return PaymentResponse(
                success=False,
                message=f"Failed to process payment: {str(e)}",
                provider_reference="",
                redirect_url=None,
                status=PaymentStatus.FAILED.value,
                provider_response={
                    "error": str(e)
                }
            )
    
    async def _process_direct_charge(self, request: PaymentRequest) -> PaymentResponse:
        """
        Process a direct charge with card details.
        
        Args:
            request: Payment request
            
        Returns:
            Payment response
        """
        try:
            # Create a payment method
            payment_method = stripe.PaymentMethod.create(
                type="card",
                card={
                    "number": request.card_details.get("number"),
                    "exp_month": int(request.card_details.get("exp_month")),
                    "exp_year": int(request.card_details.get("exp_year")),
                    "cvc": request.card_details.get("cvc")
                }
            )
            
            # Create a payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(request.amount * 100),  # Convert to cents
                currency=request.currency.lower(),
                payment_method=payment_method.id,
                description=request.description or f"Payment for {request.customer_email or 'customer'}",
                confirm=True,
                return_url=self.success_url,
                receipt_email=request.customer_email
            )
            
            # Check payment status
            if intent.status == "succeeded":
                status = PaymentStatus.COMPLETED.value
                success = True
                message = "Payment processed successfully"
            elif intent.status == "processing":
                status = PaymentStatus.PROCESSING.value
                success = True
                message = "Payment is being processed"
            else:
                status = PaymentStatus.FAILED.value
                success = False
                message = f"Payment failed with status: {intent.status}"
            
            return PaymentResponse(
                success=success,
                message=message,
                provider_reference=intent.id,
                redirect_url=None,
                status=status,
                provider_response={
                    "id": intent.id,
                    "amount": intent.amount / 100,
                    "currency": intent.currency,
                    "status": intent.status,
                    "receipt_url": intent.get("charges", {}).data[0].receipt_url if intent.get("charges", {}).data else None
                }
            )
                
        except stripe.error.CardError as e:
            logger.error(f"Card error: {str(e)}")
            return PaymentResponse(
                success=False,
                message=f"Card error: {e.user_message}",
                provider_reference="",
                redirect_url=None,
                status=PaymentStatus.FAILED.value,
                provider_response={
                    "error": str(e),
                    "code": e.code,
                    "decline_code": e.json_body.get("error", {}).get("decline_code"),
                    "message": e.user_message
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing direct charge: {str(e)}")
            return PaymentResponse(
                success=False,
                message=f"Failed to process payment: {str(e)}",
                provider_reference="",
                redirect_url=None,
                status=PaymentStatus.FAILED.value,
                provider_response={
                    "error": str(e)
                }
            )
    
    async def _create_checkout_session(self, request: PaymentRequest) -> PaymentResponse:
        """
        Create a Stripe checkout session for payment.
        
        Args:
            request: Payment request
            
        Returns:
            Payment response
        """
        try:
            # Create a checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=self._get_payment_method_types(request.payment_method),
                line_items=[{
                    "price_data": {
                        "currency": request.currency.lower(),
                        "product_data": {
                            "name": request.description or "Payment",
                        },
                        "unit_amount": int(request.amount * 100),  # Convert to cents
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url=request.success_url or self.success_url,
                cancel_url=request.cancel_url or self.cancel_url,
                customer_email=request.customer_email,
                metadata={
                    "payment_id": str(request.payment_id),
                    "customer_id": str(request.customer_id) if request.customer_id else "",
                    "reference": request.reference or ""
                }
            )
            
            return PaymentResponse(
                success=True,
                message="Checkout session created",
                provider_reference=session.id,
                redirect_url=session.url,
                status=PaymentStatus.PENDING.value,
                provider_response={
                    "id": session.id,
                    "url": session.url,
                    "payment_intent": session.payment_intent,
                    "expires_at": datetime.fromtimestamp(session.expires_at).isoformat() if session.expires_at else None
                }
            )
                
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return PaymentResponse(
                success=False,
                message=f"Failed to create checkout session: {str(e)}",
                provider_reference="",
                redirect_url=None,
                status=PaymentStatus.FAILED.value,
                provider_response={
                    "error": str(e)
                }
            )
    
    async def verify_payment(self, payment_id: str, provider_reference: str) -> PaymentResponse:
        """
        Verify a payment status with Stripe.
        
        Args:
            payment_id: Internal payment ID
            provider_reference: Stripe payment intent or session ID
            
        Returns:
            Payment response with current status
        """
        try:
            # Check if the reference is a checkout session or payment intent
            if provider_reference.startswith("cs_"):
                # It's a checkout session
                session = stripe.checkout.Session.retrieve(provider_reference)
                
                # If session has a payment intent, get that
                if session.payment_intent:
                    payment_intent = stripe.PaymentIntent.retrieve(session.payment_intent)
                    return self._payment_intent_to_response(payment_intent)
                else:
                    # Session without payment intent
                    return PaymentResponse(
                        success=True,
                        message="Checkout session status retrieved",
                        provider_reference=provider_reference,
                        redirect_url=session.url,
                        status=PaymentStatus.PENDING.value,
                        provider_response={
                            "id": session.id,
                            "status": session.status,
                            "payment_status": session.payment_status
                        }
                    )
            
            elif provider_reference.startswith("pi_"):
                # It's a payment intent
                payment_intent = stripe.PaymentIntent.retrieve(provider_reference)
                return self._payment_intent_to_response(payment_intent)
            
            else:
                # Unknown reference format
                return PaymentResponse(
                    success=False,
                    message=f"Unknown provider reference format: {provider_reference}",
                    provider_reference=provider_reference,
                    redirect_url=None,
                    status=PaymentStatus.FAILED.value,
                    provider_response={
                        "error": "Unknown reference format"
                    }
                )
                
        except Exception as e:
            logger.error(f"Error verifying Stripe payment: {str(e)}")
            return PaymentResponse(
                success=False,
                message=f"Failed to verify payment: {str(e)}",
                provider_reference=provider_reference,
                redirect_url=None,
                status=PaymentStatus.UNKNOWN.value,
                provider_response={
                    "error": str(e)
                }
            )
    
    def _payment_intent_to_response(self, payment_intent) -> PaymentResponse:
        """
        Convert a Stripe payment intent to a payment response.
        
        Args:
            payment_intent: Stripe payment intent
            
        Returns:
            Payment response
        """
        # Map Stripe status to our status
        if payment_intent.status == "succeeded":
            status = PaymentStatus.COMPLETED.value
            success = True
            message = "Payment completed successfully"
        elif payment_intent.status == "processing":
            status = PaymentStatus.PROCESSING.value
            success = True
            message = "Payment is being processed"
        elif payment_intent.status == "requires_payment_method":
            status = PaymentStatus.PENDING.value
            success = True
            message = "Payment requires payment method"
        elif payment_intent.status == "requires_confirmation":
            status = PaymentStatus.PENDING.value
            success = True
            message = "Payment requires confirmation"
        elif payment_intent.status == "requires_action":
            status = PaymentStatus.PENDING.value
            success = True
            message = "Payment requires additional action"
        elif payment_intent.status == "canceled":
            status = PaymentStatus.CANCELLED.value
            success = False
            message = "Payment was canceled"
        else:
            status = PaymentStatus.UNKNOWN.value
            success = False
            message = f"Unknown payment status: {payment_intent.status}"
        
        # Get receipt URL if available
        receipt_url = None
        if hasattr(payment_intent, "charges") and payment_intent.charges.data:
            receipt_url = payment_intent.charges.data[0].receipt_url
        
        return PaymentResponse(
            success=success,
            message=message,
            provider_reference=payment_intent.id,
            redirect_url=None,
            status=status,
            provider_response={
                "id": payment_intent.id,
                "status": payment_intent.status,
                "amount": payment_intent.amount / 100,
                "currency": payment_intent.currency,
                "receipt_url": receipt_url,
                "created": datetime.fromtimestamp(payment_intent.created).isoformat()
            }
        )
    
    async def process_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        """
        Process a Stripe webhook event.
        
        Args:
            payload: Webhook payload (raw body)
            signature: Stripe signature header
            
        Returns:
            Processed webhook data
        """
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            
            # Extract event data
            event_type = event.type
            event_data = event.data.object
            
            logger.info(f"Received Stripe webhook: {event_type}")
            
            # Process specific event types
            if event_type == "payment_intent.succeeded":
                # Payment succeeded
                return {
                    "success": True,
                    "event_type": event_type,
                    "provider_reference": event_data.id,
                    "status": PaymentStatus.COMPLETED.value,
                    "amount": event_data.amount / 100,
                    "currency": event_data.currency,
                    "metadata": event_data.metadata
                }
                
            elif event_type == "payment_intent.payment_failed":
                # Payment failed
                return {
                    "success": False,
                    "event_type": event_type,
                    "provider_reference": event_data.id,
                    "status": PaymentStatus.FAILED.value,
                    "error": event_data.last_payment_error.message if event_data.last_payment_error else "Payment failed",
                    "metadata": event_data.metadata
                }
                
            elif event_type == "checkout.session.completed":
                # Checkout completed
                return {
                    "success": True,
                    "event_type": event_type,
                    "provider_reference": event_data.id,
                    "payment_intent": event_data.payment_intent,
                    "status": PaymentStatus.COMPLETED.value,
                    "amount": event_data.amount_total / 100,
                    "currency": event_data.currency,
                    "customer_email": event_data.customer_email,
                    "metadata": event_data.metadata
                }
                
            elif event_type == "charge.refunded":
                # Refund processed
                return {
                    "success": True,
                    "event_type": event_type,
                    "provider_reference": event_data.id,
                    "payment_intent": event_data.payment_intent,
                    "status": PaymentStatus.REFUNDED.value if event_data.refunded else PaymentStatus.PARTIALLY_REFUNDED.value,
                    "amount": event_data.amount / 100,
                    "amount_refunded": event_data.amount_refunded / 100,
                    "currency": event_data.currency,
                    "metadata": event_data.metadata
                }
                
            else:
                # Other event type
                return {
                    "success": True,
                    "event_type": event_type,
                    "provider_reference": event_data.id if hasattr(event_data, "id") else None,
                    "data": event_data
                }
                
        except Exception as e:
            logger.error(f"Error processing Stripe webhook: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def process_refund(self, request: RefundRequest) -> RefundResponse:
        """
        Process a refund request with Stripe.
        
        Args:
            request: Refund request
            
        Returns:
            Refund response
        """
        try:
            # Create a refund
            refund = stripe.Refund.create(
                payment_intent=request.provider_reference,
                amount=int(request.amount * 100) if request.amount else None,  # Convert to cents, None for full refund
                reason=self._map_refund_reason(request.reason),
                metadata={
                    "payment_id": str(request.payment_id),
                    "refund_id": str(request.refund_id),
                    "reference": request.reference or ""
                }
            )
            
            # Check refund status
            if refund.status == "succeeded":
                status = RefundStatus.COMPLETED.value
                success = True
                message = "Refund processed successfully"
            elif refund.status == "pending":
                status = RefundStatus.PROCESSING.value
                success = True
                message = "Refund is being processed"
            else:
                status = RefundStatus.FAILED.value
                success = False
                message = f"Refund failed with status: {refund.status}"
            
            return RefundResponse(
                success=success,
                message=message,
                provider_reference=refund.id,
                status=status,
                amount=refund.amount / 100,
                currency=refund.currency,
                provider_response={
                    "id": refund.id,
                    "status": refund.status,
                    "amount": refund.amount / 100,
                    "currency": refund.currency,
                    "payment_intent": refund.payment_intent,
                    "reason": refund.reason,
                    "created": datetime.fromtimestamp(refund.created).isoformat()
                }
            )
                
        except Exception as e:
            logger.error(f"Error processing Stripe refund: {str(e)}")
            return RefundResponse(
                success=False,
                message=f"Failed to process refund: {str(e)}",
                provider_reference="",
                status=RefundStatus.FAILED.value,
                amount=request.amount,
                currency=request.currency,
                provider_response={
                    "error": str(e)
                }
            )
    
    async def verify_refund(self, refund_id: str, provider_reference: str) -> RefundResponse:
        """
        Verify a refund status with Stripe.
        
        Args:
            refund_id: Internal refund ID
            provider_reference: Stripe refund ID
            
        Returns:
            Refund response with current status
        """
        try:
            # Retrieve the refund
            refund = stripe.Refund.retrieve(provider_reference)
            
            # Map Stripe status to our status
            if refund.status == "succeeded":
                status = RefundStatus.COMPLETED.value
                success = True
                message = "Refund completed successfully"
            elif refund.status == "pending":
                status = RefundStatus.PROCESSING.value
                success = True
                message = "Refund is being processed"
            elif refund.status == "failed":
                status = RefundStatus.FAILED.value
                success = False
                message = "Refund failed"
            elif refund.status == "canceled":
                status = RefundStatus.FAILED.value
                success = False
                message = "Refund was canceled"
            else:
                status = RefundStatus.PENDING.value
                success = True
                message = f"Refund status: {refund.status}"
            
            return RefundResponse(
                success=success,
                message=message,
                provider_reference=refund.id,
                status=status,
                amount=refund.amount / 100,
                currency=refund.currency,
                provider_response={
                    "id": refund.id,
                    "status": refund.status,
                    "amount": refund.amount / 100,
                    "currency": refund.currency,
                    "payment_intent": refund.payment_intent,
                    "reason": refund.reason,
                    "created": datetime.fromtimestamp(refund.created).isoformat()
                }
            )
                
        except Exception as e:
            logger.error(f"Error verifying Stripe refund: {str(e)}")
            return RefundResponse(
                success=False,
                message=f"Failed to verify refund: {str(e)}",
                provider_reference=provider_reference,
                status=RefundStatus.UNKNOWN.value,
                amount=0,
                currency="",
                provider_response={
                    "error": str(e)
                }
            )
    
    def _get_payment_method_types(self, payment_method: str) -> List[str]:
        """
        Get payment method types for Stripe based on the requested payment method.
        
        Args:
            payment_method: Requested payment method
            
        Returns:
            List of Stripe payment method types
        """
        method_mapping = {
            "card": ["card"],
            "bank_transfer": ["bank_transfer"],
            "alipay": ["alipay"],
            "wechat": ["wechat_pay"],
            "sepa": ["sepa_debit"],
            "ideal": ["ideal"],
            "sofort": ["sofort"],
            "giropay": ["giropay"],
            "bancontact": ["bancontact"]
        }
        
        return method_mapping.get(payment_method, ["card"])
    
    def _map_refund_reason(self, reason: Optional[str]) -> Optional[str]:
        """
        Map our refund reason to Stripe's refund reason.
        
        Args:
            reason: Our refund reason
            
        Returns:
            Stripe refund reason
        """
        if not reason:
            return None
            
        reason_lower = reason.lower()
        
        if "duplicate" in reason_lower:
            return "duplicate"
        elif "fraud" in reason_lower:
            return "fraudulent"
        elif "requested" in reason_lower or "customer" in reason_lower:
            return "requested_by_customer"
        else:
            return None  # Stripe will default to 'other'

    @property
    def supports_subscriptions(self) -> bool:
        """Whether this provider supports subscriptions."""
        return True
    
    async def create_subscription(self, subscription: SubscriptionCreate) -> SubscriptionResponse:
        """
        Create a new subscription with Stripe.
        
        Args:
            subscription: Subscription data
            
        Returns:
            Subscription response with provider data
        """
        try:
            # Create or get customer
            customer = None
            
            if subscription.customer_email:
                # Look for existing customer with this email
                customers = stripe.Customer.list(email=subscription.customer_email, limit=1)
                if customers.data:
                    customer = customers.data[0]
                else:
                    # Create new customer
                    customer = stripe.Customer.create(
                        email=subscription.customer_email,
                        name=subscription.metadata.get("customer_name") if subscription.metadata else None,
                        metadata={
                            "customer_id": str(subscription.customer_id) if subscription.customer_id else None
                        }
                    )
            else:
                raise ValueError("Customer email is required for Stripe subscriptions")
            
            # Create or get payment method if provided
            payment_method = None
            if subscription.payment_method_id:
                payment_method = stripe.PaymentMethod.retrieve(subscription.payment_method_id)
                
                # Attach payment method to customer if not already attached
                if payment_method.customer != customer.id:
                    payment_method = stripe.PaymentMethod.attach(
                        payment_method.id,
                        customer=customer.id
                    )
                    
                # Set as default payment method
                stripe.Customer.modify(
                    customer.id,
                    invoice_settings={
                        "default_payment_method": payment_method.id
                    }
                )
            
            # Create product if it doesn't exist
            product_name = subscription.name
            product = stripe.Product.create(
                name=product_name,
                description=subscription.description,
                metadata={
                    "subscription_id": str(subscription.metadata.get("id")) if subscription.metadata else None
                }
            )
            
            # Create price
            price_data = {
                "currency": subscription.currency.lower(),
                "product": product.id,
                "unit_amount": int(subscription.amount * 100),  # Convert to cents
                "recurring": {
                    "interval": self._map_billing_period_to_stripe(subscription.billing_period.value),
                    "interval_count": subscription.billing_interval
                }
            }
            
            price = stripe.Price.create(**price_data)
            
            # Prepare subscription data
            subscription_data = {
                "customer": customer.id,
                "items": [{"price": price.id}],
                "payment_behavior": "default_incomplete",
                "payment_settings": {
                    "save_default_payment_method": "on_subscription"
                },
                "expand": ["latest_invoice.payment_intent"],
                "metadata": subscription.metadata or {}
            }
            
            # Add trial period if enabled
            if subscription.trial_enabled and subscription.trial_end_date:
                # Convert to timestamp
                trial_end = int(subscription.trial_end_date.timestamp())
                subscription_data["trial_end"] = trial_end
            
            # Create subscription
            stripe_subscription = stripe.Subscription.create(**subscription_data)
            
            # Map status
            status = self._map_stripe_subscription_status_to_internal(stripe_subscription.status)
            
            # Prepare the response
            response = SubscriptionResponse(
                id=0,  # This will be replaced with the actual DB ID
                name=subscription.name,
                description=subscription.description,
                status=status,
                amount=subscription.amount,
                currency=subscription.currency,
                billing_period=subscription.billing_period.value,
                billing_interval=subscription.billing_interval,
                customer_id=subscription.customer_id,
                customer_email=subscription.customer_email,
                created_by_id=None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                start_date=datetime.fromtimestamp(stripe_subscription.start_date),
                end_date=None,
                next_billing_date=datetime.fromtimestamp(stripe_subscription.current_period_end) if stripe_subscription.current_period_end else None,
                trial_enabled=subscription.trial_enabled,
                trial_start_date=subscription.trial_start_date,
                trial_end_date=subscription.trial_end_date,
                payment_method_id=subscription.payment_method_id,
                payment_provider="stripe",
                provider_subscription_id=stripe_subscription.id,
                auto_renew=not stripe_subscription.cancel_at_period_end,
                metadata={
                    "stripe_customer_id": customer.id,
                    "stripe_product_id": product.id,
                    "stripe_price_id": price.id,
                    **(subscription.metadata or {})
                },
                items=[],
                is_active=status in [SubscriptionStatus.ACTIVE.value, SubscriptionStatus.TRIALING.value],
                is_past_due=status == SubscriptionStatus.PAST_DUE.value,
                is_canceled=status == SubscriptionStatus.CANCELED.value,
                is_in_trial=stripe_subscription.trial_end is not None and stripe_subscription.trial_end > datetime.now().timestamp(),
                days_until_next_billing=None  # Will be calculated by the service
            )
            
            return response
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating subscription: {str(e)}")
            raise ValueError(f"Failed to create subscription: {str(e)}")
    
    async def update_subscription(self, subscription_id: str, update_data: SubscriptionUpdate) -> SubscriptionResponse:
        """
        Update an existing subscription with Stripe.
        
        Args:
            subscription_id: Stripe subscription ID
            update_data: Data to update
            
        Returns:
            Updated subscription response
        """
        try:
            update_params = {}
            
            # Prepare metadata if provided
            if update_data.metadata:
                update_params["metadata"] = update_data.metadata
            
            # Update price if amount or billing details changed
            if update_data.amount is not None or update_data.billing_period is not None or update_data.billing_interval is not None:
                # Get current subscription to get current values
                current_subscription = stripe.Subscription.retrieve(subscription_id)
                current_price_id = current_subscription.items.data[0].price.id if current_subscription.items.data else None
                
                if current_price_id:
                    current_price = stripe.Price.retrieve(current_price_id)
                    product_id = current_price.product
                    
                    # Create new price with updated values
                    price_data = {
                        "currency": update_data.currency.lower() if update_data.currency else current_price.currency,
                        "product": product_id,
                        "unit_amount": int((update_data.amount or current_price.unit_amount / 100) * 100),
                        "recurring": {
                            "interval": self._map_billing_period_to_stripe(update_data.billing_period.value) if update_data.billing_period else current_price.recurring.interval,
                            "interval_count": update_data.billing_interval or current_price.recurring.interval_count
                        }
                    }
                    
                    new_price = stripe.Price.create(**price_data)
                    
                    # Update subscription items
                    update_params["items"] = [
                        {
                            "id": current_subscription.items.data[0].id,
                            "price": new_price.id
                        }
                    ]
            
            # Update auto_renew setting
            if update_data.auto_renew is not None:
                if not update_data.auto_renew:
                    # Cancel at period end
                    update_params["cancel_at_period_end"] = True
                else:
                    # Resume subscription
                    update_params["cancel_at_period_end"] = False
            
            # Update trial settings
            if update_data.trial_enabled is not None:
                if update_data.trial_enabled and update_data.trial_end_date:
                    update_params["trial_end"] = int(update_data.trial_end_date.timestamp())
                elif not update_data.trial_enabled:
                    update_params["trial_end"] = "now"
            
            # Only update if we have parameters to update
            if update_params:
                stripe_subscription = stripe.Subscription.modify(subscription_id, **update_params)
                
                # Map status
                status = self._map_stripe_subscription_status_to_internal(stripe_subscription.status)
                
                # We don't have access to all the original subscription data here, 
                # so we'll return a partial response with the updated fields
                response = SubscriptionResponse(
                    id=0,  # Will be replaced with DB ID
                    name=update_data.name or "",
                    description=update_data.description or "",
                    status=status,
                    amount=update_data.amount or 0,
                    currency=update_data.currency or "USD",
                    billing_period=update_data.billing_period.value if update_data.billing_period else "",
                    billing_interval=update_data.billing_interval or 1,
                    customer_id=None,
                    customer_email=None,
                    created_by_id=None,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    start_date=datetime.fromtimestamp(stripe_subscription.start_date),
                    end_date=None,
                    next_billing_date=datetime.fromtimestamp(stripe_subscription.current_period_end) if stripe_subscription.current_period_end else None,
                    trial_enabled=update_data.trial_enabled or False,
                    trial_start_date=None,
                    trial_end_date=update_data.trial_end_date,
                    payment_method_id=None,
                    payment_provider="stripe",
                    provider_subscription_id=stripe_subscription.id,
                    auto_renew=not stripe_subscription.cancel_at_period_end,
                    metadata=update_data.metadata,
                    items=[],
                    is_active=status in [SubscriptionStatus.ACTIVE.value, SubscriptionStatus.TRIALING.value],
                    is_past_due=status == SubscriptionStatus.PAST_DUE.value,
                    is_canceled=status == SubscriptionStatus.CANCELED.value,
                    is_in_trial=stripe_subscription.trial_end is not None and stripe_subscription.trial_end > datetime.now().timestamp(),
                    days_until_next_billing=None  # Will be calculated by the service
                )
                
                return response
            else:
                # If no updates were made, fetch current data
                return await self.get_subscription(subscription_id)
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error updating subscription: {str(e)}")
            raise ValueError(f"Failed to update subscription: {str(e)}")
    
    async def cancel_subscription(self, subscription_id: str, cancel_request: SubscriptionCancelRequest) -> SubscriptionResponse:
        """
        Cancel a subscription with Stripe.
        
        Args:
            subscription_id: Stripe subscription ID
            cancel_request: Cancellation details
            
        Returns:
            Updated subscription response
        """
        try:
            # Determine how to cancel based on request
            if cancel_request.cancel_at_period_end:
                # Cancel at period end
                stripe_subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True,
                    metadata={"cancel_reason": cancel_request.reason} if cancel_request.reason else {}
                )
            else:
                # Cancel immediately
                stripe_subscription = stripe.Subscription.delete(
                    subscription_id,
                    prorate=cancel_request.prorate
                )
            
            # Map status
            status = self._map_stripe_subscription_status_to_internal(stripe_subscription.status)
            
            # Create response
            response = SubscriptionResponse(
                id=0,  # Will be replaced with DB ID
                name="",  # We don't have this data from the cancel response
                description="",
                status=status,
                amount=0,
                currency="USD",
                billing_period="",
                billing_interval=1,
                customer_id=None,
                customer_email=None,
                created_by_id=None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                start_date=datetime.fromtimestamp(stripe_subscription.start_date),
                end_date=datetime.fromtimestamp(stripe_subscription.canceled_at) if stripe_subscription.canceled_at else None,
                next_billing_date=datetime.fromtimestamp(stripe_subscription.current_period_end) if stripe_subscription.current_period_end else None,
                trial_enabled=False,
                trial_start_date=None,
                trial_end_date=None,
                payment_method_id=None,
                payment_provider="stripe",
                provider_subscription_id=stripe_subscription.id,
                auto_renew=not stripe_subscription.cancel_at_period_end,
                metadata={"cancel_reason": cancel_request.reason} if cancel_request.reason else None,
                items=[],
                is_active=False,
                is_past_due=False,
                is_canceled=True,
                is_in_trial=False,
                days_until_next_billing=None
            )
            
            return response
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error canceling subscription: {str(e)}")
            raise ValueError(f"Failed to cancel subscription: {str(e)}")
    
    async def pause_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """
        Pause a subscription with Stripe.
        
        Args:
            subscription_id: Stripe subscription ID
            
        Returns:
            Updated subscription response
        """
        try:
            # Stripe doesn't have a direct "pause" feature, so we'll implement
            # by updating the subscription with a 0 value price
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Store the original price ID for future resumption
            original_price_id = stripe_subscription.items.data[0].price.id if stripe_subscription.items.data else None
            
            if original_price_id:
                # Get product ID
                current_price = stripe.Price.retrieve(original_price_id)
                product_id = current_price.product
                
                # Create a "paused" price with 0 value
                paused_price = stripe.Price.create(
                    currency=current_price.currency,
                    product=product_id,
                    unit_amount=0,  # Zero amount while paused
                    recurring={
                        "interval": current_price.recurring.interval,
                        "interval_count": current_price.recurring.interval_count
                    },
                    metadata={
                        "is_paused_price": "true",
                        "original_price_id": original_price_id
                    }
                )
                
                # Update subscription with paused price
                stripe_subscription = stripe.Subscription.modify(
                    subscription_id,
                    items=[
                        {
                            "id": stripe_subscription.items.data[0].id,
                            "price": paused_price.id
                        }
                    ],
                    metadata={
                        **stripe_subscription.metadata,
                        "is_paused": "true",
                        "original_price_id": original_price_id
                    }
                )
                
                # Map status
                status = SubscriptionStatus.PAUSED.value  # Use our internal paused status
                
                # Create response
                response = SubscriptionResponse(
                    id=0,  # Will be replaced with DB ID
                    name="",  # We don't have this data
                    description="",
                    status=status,
                    amount=0,
                    currency=current_price.currency.upper(),
                    billing_period="",
                    billing_interval=1,
                    customer_id=None,
                    customer_email=None,
                    created_by_id=None,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    start_date=datetime.fromtimestamp(stripe_subscription.start_date),
                    end_date=None,
                    next_billing_date=datetime.fromtimestamp(stripe_subscription.current_period_end) if stripe_subscription.current_period_end else None,
                    trial_enabled=False,
                    trial_start_date=None,
                    trial_end_date=None,
                    payment_method_id=None,
                    payment_provider="stripe",
                    provider_subscription_id=stripe_subscription.id,
                    auto_renew=not stripe_subscription.cancel_at_period_end,
                    metadata=stripe_subscription.metadata,
                    items=[],
                    is_active=False,
                    is_past_due=False,
                    is_canceled=False,
                    is_in_trial=False,
                    days_until_next_billing=None
                )
                
                return response
            else:
                raise ValueError("Could not find price information for subscription")
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error pausing subscription: {str(e)}")
            raise ValueError(f"Failed to pause subscription: {str(e)}")
    
    async def resume_subscription(self, subscription_id: str) -> SubscriptionResponse:
        """
        Resume a paused subscription with Stripe.
        
        Args:
            subscription_id: Stripe subscription ID
            
        Returns:
            Updated subscription response
        """
        try:
            # Get current subscription
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Check if subscription is actually paused
            if not stripe_subscription.metadata.get("is_paused") == "true":
                raise ValueError("Subscription is not paused")
            
            # Get original price ID
            original_price_id = stripe_subscription.metadata.get("original_price_id")
            
            if original_price_id:
                # Update subscription with original price
                stripe_subscription = stripe.Subscription.modify(
                    subscription_id,
                    items=[
                        {
                            "id": stripe_subscription.items.data[0].id,
                            "price": original_price_id
                        }
                    ],
                    metadata={
                        **{k: v for k, v in stripe_subscription.metadata.items() if k not in ["is_paused", "original_price_id"]}
                    }
                )
                
                # Map status
                status = self._map_stripe_subscription_status_to_internal(stripe_subscription.status)
                
                # Create response
                response = SubscriptionResponse(
                    id=0,  # Will be replaced with DB ID
                    name="",  # We don't have this data
                    description="",
                    status=status,
                    amount=0,  # Will be updated from DB
                    currency="USD",  # Will be updated from DB
                    billing_period="",
                    billing_interval=1,
                    customer_id=None,
                    customer_email=None,
                    created_by_id=None,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    start_date=datetime.fromtimestamp(stripe_subscription.start_date),
                    end_date=None,
                    next_billing_date=datetime.fromtimestamp(stripe_subscription.current_period_end) if stripe_subscription.current_period_end else None,
                    trial_enabled=False,
                    trial_start_date=None,
                    trial_end_date=None,
                    payment_method_id=None,
                    payment_provider="stripe",
                    provider_subscription_id=stripe_subscription.id,
                    auto_renew=not stripe_subscription.cancel_at_period_end,
                    metadata=stripe_subscription.metadata,
                    items=[],
                    is_active=status in [SubscriptionStatus.ACTIVE.value, SubscriptionStatus.TRIALING.value],
                    is_past_due=status == SubscriptionStatus.PAST_DUE.value,
                    is_canceled=status == SubscriptionStatus.CANCELED.value,
                    is_in_trial=stripe_subscription.trial_end is not None and stripe_subscription.trial_end > datetime.now().timestamp(),
                    days_until_next_billing=None
                )
                
                return response
            else:
                raise ValueError("Could not find original price information for paused subscription")
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error resuming subscription: {str(e)}")
            raise ValueError(f"Failed to resume subscription: {str(e)}")
    
    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Get subscription details from Stripe.
        
        Args:
            subscription_id: Stripe subscription ID
            
        Returns:
            Subscription details
        """
        try:
            stripe_subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Convert to dictionary with our format
            return {
                "status": self._map_stripe_subscription_status_to_internal(stripe_subscription.status),
                "next_billing_date": datetime.fromtimestamp(stripe_subscription.current_period_end) if stripe_subscription.current_period_end else None,
                "start_date": datetime.fromtimestamp(stripe_subscription.start_date) if stripe_subscription.start_date else None,
                "end_date": datetime.fromtimestamp(stripe_subscription.canceled_at) if stripe_subscription.canceled_at else None,
                "provider_subscription_id": stripe_subscription.id,
                "trial_end": datetime.fromtimestamp(stripe_subscription.trial_end) if stripe_subscription.trial_end else None,
                "auto_renew": not stripe_subscription.cancel_at_period_end,
                "metadata": stripe_subscription.metadata,
                "is_paused": stripe_subscription.metadata.get("is_paused") == "true"
            }
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error getting subscription: {str(e)}")
            raise ValueError(f"Failed to get subscription: {str(e)}")
    
    async def list_customer_subscriptions(self, customer_id: str) -> List[Dict[str, Any]]:
        """
        List all subscriptions for a customer.
        
        Args:
            customer_id: Stripe customer ID
            
        Returns:
            List of subscription details
        """
        try:
            # List all subscriptions for customer
            subscriptions = stripe.Subscription.list(customer=customer_id)
            
            # Convert to list of dictionaries
            result = []
            for sub in subscriptions.data:
                result.append({
                    "status": self._map_stripe_subscription_status_to_internal(sub.status),
                    "next_billing_date": datetime.fromtimestamp(sub.current_period_end) if sub.current_period_end else None,
                    "start_date": datetime.fromtimestamp(sub.start_date) if sub.start_date else None,
                    "end_date": datetime.fromtimestamp(sub.canceled_at) if sub.canceled_at else None,
                    "provider_subscription_id": sub.id,
                    "trial_end": datetime.fromtimestamp(sub.trial_end) if sub.trial_end else None,
                    "auto_renew": not sub.cancel_at_period_end,
                    "metadata": sub.metadata,
                    "is_paused": sub.metadata.get("is_paused") == "true"
                })
            
            return result
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error listing customer subscriptions: {str(e)}")
            raise ValueError(f"Failed to list customer subscriptions: {str(e)}")
    
    def _map_billing_period_to_stripe(self, billing_period: str) -> str:
        """Map internal billing period to Stripe interval."""
        mapping = {
            "daily": "day",
            "weekly": "week",
            "monthly": "month",
            "quarterly": "month",  # 3 months, will use interval_count=3
            "biannual": "month",   # 6 months, will use interval_count=6
            "annual": "year",
            "custom": "month"      # Default to month for custom
        }
        return mapping.get(billing_period, "month")
    
    def _map_stripe_subscription_status_to_internal(self, stripe_status: str) -> str:
        """Map Stripe subscription status to internal status."""
        mapping = {
            "incomplete": SubscriptionStatus.INCOMPLETE.value,
            "incomplete_expired": SubscriptionStatus.INCOMPLETE_EXPIRED.value,
            "trialing": SubscriptionStatus.TRIALING.value,
            "active": SubscriptionStatus.ACTIVE.value,
            "past_due": SubscriptionStatus.PAST_DUE.value,
            "canceled": SubscriptionStatus.CANCELED.value,
            "unpaid": SubscriptionStatus.UNPAID.value
        }
        return mapping.get(stripe_status, SubscriptionStatus.DRAFT.value)

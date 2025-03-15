"""
PayPal payment provider implementation.

This module provides integration with the PayPal payment service.
"""
import logging
import json
import aiohttp
from typing import Dict, Any, Optional, List
import asyncio
from datetime import datetime
import base64

from ..models.provider import PaymentRequest, PaymentResponse, RefundRequest, RefundResponse
from ..models.payment import PaymentStatus, RefundStatus
from .base_provider import BasePaymentProvider
from .provider_factory import PaymentProviderFactory

logger = logging.getLogger("kaapi.payment.paypal")

@PaymentProviderFactory.register
class PayPalProvider(BasePaymentProvider):
    """PayPal payment provider implementation."""
    
    @property
    def supports_subscriptions(self) -> bool:
        """Whether this provider supports subscriptions."""
        return True

    async def create_subscription(self, subscription: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new subscription with PayPal.
        
        Args:
            subscription: Subscription data
            
        Returns:
            Subscription response with provider data
        """
        try:
            # Get access token
            token = await self._get_access_token()
            
            # Create product if it doesn't exist
            product_id = await self._create_or_get_product(token, subscription["name"], subscription["description"])
            
            # Create plan
            plan_id = await self._create_subscription_plan(
                token,
                product_id,
                subscription["name"],
                subscription["description"],
                subscription["amount"],
                subscription["currency"],
                subscription["billing_period"],
                subscription["billing_interval"]
            )
            
            # Define subscription request data
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            now = datetime.utcnow()
            start_time = now + datetime.timedelta(minutes=5)  # Add a small buffer time
            
            subscription_data = {
                "plan_id": plan_id,
                "start_time": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "application_context": {
                    "brand_name": "Kaapi App",
                    "locale": "en-US",
                    "shipping_preference": "NO_SHIPPING",
                    "user_action": "SUBSCRIBE_NOW",
                    "payment_method": {
                        "payer_selected": "PAYPAL",
                        "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                    },
                    "return_url": f"{settings.PAYMENT_BASE_URL}/payments/success",
                    "cancel_url": f"{settings.PAYMENT_BASE_URL}/payments/cancel"
                },
                "custom_id": str(subscription.get("metadata", {}).get("id")) if subscription.get("metadata") else None
            }
            
            # If customer details are provided
            if subscription.get("customer_email"):
                subscription_data["subscriber"] = {
                    "email_address": subscription["customer_email"]
                }
                
                if subscription.get("metadata"):
                    subscription_data["subscriber"]["name"] = {
                        "given_name": subscription["metadata"].get("customer_first_name", ""),
                        "surname": subscription["metadata"].get("customer_last_name", "")
                    }
            
            # Add trial period if enabled
            if subscription.get("trial_enabled") and subscription.get("trial_end_date"):
                # Calculate trial duration
                trial_start = now
                trial_end = subscription["trial_end_date"]
                trial_days = (trial_end - trial_start).days
                
                if trial_days > 0:
                    subscription_data["billing_cycles"] = [
                        {
                            "sequence": 1,
                            "tenure_type": "TRIAL",
                            "frequency": {
                                "interval_unit": "DAY",
                                "interval_count": trial_days
                            },
                            "total_cycles": 1,
                            "pricing_scheme": {
                                "fixed_price": {
                                    "value": "0",
                                    "currency_code": subscription["currency"]
                                }
                            }
                        }
                    ]
            
            # Create subscription
            url = f"{self.api_base_url}/v1/billing/subscriptions"
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=subscription_data) as response:
                    if response.status != 201:
                        logger.error(f"PayPal error creating subscription: {await response.text()}")
                        raise ValueError(f"Failed to create subscription: {await response.text()}")
                    
                    paypal_subscription = await response.json()
                    
                    # Parse status
                    status = self._map_paypal_subscription_status_to_internal(paypal_subscription.get("status", ""))
                    
                    # Create subscription response
                    response = {
                        "id": 0,  # This will be replaced with the actual DB ID
                        "name": subscription["name"],
                        "description": subscription["description"],
                        "status": status,
                        "amount": subscription["amount"],
                        "currency": subscription["currency"],
                        "billing_period": subscription["billing_period"],
                        "billing_interval": subscription["billing_interval"],
                        "customer_id": subscription.get("customer_id"),
                        "customer_email": subscription.get("customer_email"),
                        "created_by_id": None,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "start_date": start_time,
                        "end_date": None,
                        "next_billing_date": self._parse_paypal_datetime(paypal_subscription.get("billing_info", {}).get("next_billing_time")),
                        "trial_enabled": subscription.get("trial_enabled"),
                        "trial_start_date": subscription.get("trial_start_date"),
                        "trial_end_date": subscription.get("trial_end_date"),
                        "payment_method_id": subscription.get("payment_method_id"),
                        "payment_provider": "paypal",
                        "provider_subscription_id": paypal_subscription.get("id"),
                        "auto_renew": True,  # Default to true for new PayPal subscriptions
                        "metadata": {
                            "paypal_product_id": product_id,
                            "paypal_plan_id": plan_id,
                            **(subscription.get("metadata") or {})
                        },
                        "items": [],
                        "is_active": status == "active",
                        "is_past_due": status == "past_due",
                        "is_canceled": status == "canceled",
                        "is_in_trial": subscription.get("trial_enabled") and subscription.get("trial_end_date") and subscription.get("trial_end_date") > datetime.utcnow(),
                        "days_until_next_billing": None  # Will be calculated by the service
                    }
                    
                    return response
                    
        except Exception as e:
            logger.error(f"PayPal error creating subscription: {str(e)}")
            raise ValueError(f"Failed to create subscription: {str(e)}")
            
    async def update_subscription(self, subscription_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing subscription with PayPal.
        
        Args:
            subscription_id: PayPal subscription ID
            update_data: Data to update
            
        Returns:
            Updated subscription response
        """
        try:
            # Get access token
            token = await self._get_access_token()
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Prepare update data
            patch_operations = []
            
            # Update billing info if new amount is provided
            if "amount" in update_data and "currency" in update_data:
                # Note: For PayPal, we can't update the amount directly on a subscription
                # We'd need to create a new plan and update the subscription to use it
                logger.warning("Cannot update amount directly in PayPal subscription. Consider canceling and creating a new one.")
            
            # Handle metadata updates
            if update_data.get("metadata"):
                patch_operations.append({
                    "op": "add",
                    "path": "/custom_id",
                    "value": json.dumps(update_data["metadata"])
                })
            
            # If empty, don't make the API call
            if not patch_operations:
                # Just get current subscription instead
                url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}"
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=headers) as response:
                        if response.status != 200:
                            logger.error(f"PayPal error getting subscription: {await response.text()}")
                            raise ValueError(f"Failed to get subscription: {await response.text()}")
                        
                        paypal_subscription = await response.json()
            else:
                # Make the update request
                url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}"
                async with aiohttp.ClientSession() as session:
                    async with session.patch(url, headers=headers, json=patch_operations) as response:
                        if response.status != 204:
                            logger.error(f"PayPal error updating subscription: {await response.text()}")
                            raise ValueError(f"Failed to update subscription: {await response.text()}")
                        
                        # Get updated subscription
                        url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}"
                        async with session.get(url, headers=headers) as response:
                            if response.status != 200:
                                logger.error(f"PayPal error getting updated subscription: {await response.text()}")
                                raise ValueError(f"Failed to get updated subscription: {await response.text()}")
                            
                            paypal_subscription = await response.json()
            
            # Map PayPal status to internal
            status = self._map_paypal_subscription_status_to_internal(paypal_subscription.get("status", ""))
            
            # Create response with updated data
            response = {
                "id": 0,  # This will be replaced with the actual DB ID
                "status": status,
                "updated_at": datetime.utcnow(),
                "next_billing_date": self._parse_paypal_datetime(paypal_subscription.get("billing_info", {}).get("next_billing_time")),
                "provider_subscription_id": paypal_subscription.get("id"),
                "auto_renew": paypal_subscription.get("status") != "SUSPENDED",
                "metadata": update_data.get("metadata"),
                "is_active": status == "active",
                "is_past_due": status == "past_due",
                "is_canceled": status == "canceled",
                "is_in_trial": False,  # Will be set by the service
            }
            
            return response
                
        except Exception as e:
            logger.error(f"PayPal error updating subscription: {str(e)}")
            raise ValueError(f"Failed to update subscription: {str(e)}")
            
    async def cancel_subscription(self, subscription_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        """
        Cancel a subscription with PayPal.
        
        Args:
            subscription_id: PayPal subscription ID
            reason: Optional reason for cancellation
            
        Returns:
            Updated subscription response
        """
        try:
            # Get access token
            token = await self._get_access_token()
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Prepare cancel request
            cancel_url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}/cancel"
            cancel_data = {}
            
            if reason:
                cancel_data["reason"] = reason
            
            # Execute cancel request
            async with aiohttp.ClientSession() as session:
                async with session.post(cancel_url, headers=headers, json=cancel_data) as response:
                    if response.status != 204:
                        logger.error(f"PayPal error canceling subscription: {await response.text()}")
                        raise ValueError(f"Failed to cancel subscription: {await response.text()}")
                
                # Get updated subscription details
                subscription_url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}"
                async with session.get(subscription_url, headers=headers) as response:
                    if response.status != 200:
                        logger.error(f"PayPal error getting subscription after cancel: {await response.text()}")
                        raise ValueError(f"Failed to get canceled subscription details: {await response.text()}")
                        
                    canceled_subscription = await response.json()
            
            # Create response
            response = {
                "id": 0,  # Will be replaced with DB ID
                "status": "canceled",
                "updated_at": datetime.utcnow(),
                "end_date": datetime.utcnow(),
                "next_billing_date": None,
                "provider_subscription_id": canceled_subscription.get("id"),
                "auto_renew": False,
                "metadata": {"cancel_reason": reason} if reason else None,
                "is_active": False,
                "is_past_due": False,
                "is_canceled": True,
                "is_in_trial": False,
            }
            
            return response
                
        except Exception as e:
            logger.error(f"PayPal error canceling subscription: {str(e)}")
            raise ValueError(f"Failed to cancel subscription: {str(e)}")
    
    async def pause_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Pause a subscription with PayPal.
        
        Args:
            subscription_id: PayPal subscription ID
            
        Returns:
            Updated subscription response
        """
        try:
            # Get access token
            token = await self._get_access_token()
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Suspend the subscription
            suspend_url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}/suspend"
            reason_data = {"reason": "Customer requested pause"}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(suspend_url, headers=headers, json=reason_data) as response:
                    if response.status != 204:
                        logger.error(f"PayPal error suspending subscription: {await response.text()}")
                        raise ValueError(f"Failed to pause subscription: {await response.text()}")
                
                # Get updated subscription details
                subscription_url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}"
                async with session.get(subscription_url, headers=headers) as response:
                    if response.status != 200:
                        logger.error(f"PayPal error getting subscription after suspend: {await response.text()}")
                        raise ValueError(f"Failed to get paused subscription details: {await response.text()}")
                        
                    paused_subscription = await response.json()
            
            # Create response
            response = {
                "id": 0,  # Will be replaced with DB ID
                "status": "paused",
                "updated_at": datetime.utcnow(),
                "next_billing_date": self._parse_paypal_datetime(paused_subscription.get("billing_info", {}).get("next_billing_time")),
                "provider_subscription_id": paused_subscription.get("id"),
                "auto_renew": False,
                "is_active": False,
                "is_past_due": False,
                "is_canceled": False,
                "is_in_trial": False,
            }
            
            return response
                
        except Exception as e:
            logger.error(f"PayPal error pausing subscription: {str(e)}")
            raise ValueError(f"Failed to pause subscription: {str(e)}")
    
    async def resume_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Resume a paused subscription with PayPal.
        
        Args:
            subscription_id: PayPal subscription ID
            
        Returns:
            Updated subscription response
        """
        try:
            # Get access token
            token = await self._get_access_token()
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Activate the subscription
            activate_url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}/activate"
            reason_data = {"reason": "Customer requested resume"}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(activate_url, headers=headers, json=reason_data) as response:
                    if response.status != 204:
                        logger.error(f"PayPal error activating subscription: {await response.text()}")
                        raise ValueError(f"Failed to resume subscription: {await response.text()}")
                
                # Get updated subscription details
                subscription_url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}"
                async with session.get(subscription_url, headers=headers) as response:
                    if response.status != 200:
                        logger.error(f"PayPal error getting subscription after activate: {await response.text()}")
                        raise ValueError(f"Failed to get resumed subscription details: {await response.text()}")
                        
                    resumed_subscription = await response.json()
            
            # Get status
            status = self._map_paypal_subscription_status_to_internal(resumed_subscription.get("status"))
            
            # Create response
            response = {
                "id": 0,  # Will be replaced with DB ID
                "status": status,
                "updated_at": datetime.utcnow(),
                "next_billing_date": self._parse_paypal_datetime(resumed_subscription.get("billing_info", {}).get("next_billing_time")),
                "provider_subscription_id": resumed_subscription.get("id"),
                "auto_renew": True,
                "is_active": True,
                "is_past_due": status == "past_due",
                "is_canceled": False,
                "is_in_trial": False,
            }
            
            return response
                
        except Exception as e:
            logger.error(f"PayPal error resuming subscription: {str(e)}")
            raise ValueError(f"Failed to resume subscription: {str(e)}")
    
    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Get subscription details from PayPal.
        
        Args:
            subscription_id: PayPal subscription ID
            
        Returns:
            Subscription details
        """
        try:
            # Get access token
            token = await self._get_access_token()
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Get subscription details
            subscription_url = f"{self.api_base_url}/v1/billing/subscriptions/{subscription_id}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(subscription_url, headers=headers) as response:
                    if response.status != 200:
                        logger.error(f"PayPal error getting subscription: {await response.text()}")
                        raise ValueError(f"Failed to get subscription details: {await response.text()}")
                        
                    subscription = await response.json()
            
            # Map status
            status = self._map_paypal_subscription_status_to_internal(subscription.get("status"))
            
            # Parse dates
            next_billing_date = self._parse_paypal_datetime(subscription.get("billing_info", {}).get("next_billing_time"))
            start_date = self._parse_paypal_datetime(subscription.get("start_time"))
            
            # Convert to dictionary with our format
            return {
                "status": status,
                "next_billing_date": next_billing_date,
                "start_date": start_date,
                "end_date": None,  # PayPal doesn't provide this directly
                "provider_subscription_id": subscription.get("id"),
                "auto_renew": subscription.get("status") != "SUSPENDED",
                "is_active": status == "active",
                "is_paused": subscription.get("status") == "SUSPENDED",
                "is_canceled": subscription.get("status") == "CANCELLED",
                "is_past_due": False  # PayPal doesn't have a direct equivalent
            }
                
        except Exception as e:
            logger.error(f"PayPal error getting subscription: {str(e)}")
            raise ValueError(f"Failed to get subscription: {str(e)}")
            
    async def list_customer_subscriptions(self, customer_email: str) -> List[Dict[str, Any]]:
        """
        List all subscriptions for a customer.
        
        Args:
            customer_email: Customer email address
            
        Returns:
            List of subscription details
        """
        # Note: PayPal doesn't have a direct API to list subscriptions by customer email
        # This would require maintaining a local mapping of customer emails to subscription IDs
        logger.warning("PayPal does not support listing subscriptions by customer email directly")
        return []
    
    async def _get_access_token(self) -> str:
        """
        Get PayPal access token for API calls.
        
        Returns:
            Access token string
        """
        auth = (self.client_id, self.client_secret)
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US"
        }
        data = {"grant_type": "client_credentials"}
        
        url = f"{self.api_base_url}/v1/oauth2/token"
        async with aiohttp.ClientSession() as session:
            async with session.post(url, auth=auth, headers=headers, data=data) as response:
                if response.status != 200:
                    logger.error(f"PayPal auth error: {await response.text()}")
                    raise ValueError(f"Failed to get PayPal access token: {await response.text()}")
                    
                return (await response.json()).get("access_token")
    
    async def _create_or_get_product(self, access_token: str, name: str, description: str) -> str:
        """
        Create a product in PayPal or get an existing one.
        
        Args:
            access_token: PayPal access token
            name: Product name
            description: Product description
            
        Returns:
            Product ID
        """
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Check for existing product with this name
        list_url = f"{self.api_base_url}/v1/catalogs/products?page_size=20"
        async with aiohttp.ClientSession() as session:
            async with session.get(list_url, headers=headers) as response:
                if response.status != 200:
                    logger.error(f"PayPal error listing products: {await response.text()}")
                    raise ValueError(f"Failed to list products: {await response.text()}")
                
                products = await response.json()
                for product in products.get("products", []):
                    if product.get("name") == name:
                        return product.get("id")
        
        # Create new product if not found
        create_url = f"{self.api_base_url}/v1/catalogs/products"
        product_data = {
            "name": name,
            "description": description,
            "type": "SERVICE",
            "category": "SOFTWARE"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(create_url, headers=headers, json=product_data) as response:
                if response.status != 201:
                    logger.error(f"PayPal error creating product: {await response.text()}")
                    raise ValueError(f"Failed to create product: {await response.text()}")
                    
                return (await response.json()).get("id")
    
    async def _create_subscription_plan(self, access_token: str, product_id: str, name: str, 
                                      description: str, amount: float, currency: str,
                                      billing_period: str, billing_interval: int) -> str:
        """
        Create a subscription plan in PayPal.
        
        Args:
            access_token: PayPal access token
            product_id: PayPal product ID
            name: Plan name
            description: Plan description
            amount: Amount to charge
            currency: Currency code
            billing_period: Billing period (day, week, month, year)
            billing_interval: Number of billing periods
            
        Returns:
            Plan ID
        """
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # Map billing period to PayPal format
        interval_unit = self._map_billing_period_to_paypal(billing_period)
        
        # Prepare plan data
        plan_data = {
            "product_id": product_id,
            "name": name,
            "description": description,
            "status": "ACTIVE",
            "billing_cycles": [
                {
                    "frequency": {
                        "interval_unit": interval_unit,
                        "interval_count": billing_interval
                    },
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "total_cycles": 0,  # 0 means infinite
                    "pricing_scheme": {
                        "fixed_price": {
                            "value": str(amount),
                            "currency_code": currency
                        }
                    }
                }
            ],
            "payment_preferences": {
                "auto_bill_outstanding": True,
                "setup_fee": {
                    "value": "0",
                    "currency_code": currency
                },
                "setup_fee_failure_action": "CONTINUE",
                "payment_failure_threshold": 3
            }
        }
        
        # Create plan
        create_url = f"{self.api_base_url}/v1/billing/plans"
        async with aiohttp.ClientSession() as session:
            async with session.post(create_url, headers=headers, json=plan_data) as response:
                if response.status != 201:
                    logger.error(f"PayPal error creating plan: {await response.text()}")
                    raise ValueError(f"Failed to create plan: {await response.text()}")
                    
                return (await response.json()).get("id")
    
    def _map_billing_period_to_paypal(self, billing_period: str) -> str:
        """Map internal billing period to PayPal interval unit."""
        mapping = {
            "daily": "DAY",
            "weekly": "WEEK",
            "monthly": "MONTH",
            "quarterly": "MONTH",  # Will use interval_count=3
            "biannual": "MONTH",   # Will use interval_count=6
            "annual": "YEAR",
            "custom": "MONTH"      # Default to month for custom
        }
        return mapping.get(billing_period.lower(), "MONTH")
    
    def _map_paypal_interval_to_internal(self, interval_unit: str) -> str:
        """Map PayPal interval unit to internal billing period."""
        mapping = {
            "DAY": "daily",
            "WEEK": "weekly",
            "MONTH": "monthly",
            "YEAR": "annual"
        }
        return mapping.get(interval_unit, "monthly")
    
    def _map_paypal_subscription_status_to_internal(self, paypal_status: str) -> str:
        """Map PayPal subscription status to internal status."""
        from ..models.subscription import SubscriptionStatus
        
        mapping = {
            "APPROVAL_PENDING": SubscriptionStatus.INCOMPLETE.value,
            "APPROVED": SubscriptionStatus.ACTIVE.value,
            "ACTIVE": SubscriptionStatus.ACTIVE.value,
            "SUSPENDED": SubscriptionStatus.PAUSED.value,
            "CANCELLED": SubscriptionStatus.CANCELED.value,
            "EXPIRED": SubscriptionStatus.CANCELED.value
        }
        return mapping.get(paypal_status, SubscriptionStatus.DRAFT.value)
    
    def _parse_paypal_datetime(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse PayPal datetime string to datetime object."""
        if not date_str:
            return None
            
        try:
            return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            try:
                return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError:
                logger.error(f"Failed to parse PayPal datetime: {date_str}")
                return None

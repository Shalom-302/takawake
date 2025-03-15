"""
Flutterwave payment provider integration.

Flutterwave is a payment technology company that provides payment infrastructure
for global merchants and payment service providers across Africa. It supports
various payment methods including cards, mobile money, bank transfers, and USSD.
"""
import logging
import requests
from typing import Dict, Any, List, Optional
import json
import uuid

from ..models.provider import PaymentRequest, PaymentResult, PaymentProviderConfig
from ..models.payment import PaymentMethod, Currency, PaymentStatus
from .base_provider import BasePaymentProvider
from .provider_factory import PaymentProviderFactory

logger = logging.getLogger("kaapi.payment.flutterwave")

@PaymentProviderFactory.register_provider
class FlutterwaveProvider(BasePaymentProvider):
    """
    Flutterwave payment provider for processing payments across Africa.
    Supports multiple payment methods including mobile money, cards, bank transfers,
    and country-specific payment methods.
    """
    
    @property
    def provider_id(self) -> str:
        return "flutterwave"
    
    @property
    def provider_name(self) -> str:
        return "Flutterwave"
    
    @property
    def supported_methods(self) -> List[PaymentMethod]:
        return [
            PaymentMethod.CREDIT_CARD,
            PaymentMethod.DEBIT_CARD,
            PaymentMethod.BANK_TRANSFER,
            PaymentMethod.MOBILE_MONEY,
            PaymentMethod.USSD,
            PaymentMethod.MTN_MOBILE_MONEY,
            PaymentMethod.AIRTEL_MONEY,
            PaymentMethod.ORANGE_MONEY,
            PaymentMethod.CHIPPER_CASH,
            PaymentMethod.FLW_BANK_TRANSFER,
            PaymentMethod.M_PESA
        ]
    
    @property
    def supported_currencies(self) -> List[Currency]:
        return [
            Currency.NGN,
            Currency.KES,
            Currency.GHS,
            Currency.USD,
            Currency.EUR,
            Currency.ZAR,
            Currency.XOF,
            Currency.UGX,
            Currency.TZS,
            Currency.RWF
        ]
    
    @property
    def supported_countries(self) -> List[str]:
        return [
            "Nigeria",
            "Ghana",
            "Kenya",
            "Uganda",
            "Tanzania",
            "South Africa",
            "Zambia",
            "Cameroon",
            "Côte d'Ivoire",
            "Senegal",
            "Rwanda"
        ]
    
    @property
    def logo_url(self) -> str:
        return "https://asset.brandfetch.io/idFdo8ulhr/idvkEkW5mD.png"
    
    def initialize(self):
        """Initialize the Flutterwave provider."""
        self.secret_key = self.config.api_secret
        self.public_key = self.config.api_key
        self.merchant_id = self.config.merchant_id
        self.base_url = "https://api.flutterwave.com/v3"
        self.timeout = self.config.timeout
    
    async def process_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        """Process a payment with Flutterwave."""
        try:
            # Map payment method to Flutterwave payment type
            payment_type = self._map_payment_method(payment_request.payment_method)
            
            # Generate a unique transaction reference
            tx_ref = payment_request.metadata.get("reference", str(uuid.uuid4()))
            
            # Basic payload for all payment types
            payload = {
                "tx_ref": tx_ref,
                "amount": payment_request.amount,
                "currency": payment_request.currency.value,
                "redirect_url": payment_request.return_url,
                "customer": {
                    "email": payment_request.customer.get("email", ""),
                    "phone_number": payment_request.customer.get("phone", ""),
                    "name": payment_request.customer.get("name", "")
                },
                "meta": payment_request.metadata or {},
                "customizations": {
                    "title": "Kaapi Payment",
                    "description": payment_request.description or "Payment",
                    "logo": "https://example.com/logo.png"  # Replace with your logo
                }
            }
            
            # Add payment type-specific fields
            if payment_type:
                if payment_type in ["mobile_money_ghana", "mobile_money_uganda", "mobile_money_zambia", "mobile_money_rwanda"]:
                    country_code = self._get_country_code(payment_type)
                    network = self._get_mobile_network(payment_request.metadata)
                    
                    payload["payment_type"] = payment_type
                    payload["mobile_money"] = {
                        "phone": payment_request.customer.get("phone", ""),
                        "network": network,
                        "country": country_code
                    }
                
                elif payment_type == "mpesa":
                    payload["payment_type"] = payment_type
                
                elif payment_type == "ussd":
                    payload["payment_type"] = payment_type
                    payload["ussd"] = {
                        "code": payment_request.metadata.get("ussd_code", "")
                    }
                
                elif payment_type == "bank_transfer":
                    payload["payment_type"] = payment_type
                    payload["duration"] = payment_request.metadata.get("duration", 2)  # In days
                    payload["is_permanent"] = False
                
                # For card payments, no specific payment_type is needed
            
            # Make the API call
            url = f"{self.base_url}/payments"
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            
            # Check if the request was successful
            if result.get("status") == "success":
                data = result.get("data", {})
                return PaymentResult(
                    success=True,
                    provider_reference=data.get("id"),
                    status=PaymentStatus.PENDING_APPROVAL,
                    message="Payment initiated",
                    payment_url=data.get("link"),
                    raw_response=result
                )
            else:
                return PaymentResult(
                    success=False,
                    status=PaymentStatus.FAILED,
                    message=result.get("message", "Payment initialization failed"),
                    raw_response=result
                )
        
        except Exception as e:
            logger.error(f"Error processing Flutterwave payment: {e}")
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=f"Error processing payment: {str(e)}"
            )
    
    def _map_payment_method(self, payment_method: PaymentMethod) -> Optional[str]:
        """Map internal payment method to Flutterwave payment type."""
        mapping = {
            PaymentMethod.CREDIT_CARD: None,  # For cards, don't specify payment_type
            PaymentMethod.DEBIT_CARD: None,
            PaymentMethod.BANK_TRANSFER: "bank_transfer",
            PaymentMethod.MOBILE_MONEY: None,  # Needs to be specified based on country
            PaymentMethod.USSD: "ussd",
            PaymentMethod.MTN_MOBILE_MONEY: "mobile_money_ghana",  # Default to Ghana, can be overridden
            PaymentMethod.AIRTEL_MONEY: "mobile_money_uganda",  # Default to Uganda, can be overridden
            PaymentMethod.ORANGE_MONEY: "orange",
            PaymentMethod.M_PESA: "mpesa"
        }
        return mapping.get(payment_method)
    
    def _get_country_code(self, payment_type: str) -> str:
        """Get country code for mobile money payment type."""
        mapping = {
            "mobile_money_ghana": "GH",
            "mobile_money_uganda": "UG",
            "mobile_money_zambia": "ZM",
            "mobile_money_rwanda": "RW"
        }
        return mapping.get(payment_type, "")
    
    def _get_mobile_network(self, metadata: Optional[Dict[str, Any]]) -> str:
        """Get mobile network from metadata or return default."""
        if not metadata:
            return "MTN"  # Default to MTN
        
        return metadata.get("network", "MTN")
    
    async def verify_payment(self, payment_id: str) -> PaymentResult:
        """Verify the status of a Flutterwave payment."""
        try:
            url = f"{self.base_url}/transactions/{payment_id}/verify"
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                url,
                headers=headers,
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            
            if result.get("status") == "success":
                data = result.get("data", {})
                status = data.get("status", "")
                
                # Map Flutterwave status to internal status
                payment_status = PaymentStatus.PENDING_APPROVAL
                if status.lower() == "successful":
                    payment_status = PaymentStatus.COMPLETED
                elif status.lower() == "failed":
                    payment_status = PaymentStatus.FAILED
                elif status.lower() == "cancelled":
                    payment_status = PaymentStatus.CANCELLED
                
                return PaymentResult(
                    success=payment_status == PaymentStatus.COMPLETED,
                    provider_reference=payment_id,
                    status=payment_status,
                    message=f"Payment {status.lower()}",
                    raw_response=result
                )
            else:
                return PaymentResult(
                    success=False,
                    provider_reference=payment_id,
                    status=PaymentStatus.FAILED,
                    message=result.get("message", "Payment verification failed"),
                    raw_response=result
                )
        
        except Exception as e:
            logger.error(f"Error verifying Flutterwave payment: {e}")
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=f"Error verifying payment: {str(e)}"
            )
    
    async def cancel_payment(self, payment_id: str) -> PaymentResult:
        """
        Cancel a Flutterwave payment.
        Note: Flutterwave does not have a direct cancellation API for payments.
        This is more of a placeholder and would just mark the payment as cancelled in your system.
        """
        return PaymentResult(
            success=False,
            provider_reference=payment_id,
            status=PaymentStatus.FAILED,
            message="Flutterwave does not support direct payment cancellation via API"
        )
    
    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> PaymentResult:
        """Refund a Flutterwave payment."""
        try:
            url = f"{self.base_url}/transactions/{payment_id}/refund"
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            payload = {}
            if amount is not None:
                payload["amount"] = amount
            
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            
            if result.get("status") == "success":
                data = result.get("data", {})
                return PaymentResult(
                    success=True,
                    provider_reference=data.get("id"),
                    status=PaymentStatus.REFUNDED,
                    message="Payment refunded successfully",
                    raw_response=result
                )
            else:
                return PaymentResult(
                    success=False,
                    provider_reference=payment_id,
                    status=PaymentStatus.FAILED,
                    message=result.get("message", "Refund failed"),
                    raw_response=result
                )
        
        except Exception as e:
            logger.error(f"Error refunding Flutterwave payment: {e}")
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=f"Error refunding payment: {str(e)}"
            )
    
    async def process_webhook(self, payload: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
        """Process a webhook notification from Flutterwave."""
        try:
            logger.info(f"Received Flutterwave webhook: {json.dumps(payload)}")
            
            # Verify webhook signature
            signature = headers.get("verif-hash")
            if not signature or signature != self.config.webhook_secret:
                logger.warning("Invalid webhook signature")
                return {
                    "success": False,
                    "message": "Invalid webhook signature"
                }
            
            # Extract data
            event = payload.get("event")
            data = payload.get("data", {})
            transaction_id = data.get("id")
            tx_ref = data.get("tx_ref")
            
            if event == "charge.completed":
                status = data.get("status", "").lower()
                
                if status == "successful":
                    return {
                        "success": True,
                        "payment_id": transaction_id,
                        "reference": tx_ref,
                        "status": PaymentStatus.COMPLETED.value,
                        "message": "Payment completed successfully",
                        "raw_response": payload
                    }
                elif status == "failed":
                    return {
                        "success": False,
                        "payment_id": transaction_id,
                        "reference": tx_ref,
                        "status": PaymentStatus.FAILED.value,
                        "message": "Payment failed",
                        "raw_response": payload
                    }
            
            elif event == "transfer.completed":
                # For refunds or B2C transfers
                return {
                    "success": True,
                    "payment_id": transaction_id,
                    "reference": tx_ref,
                    "status": PaymentStatus.COMPLETED.value,
                    "is_transfer": True,
                    "message": "Transfer completed successfully",
                    "raw_response": payload
                }
            
            # Default response for unhandled events
            return {
                "success": True,
                "payment_id": transaction_id,
                "reference": tx_ref,
                "status": PaymentStatus.PENDING_APPROVAL.value,
                "message": f"Received webhook event: {event}",
                "raw_response": payload
            }
        
        except Exception as e:
            logger.error(f"Error processing Flutterwave webhook: {e}")
            return {
                "success": False,
                "message": f"Error processing webhook: {str(e)}",
                "raw_response": payload
            }

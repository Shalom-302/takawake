"""
M-Pesa payment provider integration.

M-Pesa is a mobile phone-based money transfer service, payments and micro-financing service,
launched in 2007 by Vodafone and Safaricom, the largest mobile network operator in Kenya.
It has since expanded to Tanzania, Mozambique, DRC, Lesotho, Ghana, Egypt, Afghanistan, and South Africa.
"""
import logging
import time
import base64
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from ..models.provider import PaymentRequest, PaymentResult, PaymentProviderConfig
from ..models.payment import PaymentMethod, Currency, PaymentStatus
from .base_provider import BasePaymentProvider
from .provider_factory import PaymentProviderFactory

logger = logging.getLogger("kaapi.payment.mpesa")

@PaymentProviderFactory.register_provider
class MPesaProvider(BasePaymentProvider):
    """
    M-Pesa payment provider for mobile money transactions in East Africa.
    Supports C2B (Customer to Business), B2C (Business to Customer),
    and B2B (Business to Business) transactions.
    """
    
    @property
    def provider_id(self) -> str:
        return "mpesa"
    
    @property
    def provider_name(self) -> str:
        return "M-Pesa"
    
    @property
    def supported_methods(self) -> List[PaymentMethod]:
        return [
            PaymentMethod.M_PESA, 
            PaymentMethod.MOBILE_MONEY
        ]
    
    @property
    def supported_currencies(self) -> List[Currency]:
        return [
            Currency.KES,  # Kenyan Shilling
            Currency.TZS,  # Tanzanian Shilling
            Currency.GHS,  # Ghanaian Cedi
            Currency.ZAR   # South African Rand
        ]
    
    @property
    def supported_countries(self) -> List[str]:
        return [
            "Kenya", 
            "Tanzania", 
            "Mozambique", 
            "Democratic Republic of Congo", 
            "Lesotho", 
            "Ghana", 
            "Egypt", 
            "Afghanistan", 
            "South Africa"
        ]
    
    @property
    def logo_url(self) -> str:
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png"
    
    def initialize(self):
        """Initialize the M-Pesa provider."""
        self.consumer_key = self.config.api_key
        self.consumer_secret = self.config.api_secret
        self.business_short_code = self.config.extra_config.get("business_short_code", "") if self.config.extra_config else ""
        self.passkey = self.config.extra_config.get("passkey", "") if self.config.extra_config else ""
        self.base_url = "https://sandbox.safaricom.co.ke" if self.config.environment == "test" else "https://api.safaricom.co.ke"
        self.timeout = self.config.timeout
        
        # Additional properties
        self.access_token = None
        self.token_expiry = 0
    
    async def get_access_token(self) -> str:
        """Get an access token from the M-Pesa API."""
        now = time.time()
        if self.access_token and now < self.token_expiry:
            return self.access_token
        
        # If token expired or doesn't exist, get a new one
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        auth_str = f"{self.consumer_key}:{self.consumer_secret}"
        auth_bytes = auth_str.encode("ascii")
        auth_b64 = base64.b64encode(auth_bytes).decode("ascii")
        
        headers = {
            "Authorization": f"Basic {auth_b64}"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            self.access_token = data["access_token"]
            # Token is valid for 1 hour, but we'll refresh slightly earlier
            self.token_expiry = now + (data.get("expires_in", 3600) - 60)
            
            return self.access_token
        except Exception as e:
            logger.error(f"Error getting M-Pesa access token: {e}")
            raise
    
    async def generate_password(self) -> str:
        """Generate the password for M-Pesa transactions."""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        data_to_encode = f"{self.business_short_code}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data_to_encode.encode()).decode()
        return encoded, timestamp
    
    async def process_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        """Process an M-Pesa payment using STK Push."""
        try:
            # Get access token
            access_token = await self.get_access_token()
            
            # Generate password and timestamp
            password, timestamp = await self.generate_password()
            
            # Prepare phone number - must start with country code without +
            phone = payment_request.customer.get("phone", "")
            if phone.startswith("+"):
                phone = phone[1:]
            
            # Prepare the request payload
            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(payment_request.amount),
                "PartyA": phone,
                "PartyB": self.business_short_code,
                "PhoneNumber": phone,
                "CallBackURL": payment_request.webhook_url,
                "AccountReference": payment_request.metadata.get("reference", "Kaapi Payment"),
                "TransactionDesc": payment_request.description or "Payment"
            }
            
            # Make API call
            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            headers = {
                "Authorization": f"Bearer {access_token}",
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
            
            if "CheckoutRequestID" in result:
                return PaymentResult(
                    success=True,
                    provider_reference=result["CheckoutRequestID"],
                    status=PaymentStatus.PROCESSING,
                    message="STK Push initiated, waiting for customer to enter PIN",
                    raw_response=result
                )
            else:
                return PaymentResult(
                    success=False,
                    status=PaymentStatus.FAILED,
                    message=f"Failed to initiate STK Push: {result.get('errorMessage', 'Unknown error')}",
                    raw_response=result
                )
        
        except Exception as e:
            logger.error(f"Error processing M-Pesa payment: {e}")
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=f"Error processing payment: {str(e)}"
            )
    
    async def verify_payment(self, payment_id: str) -> PaymentResult:
        """Verify the status of an M-Pesa payment."""
        try:
            # Get access token
            access_token = await self.get_access_token()
            
            # Generate password and timestamp
            password, timestamp = await self.generate_password()
            
            # Prepare the request payload
            payload = {
                "BusinessShortCode": self.business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": payment_id
            }
            
            # Make API call
            url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            headers = {
                "Authorization": f"Bearer {access_token}",
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
            
            # Check result code
            result_code = result.get("ResultCode")
            
            if result_code == 0:
                # Payment successful
                return PaymentResult(
                    success=True,
                    provider_reference=payment_id,
                    status=PaymentStatus.COMPLETED,
                    message="Payment completed successfully",
                    raw_response=result
                )
            elif result_code == 1:
                # Payment failed
                return PaymentResult(
                    success=False,
                    provider_reference=payment_id,
                    status=PaymentStatus.FAILED,
                    message=result.get("ResultDesc", "Payment failed"),
                    raw_response=result
                )
            else:
                # Payment still processing or in another state
                return PaymentResult(
                    success=False,
                    provider_reference=payment_id,
                    status=PaymentStatus.PROCESSING,
                    message=result.get("ResultDesc", "Payment status unclear"),
                    raw_response=result
                )
        
        except Exception as e:
            logger.error(f"Error verifying M-Pesa payment: {e}")
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=f"Error verifying payment: {str(e)}"
            )
    
    async def cancel_payment(self, payment_id: str) -> PaymentResult:
        """
        Cancel an M-Pesa payment.
        Note: M-Pesa doesn't really support cancellation of STK Push.
        """
        # M-Pesa doesn't support cancellation of STK Push once initiated
        return PaymentResult(
            success=False,
            provider_reference=payment_id,
            status=PaymentStatus.FAILED,
            message="M-Pesa STK Push transactions cannot be cancelled once initiated"
        )
    
    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> PaymentResult:
        """
        Refund an M-Pesa payment.
        This is implemented as a B2C transaction (Business to Customer).
        """
        try:
            # Get access token
            access_token = await self.get_access_token()
            
            # We need the transaction details, assuming we store this in metadata
            # In a real implementation, you would fetch this from your database
            transaction_details = await self._get_transaction_details(payment_id)
            
            if not transaction_details:
                return PaymentResult(
                    success=False,
                    provider_reference=payment_id,
                    status=PaymentStatus.FAILED,
                    message="Could not find original transaction details"
                )
            
            # Prepare the request payload for B2C transaction
            payload = {
                "InitiatorName": self.config.extra_config.get("initiator_name", "") if self.config.extra_config else "",
                "SecurityCredential": self.config.extra_config.get("security_credential", "") if self.config.extra_config else "",
                "CommandID": "BusinessPayment",
                "Amount": str(amount if amount is not None else transaction_details.get("amount", 0)),
                "PartyA": self.business_short_code,
                "PartyB": transaction_details.get("phone_number", ""),
                "Remarks": "Refund for payment",
                "QueueTimeOutURL": self.config.extra_config.get("timeout_url", "") if self.config.extra_config else "",
                "ResultURL": self.config.extra_config.get("result_url", "") if self.config.extra_config else "",
                "Occasion": f"Refund for {payment_id}"
            }
            
            # Make API call
            url = f"{self.base_url}/mpesa/b2c/v1/paymentrequest"
            headers = {
                "Authorization": f"Bearer {access_token}",
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
            
            if result.get("ResponseCode") == "0":
                return PaymentResult(
                    success=True,
                    provider_reference=result.get("ConversationID"),
                    status=PaymentStatus.PROCESSING,
                    message="Refund initiated",
                    raw_response=result
                )
            else:
                return PaymentResult(
                    success=False,
                    provider_reference=payment_id,
                    status=PaymentStatus.FAILED,
                    message=f"Failed to initiate refund: {result.get('ResponseDescription', 'Unknown error')}",
                    raw_response=result
                )
        
        except Exception as e:
            logger.error(f"Error refunding M-Pesa payment: {e}")
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=f"Error refunding payment: {str(e)}"
            )
    
    async def _get_transaction_details(self, payment_id: str) -> Dict[str, Any]:
        """
        Mock function to get transaction details.
        In a real implementation, this would fetch from a database.
        """
        # This is just a mock - in reality, you'd retrieve this from your database
        return {
            "amount": 100,
            "phone_number": "254712345678",
            "transaction_id": "ABC123456"
        }
    
    async def process_webhook(self, payload: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
        """Process a webhook notification from M-Pesa."""
        try:
            logger.info(f"Received M-Pesa webhook: {json.dumps(payload)}")
            
            # Handle different M-Pesa callback types
            if "Body" in payload and "stkCallback" in payload["Body"]:
                # STK Push callback
                stk_callback = payload["Body"]["stkCallback"]
                checkout_request_id = stk_callback.get("CheckoutRequestID")
                result_code = stk_callback.get("ResultCode")
                
                if result_code == 0:
                    # Transaction successful
                    return {
                        "success": True,
                        "payment_id": checkout_request_id,
                        "status": PaymentStatus.COMPLETED.value,
                        "message": "Payment completed successfully",
                        "raw_response": payload
                    }
                else:
                    # Transaction failed
                    return {
                        "success": False,
                        "payment_id": checkout_request_id,
                        "status": PaymentStatus.FAILED.value,
                        "message": stk_callback.get("ResultDesc", "Payment failed"),
                        "raw_response": payload
                    }
            
            elif "Body" in payload and "Result" in payload["Body"]:
                # B2C or C2B callback
                result = payload["Body"]["Result"]
                transaction_id = result.get("TransactionID")
                result_code = result.get("ResultCode")
                
                if result_code == 0:
                    return {
                        "success": True,
                        "payment_id": transaction_id,
                        "status": PaymentStatus.COMPLETED.value,
                        "message": "Transaction completed successfully",
                        "raw_response": payload
                    }
                else:
                    return {
                        "success": False,
                        "payment_id": transaction_id,
                        "status": PaymentStatus.FAILED.value,
                        "message": result.get("ResultDesc", "Transaction failed"),
                        "raw_response": payload
                    }
            
            # Unknown webhook format
            return {
                "success": False,
                "message": "Unknown webhook format",
                "raw_response": payload
            }
        
        except Exception as e:
            logger.error(f"Error processing M-Pesa webhook: {e}")
            return {
                "success": False,
                "message": f"Error processing webhook: {str(e)}",
                "raw_response": payload
            }

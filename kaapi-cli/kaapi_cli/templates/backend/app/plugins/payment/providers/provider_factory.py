"""
Factory for creating payment provider instances.

This module contains a factory class for creating instances of payment providers.
"""
import importlib
import logging
import pkgutil
import inspect
import sys
import os
from typing import Dict, Type, Optional, List

from ..models.provider import PaymentProviderConfig, ProviderResponse
from .base_provider import BasePaymentProvider

# Import providers here to register them
from .hub2 import Hub2Provider
from .paystack import PaystackProvider
from .wave import WaveProvider
from .paydunya import PayDunyaProvider
from .cinetpay import CinetPayProvider

logger = logging.getLogger("kaapi.payment.factory")

class PaymentProviderFactory:
    """Factory for creating payment provider instances."""
    
    _providers: Dict[str, Type[BasePaymentProvider]] = {}
    _provider_instances: Dict[str, BasePaymentProvider] = {}
    
    @classmethod
    def register_provider(cls, provider_class: Type[BasePaymentProvider]):
        """Register a payment provider class."""
        provider_id = provider_class.provider_id
        cls._providers[provider_id] = provider_class
        logger.info(f"Registered payment provider: {provider_id}")
        return provider_class
    
    @classmethod
    def get_provider(cls, provider_id: str, config: Optional[PaymentProviderConfig] = None) -> Optional[BasePaymentProvider]:
        """Get a provider instance by ID."""
        if provider_id in cls._provider_instances:
            return cls._provider_instances[provider_id]
        
        if provider_id not in cls._providers:
            logger.warning(f"Payment provider not found: {provider_id}")
            return None
        
        provider_class = cls._providers[provider_id]
        if config is None:
            from ..utils.config import payment_settings
            config = payment_settings.get_provider_config(provider_id)
            
        provider = provider_class(config)
        cls._provider_instances[provider_id] = provider
        logger.info(f"Initialized payment provider: {provider_id}")
        return provider
    
    @classmethod
    def get_all_providers(cls) -> List[ProviderResponse]:
        """Get information about all registered providers."""
        results = []
        
        for provider_id, provider_class in cls._providers.items():
            from ..utils.config import payment_settings
            config = payment_settings.get_provider_config(provider_id)
            is_enabled = payment_settings.is_provider_enabled(provider_id)
            
            # Create a temporary instance if needed to get properties
            if provider_id not in cls._provider_instances and is_enabled:
                provider = provider_class(config)
            else:
                provider = cls._provider_instances.get(provider_id)
            
            if provider:
                provider_info = ProviderResponse(
                    id=provider_id,
                    name=provider.provider_name,
                    description=getattr(provider_class, "__doc__", "").strip(),
                    logo_url=getattr(provider, "logo_url", None),
                    supported_methods=provider.supported_methods,
                    supported_currencies=provider.supported_currencies,
                    countries=provider.supported_countries,
                    is_enabled=is_enabled,
                    is_test_mode=config.environment == "test" if config else True,
                    metadata=getattr(provider, "metadata", None)
                )
                results.append(provider_info)
        
        return results
    
    @classmethod
    def load_providers(cls):
        """Load all provider modules."""
        # Import all provider modules to trigger registration
        try:
            import app.plugins.payment.providers.stripe
            import app.plugins.payment.providers.paypal
            import app.plugins.payment.providers.mpesa
            import app.plugins.payment.providers.flutterwave
            import app.plugins.payment.providers.paystack
            import app.plugins.payment.providers.orange_money
            import app.plugins.payment.providers.mtn_mobile_money
            import app.plugins.payment.providers.wave
            import app.plugins.payment.providers.hub2
            import app.plugins.payment.providers.paydunya
            import app.plugins.payment.providers.cinetpay
            
            logger.info("All payment providers loaded successfully")
        except ImportError as e:
            logger.warning(f"Failed to load payment providers: {e}")

# Initialize providers
PaymentProviderFactory.load_providers()

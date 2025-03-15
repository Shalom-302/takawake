"""
Payment provider factory.

This module provides a factory for creating payment provider instances based on configuration.
"""
import importlib
import logging
from typing import Dict, List, Type, Optional

from ..models.provider import PaymentProviderConfig, ProviderResponse
from .base_provider import BasePaymentProvider

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
            import app.plugins.payment.providers.stripe_provider
            import app.plugins.payment.providers.paypal_provider
            import app.plugins.payment.providers.mpesa_provider
            import app.plugins.payment.providers.flutterwave_provider
            import app.plugins.payment.providers.paystack_provider
            import app.plugins.payment.providers.orange_money_provider
            import app.plugins.payment.providers.mtn_mobile_money_provider
            import app.plugins.payment.providers.wave_provider
            import app.plugins.payment.providers.hub2
            
            logger.info("All payment providers loaded successfully")
        except ImportError as e:
            logger.error(f"Error loading payment providers: {e}")

# Initialize providers
PaymentProviderFactory.load_providers()

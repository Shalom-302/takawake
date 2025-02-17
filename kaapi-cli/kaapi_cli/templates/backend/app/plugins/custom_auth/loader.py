from importlib import import_module
from fastapi import APIRouter
from typing import Dict, Type
from .base import BaseAuthProvider

class AuthPluginLoader:
    def __init__(self):
        self.providers: Dict[str, Type[BaseAuthProvider]] = {}
        self.router = APIRouter(prefix="/auth", tags=["auth"])

    def register_provider(self, provider_class: Type[BaseAuthProvider]):
        """Register an authentication provider class"""
        self.providers[provider_class.name] = provider_class

    def load_providers(self, enabled_providers: list[str]):
        """Initialize enabled providers and mount their routers"""
        for provider_name in enabled_providers:
            if provider_name in self.providers:
                provider = self.providers[provider_name]()
                self.router.include_router(provider.router)
            else:
                raise ValueError(f"Unknown auth provider: {provider_name}")

def load_auth_providers(enabled_providers: list[str]) -> APIRouter:
    """Main entry point - loads and configures authentication providers"""
    loader = AuthPluginLoader()
    
    # Auto-discover provider implementations
    from .providers import email  # noqa
    
    loader.load_providers(enabled_providers)
    return loader.router

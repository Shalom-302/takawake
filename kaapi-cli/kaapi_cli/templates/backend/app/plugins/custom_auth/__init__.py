# Custom authentication plugin entry point
from .loader import load_auth_providers

__all__ = ['load_auth_providers']

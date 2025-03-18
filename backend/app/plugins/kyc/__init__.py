"""
KYC (Know Your Customer) Plugin for Kaapi.

Provides verification and identity management capabilities with adaptable approaches
for regions with different infrastructure levels.
"""

from .main import get_api_router as get_router, on_plugin_init as initialize_plugin, get_plugin_info

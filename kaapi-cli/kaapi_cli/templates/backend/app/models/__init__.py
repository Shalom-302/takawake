# app/models/__init__.py

from app.core.db import Base  # <-- Import from db.py

# Import each model file here:
from .resource_definition import ResourceDefinition
# from .user import User
from .role import Role
from .plugin import KaapiPlugin
from app.plugins.advanced_scheduler.models import ScheduledJob
from app.plugins.webhooks.models import WebhookSubscription
from app.plugins.advanced_audit.models import AuditLog
from app.plugins.security.models import UserSession

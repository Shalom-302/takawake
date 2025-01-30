# app/models/__init__.py

from app.db import Base  # <-- Import from db.py

# Import each model file here:
from .resource_definition import ResourceDefinition
from .user import User
from .role import Role

# app/models/__init__.py

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import each model file here:
from .resource_definition import ResourceDefinition
from .user import User
from .role import Role


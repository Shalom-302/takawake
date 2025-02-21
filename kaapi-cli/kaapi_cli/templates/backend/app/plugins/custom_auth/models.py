# app/plugins/custom_auth/models.py

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, Enum
import enum

from datetime import datetime
from app.db import Base  # Use the central Base


class AuthProviderEnum(enum.Enum):
    EMAIL = "email"
    FACEBOOK = "facebook"
    GOOGLE = "google"
    GITHUB = "github"
    GITLAB = "gitlab"
    APPLE = "apple"
    LINKEDIN = "linkedin"
    MICROSOFT = "microsoft"


class ProviderConfig(Base):
    __tablename__ = "kaapi_provider_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider = Column(Enum(AuthProviderEnum), nullable=False, unique=True)
    client_id = Column(String, nullable=False)
    secret_key = Column(String, nullable=False)
    webhook_redirect_uri = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


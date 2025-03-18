import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    POSTGRES_HOST: str = "kaapi-db"  # Updated to use the renamed container
    
    # Basic Configuration
    PROJECT_NAME: str = "KAAPI Backend"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3002"]
    CORS_METHODS: list[str] = ["*"]
    CORS_HEADERS: list[str] = ["*"]
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    
    # Messaging
    GMAIL_USERNAME: Optional[str] = None
    GMAIL_PASSWORD: Optional[str] = None
    SENDGRID_API_KEY: Optional[str] = None
    INFOBIP_API_KEY: Optional[str] = None
    INFOBIP_BASE_URL: Optional[str] = None
    INFOBIP_FROM_NUMBER: Optional[str] = None
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    ONESIGNAL_APP_ID: Optional[str] = None
    ONESIGNAL_REST_API_KEY: Optional[str] = None
    
    # RabbitMQ
    RABBITMQ_USERNAME: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    
    # Logging
    LOKI_URL: str = "http://loki:3100"
    
    @property
    def DB_URL(self) -> str:
        return f"postgresql://postgres:postgres@{self.POSTGRES_HOST}:5432/kaapi"
    
    @property
    def ASYNC_DB_URL(self) -> str:
        return f"postgresql+asyncpg://postgres:postgres@{self.POSTGRES_HOST}:5432/kaapi"
    
    # Configuration pour l'analyse des variables d'environnement
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    POSTGRES_HOST: str = "kaapi-db"  # Updated to use the renamed container
    
    # Basic Configuration
    PROJECT_NAME: str = "KAAPI Backend"
    ENVIRONMENT: str = "development"
    
    # API Configuration
    API_PREFIX: str = "/api"  # Central prefix for all API routes
    API_V1_STR: str = "/api"  # Pour la compatibilité avec le code existant
    
    # Security
    SECRET_KEY: str = "CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 2  # For tests, only 2 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 1  # For tests, only 1 day
    ALGORITHM: str = "HS256"
    
    # OAuth Providers
    OAUTH_PROVIDERS: dict = {
        "github": {
            "client_id": os.getenv("GITHUB_CLIENT_ID", "default_github_client_id"),
            "client_secret": os.getenv("GITHUB_CLIENT_SECRET", "default_github_client_secret"),
        },
        "google": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID", "xxxxxxx"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", "xxxxxx"),
        },
        "facebook": {
            "client_id": os.getenv("FACEBOOK_CLIENT_ID", "default_facebook_client_id"),
            "client_secret": os.getenv("FACEBOOK_CLIENT_SECRET", "default_facebook_client_secret"),
        },
    }
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]  # In development, allowing all origins
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
    
    # Configuration for environment variable analysis
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

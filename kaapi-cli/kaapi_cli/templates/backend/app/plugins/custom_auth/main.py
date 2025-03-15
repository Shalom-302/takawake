# app/plugins/custom_auth/main.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from httpx import AsyncClient
import logging
from pydantic import BaseModel
from app.core.db import get_db
from .providers.google import GoogleOAuth
from .providers.facebook import FacebookOAuth
from .providers.github import GithubOAuth
from .providers.gitlab import GitlabOAuth
from .providers.linkedin import LinkedinOAuth
from .providers.microsoft import MicrosoftOAuth
from .providers.email import EmailAuthProvider
from .providers.apple import AppleOAuth
from .schemas import OAuthCodeResponseSchema, OAuthUserDataResponseSchema
from .models import ProviderConfig, AuthProviderEnum
from .base import UserAuthBase

PROVIDER_CLASSES = {
    AuthProviderEnum.GOOGLE.value: GoogleOAuth,
    AuthProviderEnum.FACEBOOK.value: FacebookOAuth,
    AuthProviderEnum.GITHUB.value: GithubOAuth,
    AuthProviderEnum.GITLAB.value: GitlabOAuth,
    AuthProviderEnum.LINKEDIN.value: LinkedinOAuth,
    AuthProviderEnum.MICROSOFT.value: MicrosoftOAuth,
    AuthProviderEnum.APPLE.value: AppleOAuth,
}

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ProviderToggleRequest(BaseModel):
    name: str
    enable: bool


def create_oauth_instance(provider_config: ProviderConfig):
    provider_class = PROVIDER_CLASSES.get(provider_config.provider.value)
    if not provider_class:
        return None
    
    return provider_class(
        session=AsyncClient(),
        client_id=provider_config.client_id,
        secret_key=provider_config.secret_key,
        webhook_redirect_uri=provider_config.webhook_redirect_uri
    )

def get_router() -> APIRouter:
    router = APIRouter(tags=["authentication"])

    def get_all_providers(db: Session = Depends(get_db)):
        """Get all provider configurations from database"""
        providers = db.query(ProviderConfig).all()
        return providers
    

    def get_active_providers(db: Session = Depends(get_db)):
        """Get all active provider configurations from database"""
        configs = db.query(ProviderConfig).filter(ProviderConfig.is_active == True).all()
        providers = {}
        for config in configs:
            provider = create_oauth_instance(config)
            if provider:
                providers[config.provider.value] = provider
        return providers

    @router.post("/email/login")
    async def handle_login(
        user_auth: UserAuthBase,
        db: Session = Depends(get_db)
    ):
        """Handle email login"""
        email_auth_provider = EmailAuthProvider()
        auth_result = await email_auth_provider.handle_login(user_auth.username, user_auth.password, db)
        if auth_result:
            logger.info(f'Successful login attempt for user: {user_auth.username}')
        else:
            logger.warning(f'Failed login attempt for user: {user_auth.username}')
        return auth_result

    @router.post("/email/register")         
    async def handle_register(
        user_auth: UserAuthBase,
        db: Session = Depends(get_db)
    ):
        """Handle email registration"""
        try:
            auth_result = await EmailAuthProvider.handle_register(user_auth.username, user_auth.password, db)
            logger.info(f'Successful registration for user: {user_auth.username}')
            return auth_result
        except Exception as e:
            logger.error(f'Error during registration for user {user_auth.username}: {str(e)}')
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


    @router.post("/email/login")
    async def handle_login(
        user_auth: UserAuthBase,
        db: Session = Depends(get_db)
    ):
        """Handle email login"""
        email_auth_provider = EmailAuthProvider()
        auth_result = await email_auth_provider.handle_login(user_auth.username, user_auth.password, db)
        if auth_result:
            logger.info(f'Successful login attempt for user: {user_auth.username}')
        else:
            logger.warning(f'Failed login attempt for user: {user_auth.username}')
        return auth_result

    @router.get("/providers")
    async def list_providers(db: Session = Depends(get_db)):
        """List all available providers"""
        providers = get_all_providers(db)
        return providers


    @router.post("/enable-provider")
    def enable_provider(request: ProviderToggleRequest, db: Session = Depends(get_db)):
        """
        Example: set a provider as enabled in your DB or config.
        """
        provider = db.query(ProviderConfig).filter(ProviderConfig.provider == request.name).first()
        print("HUHUHUS", provider)
        if not provider:
            return {"detail": f"Provider {request.name} not found"}

        provider.is_active = request.enable
        print("HUHUHU", provider)
        db.commit()
        return {"detail": f"Provider {request.name} is now set to {request.enable}"}
    
    @router.get("/{provider}/login")
    async def oauth_login(provider: str, db: Session = Depends(get_db)):
        """Initialize OAuth login flow for a specific provider"""
        providers = get_active_providers(db)
        if provider not in providers:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider} not found or not active"
            )
        
        redirect_url = providers[provider].generate_link_for_code()
        return RedirectResponse(url=str(redirect_url.url))

    @router.post("/callback/{provider}", response_model=OAuthUserDataResponseSchema)
    async def oauth_callback(
        provider: str,
        code: OAuthCodeResponseSchema,
        db: Session = Depends(get_db)
    ):
        """Handle OAuth callback and user data retrieval"""
        providers = get_active_providers(db)
        if provider not in providers:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider} not found or not active"
            )
        
        try:
            return await providers[provider].verify_and_process(code)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    # Admin routes for managing providers
    @router.put("/admin/providers/{provider}/toggle", tags=["admin"])
    async def toggle_provider(
        provider: str,
        db: Session = Depends(get_db)
    ):
        """Toggle provider active status"""
        provider_config = db.query(ProviderConfig).filter(
            ProviderConfig.provider == provider
        ).first()
        
        if not provider_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider} configuration not found"
            )
        
        provider_config.is_active = not provider_config.is_active
        db.commit()
        db.refresh(provider_config)
        
        return {
            "provider": provider,
            "is_active": provider_config.is_active
        }

    @router.get("/admin/providers", tags=["admin"])
    async def list_all_providers(db: Session = Depends(get_db)):
        """List all provider configurations including inactive ones"""
        configs = db.query(ProviderConfig).all()
        return [{
            "provider": config.provider.value,
            "is_active": config.is_active,
            "client_id": config.client_id,
            "webhook_redirect_uri": config.webhook_redirect_uri,
            "created_at": config.created_at,
            "updated_at": config.updated_at
        } for config in configs]

    return router

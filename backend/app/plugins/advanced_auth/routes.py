"""
API routes for the advanced authentication plugin.
"""
from typing import Dict, Any, Optional, List
import logging

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.config import settings
from .service import AuthService
from .utils import get_current_user, get_current_active_user, require_superuser
from .models import User
from .schemas import (
    UserCreate, UserUpdate, UserResponse, PasswordUpdate, Token,
    OAuthInitRequest, OAuthCallbackRequest, AuthResponse, 
    PasswordResetRequest, PasswordResetVerify,
    EmailVerificationRequest, EmailVerificationVerify,
    MFASetupRequest, MFAVerifyRequest
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
        500: {"description": "Server error"}
    }
)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    """
    auth_service = AuthService(db)
    user = await auth_service.register_user(user_data)
    return user


@router.post("/login", response_model=AuthResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    remember_me: bool = False,
    db: Session = Depends(get_db)
):
    """
    Authenticate a user and return tokens.
    """
    auth_service = AuthService(db)
    
    try:
        user = await auth_service.authenticate_user(form_data.username, form_data.password)
        tokens = await auth_service.create_tokens(user, remember_me)
        
        return AuthResponse(
            user=user,
            token=Token(**tokens),
            requires_mfa=False  # Implement MFA check here if needed
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/token/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh an access token using a refresh token.
    """
    auth_service = AuthService(db)
    tokens = await auth_service.refresh_access_token(refresh_token)
    return Token(**tokens)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    all_devices: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Log out the current user.
    """
    auth_service = AuthService(db)
    await auth_service.logout(current_user, all_devices)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get information about the currently authenticated user.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update the currently authenticated user.
    """
    auth_service = AuthService(db)
    updated_user = await auth_service.update_user(current_user.id, user_data)
    return updated_user


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change the password of the currently authenticated user.
    """
    auth_service = AuthService(db)
    await auth_service.change_password(
        current_user,
        password_data.current_password,
        password_data.new_password
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/providers")
async def get_providers(db: Session = Depends(get_db)):
    """
    Get all available authentication providers.
    """
    auth_service = AuthService(db)
    providers = await auth_service.get_available_providers()
    return providers


@router.post("/oauth/init")
async def init_oauth(
    data: OAuthInitRequest,
    db: Session = Depends(get_db)
):
    """
    Initialize OAuth flow for a provider.
    """
    auth_service = AuthService(db)
    auth_url = await auth_service.init_oauth_flow(
        data.provider,
        data.redirect_uri,
        data.state
    )
    return {"authorization_url": auth_url}


@router.post("/oauth/callback", response_model=AuthResponse)
async def oauth_callback(
    data: OAuthCallbackRequest,
    db: Session = Depends(get_db)
):
    """
    Handle OAuth callback.
    """
    auth_service = AuthService(db)
    user, tokens = await auth_service.handle_oauth_callback(
        data.provider,
        data.code,
        data.redirect_uri,
        data.state
    )
    
    return AuthResponse(
        user=user,
        token=Token(**tokens),
        requires_mfa=False  # Implement MFA check here if needed
    )


@router.post("/password-reset/request", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Request a password reset for a user.
    """
    # This would send an email with reset link
    # For now, just return success
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/password-reset/verify", status_code=status.HTTP_200_OK)
async def verify_password_reset(
    data: PasswordResetVerify,
    db: Session = Depends(get_db)
):
    """
    Verify a password reset token and set a new password.
    """
    # This would verify token and set new password
    # For now, just return success
    return {"message": "Password has been reset successfully"}


@router.post("/email-verification/request", status_code=status.HTTP_202_ACCEPTED)
async def request_email_verification(
    data: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Request email verification for a user.
    """
    # This would send an email with verification link
    # For now, just return success
    return {"message": "If the email exists, a verification link has been sent"}


@router.post("/email-verification/verify", status_code=status.HTTP_200_OK)
async def verify_email(
    data: EmailVerificationVerify,
    db: Session = Depends(get_db)
):
    """
    Verify a user's email address.
    """
    # This would verify token and mark email as verified
    # For now, just return success
    return {"message": "Email has been verified successfully"}


# MFA routes
@router.post("/mfa/setup", status_code=status.HTTP_200_OK)
async def setup_mfa(
    data: MFASetupRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Set up multi-factor authentication for a user.
    """
    # This would set up MFA
    # For now, just return success
    return {"message": "MFA setup initiated"}


@router.post("/mfa/verify", status_code=status.HTTP_200_OK)
async def verify_mfa(
    data: MFAVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Verify a multi-factor authentication code.
    """
    # This would verify MFA code
    # For now, just return success
    return {"message": "MFA verified successfully"}


# Admin routes
@router.get("/users", response_model=List[UserResponse], dependencies=[Depends(require_superuser)])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all users (admin only).
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse, dependencies=[Depends(require_superuser)])
async def get_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a user by ID (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/users/{user_id}", response_model=UserResponse, dependencies=[Depends(require_superuser)])
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a user by ID (admin only).
    """
    auth_service = AuthService(db)
    updated_user = await auth_service.update_user(user_id, user_data)
    return updated_user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_superuser)])
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a user by ID (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

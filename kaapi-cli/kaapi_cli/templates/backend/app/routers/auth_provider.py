# File: backend/app/routers/auth_providers.py
from fastapi import APIRouter, HTTPException, Request
from typing import Optional
import os

router = APIRouter()

@router.get("/providers")
def list_providers():
    """
    Return the list of auth providers (like 'email', 'facebook', 'google', 'msal', etc.)
    with their status (enabled/disabled).
    You might load from DB or a config file.
    """
    return [
        {"name": "email", "status": "enabled"},
        {"name": "facebook", "status": "disabled"},
        {"name": "google", "status": "disabled"},
        {"name": "msal", "status": "disabled"},
        # etc.
    ]

@router.post("/enable-provider")
def enable_provider(name: str):
    """
    Example: set a provider as enabled in your DB or config.
    """
    # pseudo-code:
    # provider = db.query(Provider).filter(Provider.name==name).first()
    # provider.status = "enabled"
    # db.commit()
    return {"detail": f"Provider {name} enabled"}

@router.post("/auth/{provider}")
def oauth_login(provider: str, request: Request):
    """
    Example route that handles redirect or token exchange for an OAuth provider.
    In a real scenario, you'd integrate MSAL or Facebook/Google via a library.
    """
    if provider == "google":
        # handle google oauth
        pass
    elif provider == "facebook":
        # handle facebook
        pass
    # etc.
    return {"detail": f"Auth with {provider} not fully implemented"}

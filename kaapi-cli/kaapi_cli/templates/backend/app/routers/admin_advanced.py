# File: backend/app/routers/admin_advanced.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.routers.auth import require_role
from typing import Optional

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/settings")
def get_advanced_settings(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    # e.g. load from DB or a config file
    settings = {
        "default_authenticated_role": "Authenticated",
        "enable_signups": True,
        "email_confirmation": True,
    }
    return settings

@router.put("/settings")
def update_advanced_settings(
    settings_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    """
    For example:
    {
      "default_authenticated_role": "Authenticated",
      "enable_signups": false,
      "email_confirmation": true
    }
    """
    # Save to DB or config, then return
    return {"detail": "Advanced settings updated", "data": settings_data}

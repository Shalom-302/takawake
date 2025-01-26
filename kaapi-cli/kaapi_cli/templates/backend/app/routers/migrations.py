# File: backend/app/routers/migrations.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
import subprocess
import os
import uuid

from app.db import SessionLocal
from .auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/changes")
def get_pending_migrations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Generate a draft migration script in "SQL" (dry-run) mode or a temporary file,
    then parse or return it so the front-end can see what changes are pending.
    """
    try:
        # Approach A: Use `alembic revision --autogenerate --sql` to produce raw SQL
        # that would be applied if you ran upgrade.
        # This doesn't create an actual .py file in migrations/versions, only the SQL string.
        cmd = ["alembic", "revision", "--autogenerate", "--sql", "-m", "temp_dry_run"]
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        out, err = process.communicate()
        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Alembic dry-run failed:\n{err}")

        # 'out' should contain the SQL statements Alembic would apply (or an empty script if no changes).
        # Return it as plain text or JSON.
        return {"changes": out or "No pending changes."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving changes: {str(e)}")


@router.post("/apply")
def apply_migrations(
    message: Optional[str] = "Kaapi changes",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    1) Create a new Alembic revision with --autogenerate and the provided message.
    2) Run alembic upgrade head to apply changes.
    """
    try:
        # Step 1: Generate the migration
        cmd_rev = ["alembic", "revision", "--autogenerate", "-m", message]
        rev_process = subprocess.Popen(cmd_rev, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        out_rev, err_rev = rev_process.communicate()
        if rev_process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Revision creation failed:\n{err_rev}")

        # Step 2: Apply the migration
        cmd_upgrade = ["alembic", "upgrade", "head"]
        upgrade_process = subprocess.Popen(cmd_upgrade, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        out_up, err_up = upgrade_process.communicate()
        if upgrade_process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Upgrade failed:\n{err_up}")

        return {
            "detail": "Migrations applied successfully!",
            "revision_log": out_rev,
            "upgrade_log": out_up
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying migrations: {str(e)}")

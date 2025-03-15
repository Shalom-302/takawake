# app/plugins/advanced_audit/main.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from .models import AuditLog
from .schemas import AuditLogCreate, AuditLogOut

def get_router() -> APIRouter:
    router = APIRouter()

    @router.get("/logs", response_model=List[AuditLogOut], name="list_audit_logs")
    def list_audit_logs(db: Session = Depends(get_db)):
        logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
        return logs

    @router.post("/logs", response_model=AuditLogOut, status_code=status.HTTP_201_CREATED, name="create_audit_log")
    def create_audit_log(data: AuditLogCreate, db: Session = Depends(get_db)):
        log = AuditLog(
            user_id=data.user_id,
            action=data.action,
            resource=data.resource,
            details=data.details
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @router.delete("/logs/{log_id}", name="delete_audit_log")
    def delete_audit_log(log_id: int, db: Session = Depends(get_db)):
        log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
        if not log:
            raise HTTPException(status_code=404, detail="Audit log not found")
        db.delete(log)
        db.commit()
        return {"detail": "Audit log deleted successfully"}

    return router

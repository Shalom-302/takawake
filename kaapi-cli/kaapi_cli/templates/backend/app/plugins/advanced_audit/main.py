# app/plugins/advanced_audit/main.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.db import get_db
from .models import AuditLog
from .schemas import AuditLogCreate, AuditLogOut
from .metrics import AUDIT_EVENTS_COUNTER, AUDIT_EVENTS_BY_RESOURCE, AUDIT_EVENTS_BY_ACTION, LAST_AUDIT_EVENT_TIMESTAMP
import time
from datetime import datetime
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from . import initialize_audit_metrics

def get_router() -> APIRouter:
    router = APIRouter()
    
    # Initialize metrics when router is created
    db = next(get_db())
    initialize_audit_metrics(db)

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
        
        # Increment Prometheus metrics - single increment
        AUDIT_EVENTS_COUNTER.labels(resource=log.resource, action=log.action).inc()
        
        # Update resource and action gauges directly instead of recounting from DB
        current_resource_count = AUDIT_EVENTS_BY_RESOURCE.labels(resource=log.resource)._value.get() or 0
        AUDIT_EVENTS_BY_RESOURCE.labels(resource=log.resource).set(current_resource_count + 1)
        
        current_action_count = AUDIT_EVENTS_BY_ACTION.labels(action=log.action)._value.get() or 0
        AUDIT_EVENTS_BY_ACTION.labels(action=log.action).set(current_action_count + 1)
        
        # Update last event timestamp
        LAST_AUDIT_EVENT_TIMESTAMP.set(time.time())
        
        return log

    @router.delete("/logs/{log_id}", name="delete_audit_log")
    def delete_audit_log(log_id: int, db: Session = Depends(get_db)):
        log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
        if not log:
            raise HTTPException(status_code=404, detail="Audit log not found")
        db.delete(log)
        db.commit()
        
        # Update Prometheus gauges after deletion
        update_prometheus_gauges(db)
        
        return {"detail": "Audit log deleted successfully"}
    
    @router.get("/metrics", name="get_audit_metrics")
    def get_metrics():
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
    
    # Utility function to update Prometheus gauges
    def update_prometheus_gauges(db: Session):
        # First reset all gauges to ensure we don't have stale data
        for resource in db.query(AuditLog.resource).distinct().all():
            AUDIT_EVENTS_BY_RESOURCE.labels(resource=resource[0]).set(0)
            
        for action in db.query(AuditLog.action).distinct().all():
            AUDIT_EVENTS_BY_ACTION.labels(action=action[0]).set(0)
            
        # Count events by resource
        resource_counts = db.query(AuditLog.resource, func.count(AuditLog.id)).group_by(AuditLog.resource).all()
        for resource, count in resource_counts:
            AUDIT_EVENTS_BY_RESOURCE.labels(resource=resource).set(count)
        
        # Count events by action
        action_counts = db.query(AuditLog.action, func.count(AuditLog.id)).group_by(AuditLog.action).all()
        for action, count in action_counts:
            AUDIT_EVENTS_BY_ACTION.labels(action=action).set(count)

    return router

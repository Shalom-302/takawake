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
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from .loki_integration import push_audit_log_to_loki


def initialize_audit_metrics(db: Session):
    """Initialize Prometheus metrics based on existing audit logs in the database."""
    print(" Initializing Advanced Audit metrics...")
    
    # Reset all gauges
    AUDIT_EVENTS_BY_RESOURCE._metrics.clear()
    AUDIT_EVENTS_BY_ACTION._metrics.clear()
    
    try:
        # Count total events
        total_events = db.query(func.count(AuditLog.id)).scalar() or 0
        print(f" Total audit events found: {total_events}")
    except Exception as e:
        # This is likely due to the table not existing yet, which is expected if migrations haven't been run
        print(f" ⚠️ Could not count audit events: {e}")
        print(" ⚠️ This is normal if migrations have not been run yet.")
        # Continue with default values
        total_events = 0
    
    # Reset counters
    AUDIT_EVENTS_COUNTER._metrics.clear()
    
    try:
        # Count events by resource and action combinations
        resource_action_counts = db.query(
            AuditLog.resource, 
            AuditLog.action, 
            func.count(AuditLog.id)
        ).group_by(AuditLog.resource, AuditLog.action).all()
    except Exception:
        # Si la requête échoue, utilisez une liste vide
        resource_action_counts = []
    
    # Process all resource/action combinations
    for resource, action, count in resource_action_counts:
        print(f" Resource: {resource}, Action: {action}, Count: {count}")
        # Increment counter for each resource/action combination
        AUDIT_EVENTS_COUNTER.labels(resource=resource, action=action).inc(count)
    
    # Recount events by resource after resetting counters
    resource_counts = db.query(AuditLog.resource, func.count(AuditLog.id)).group_by(AuditLog.resource).all()
    for resource, count in resource_counts:
        print(f" Setting resource gauge for {resource}: {count}")
        AUDIT_EVENTS_BY_RESOURCE.labels(resource=resource).set(count)
    
    # Recount events by action after resetting counters
    action_counts = db.query(AuditLog.action, func.count(AuditLog.id)).group_by(AuditLog.action).all()
    for action, count in action_counts:
        print(f" Setting action gauge for {action}: {count}")
        AUDIT_EVENTS_BY_ACTION.labels(action=action).set(count)
    
    # Set last event timestamp
    latest_event = db.query(AuditLog).order_by(AuditLog.created_at.desc()).first()
    if latest_event:
        # Convert datetime to timestamp
        timestamp = latest_event.created_at.timestamp()
        LAST_AUDIT_EVENT_TIMESTAMP.set(timestamp)
    else:
        # If no events, set to current time
        LAST_AUDIT_EVENT_TIMESTAMP.set(time.time())
    
    print(f" Advanced Audit metrics initialized")


def get_router() -> APIRouter:
    router = APIRouter()
    
    # Initialize metrics when router is created, mais avec gestion des erreurs
    try:
        db = next(get_db())
        initialize_audit_metrics(db)
    except Exception as e:
        print(f"Warning: Failed to initialize audit metrics: {e}")

    @router.get("/logs", response_model=List[AuditLogOut], name="list_audit_logs")
    def list_audit_logs(db: Session = Depends(get_db)):
        try:
            logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
            return logs
        except Exception as e:
            # Gérer l'erreur lorsque la table n'existe pas encore
            print(f"Error listing audit logs: {e}")
            return []

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
        
        # Push log to Loki with the specified format
        push_audit_log_to_loki(
            user_id=log.user_id,
            action=log.action,
            resource=log.resource,
            details=log.details,
            timestamp=log.created_at.timestamp() if log.created_at else None
        )
        
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

audit_router = get_router()
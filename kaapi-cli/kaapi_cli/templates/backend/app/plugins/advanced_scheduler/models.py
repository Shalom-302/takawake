# app/plugins/advanced_scheduler/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, text, JSON
from datetime import datetime
from app.core.db import Base  # <--- import the central Base

class ScheduledJob(Base):
    __tablename__ = "kaapi_scheduled_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    cron_expr = Column(String(50), nullable=False)
    task_name = Column(String(200), nullable=False)  # e.g. "myapp.tasks.do_cleanup"
    args = Column(JSON, nullable=False)  # For SQLite, use TEXT
    enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=text("(DATETIME('now'))"))  # adapt to Postgres if needed
    updated_at = Column(DateTime)

"""
Business alerts plugin main module.

This module serves as the entry point for the business alerts plugin,
providing initialization and configuration functionality.
"""

import logging
from fastapi import FastAPI, APIRouter

from app.core.rate_limit import configure_rate_limiting
from app.plugins.business_alerts.routes.alert_management import get_alert_management_router
from app.plugins.business_alerts.routes.notification import get_notification_router
from app.plugins.business_alerts.utils.security import initialize_alert_security

logger = logging.getLogger(__name__)


class BusinessAlertsPlugin:
    """
    Business alerts plugin for managing alerts related to business conditions.
    
    This plugin provides functionality for detecting, managing, and notifying
    about business alerts, such as missing financial data, expiring documents,
    and other business conditions that require attention.
    """
    
    def __init__(self):
        """Initialize the business alerts plugin."""
        self.router = APIRouter()
        self.name = "business_alerts"
        self.initialized = False
    
    def init_app(self, app: FastAPI, prefix: str = "/business-alerts") -> None:
        """
        Initialize the plugin with the FastAPI application.
        
        Args:
            app: FastAPI application
            prefix: URL prefix for the plugin
        """
        if self.initialized:
            logger.warning("Business alerts plugin already initialized")
            return
            
        # Initialize security components
        initialize_alert_security()
        
        # Set up routers
        self.router.prefix = prefix
        self.router.tags = ["Business Alerts"]
        
        # Add sub-routers
        alert_management_router = get_alert_management_router()
        notification_router = get_notification_router()
        
        self.router.include_router(
            alert_management_router,
            prefix="/alerts",
            tags=["Alert Management"]
        )
        
        self.router.include_router(
            notification_router,
            prefix="/notifications",
            tags=["Alert Notifications"]
        )
        
        # Include the router in the main app
        app.include_router(self.router)
        
        # Note: We removed the call to configure_rate_limiting(app) here
        # because it adds middleware after the application has started,
        # which is not allowed. Rate limiting is already configured at the application level.
        
        # Mark as initialized
        self.initialized = True
        logger.info("Business alerts plugin initialized")
    
    def register_scheduled_tasks(self, scheduler):
        """
        Register scheduled tasks with the application scheduler.
        
        Args:
            scheduler: Application scheduler
        """
        from app.plugins.business_alerts.tasks.scheduled import (
            run_daily_alert_checks,
            run_hourly_alert_checks,
            run_weekly_alert_cleanup
        )
        
        # Register daily tasks
        scheduler.add_job(
            func=run_daily_alert_checks,
            trigger="cron",
            hour=1,  # Run at 1 AM
            minute=0,
            id="business_alerts_daily_checks"
        )
        
        # Register hourly tasks
        scheduler.add_job(
            func=run_hourly_alert_checks,
            trigger="interval",
            hours=1,
            id="business_alerts_hourly_checks"
        )
        
        # Register weekly tasks
        scheduler.add_job(
            func=run_weekly_alert_cleanup,
            trigger="cron",
            day_of_week="sun",  # Run on Sundays
            hour=2,  # Run at 2 AM
            minute=0,
            id="business_alerts_weekly_cleanup"
        )
        
        logger.info("Business alerts scheduled tasks registered")
        

# Create plugin instance
business_alerts_plugin = BusinessAlertsPlugin()


def get_plugin():
    """
    Get the business alerts plugin instance.
    
    Returns:
        BusinessAlertsPlugin: Plugin instance
    """
    return business_alerts_plugin

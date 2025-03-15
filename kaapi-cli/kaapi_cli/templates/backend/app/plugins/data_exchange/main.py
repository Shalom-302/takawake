"""
Main router for the data import/export plugin.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.plugins.data_exchange.routes import (
    imports, exports, templates, schedules, validation
)

# Create the main router for the plugin
data_exchange_router = APIRouter(prefix="/data-exchange", tags=["Data Import/Export"])

# Include all the sub-routers
data_exchange_router.include_router(imports.router)
data_exchange_router.include_router(exports.router)
data_exchange_router.include_router(templates.router)
data_exchange_router.include_router(schedules.router)
data_exchange_router.include_router(validation.router)


@data_exchange_router.get("/")
async def get_data_exchange_info(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get information about the data import/export plugin."""
    return {
        "name": "Data Import/Export Plugin",
        "description": "Enables importing and exporting data in various formats with validation and scheduling.",
        "version": "1.0.0",
        "formats": ["CSV", "JSON", "Excel", "XML"],
        "features": [
            "Data import and export",
            "Multiple format support",
            "Data validation",
            "Scheduled imports/exports",
            "Reusable templates",
            "Advanced data mapping"
        ]
    }

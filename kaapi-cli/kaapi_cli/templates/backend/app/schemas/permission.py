# File: backend/app/schemas/permission.py
from pydantic import BaseModel
from typing import Optional

class PermissionSchema(BaseModel):
    resource: str
    field: Optional[str] = None   # None => resource-level
    action: str
    allowed: bool

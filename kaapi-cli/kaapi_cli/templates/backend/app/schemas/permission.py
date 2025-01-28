# File: backend/app/schemas/permission.py
from pydantic import BaseModel

class PermissionSchema(BaseModel):
    resource: str
    action: str
    allowed: bool

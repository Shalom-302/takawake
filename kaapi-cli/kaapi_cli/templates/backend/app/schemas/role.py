# File: backend/app/schemas/role.py
from pydantic import BaseModel, Field
from typing import Optional

class RoleCreate(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = None

class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None

class RoleOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    userCount: Optional[int] = 0

    class Config:
        from_attributes = True

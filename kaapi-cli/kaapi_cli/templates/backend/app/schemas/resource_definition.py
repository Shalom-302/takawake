# backend/app/schemas/resource_definition.py
from pydantic import BaseModel
from typing import List, Optional

# Input schema for creating a resource
class FieldDefinition(BaseModel):
    name: str
    type: str
    default: Optional[str] = None

class ResourceDefinitionIn(BaseModel):
    resource_name: str
    fields: List[FieldDefinition]

# Output schema for listing resources
class ResourceDefinitionOut(BaseModel):
    id: int
    name: str
    fields: List[FieldDefinition]

    class Config:
        orm_mode = True  # Enable compatibility with SQLAlchemy models

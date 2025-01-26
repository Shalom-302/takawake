# backend/app/schemas/resource_definition.py

from pydantic import BaseModel
from typing import List, Optional

class RelationshipDef(BaseModel):
    """
    Optional details about an SQLAlchemy relationship, e.g.
    'back_populates': 'comments'
    'parent_resource': 'Post'
    'uselist': True or False for 1-to-1 vs. 1-to-many
    This is advanced usage; minimal example below.
    """
    back_populates: Optional[str] = None
    parent_resource: Optional[str] = None
    uselist: Optional[bool] = True  # if False => one-to-one

class FieldDefinition(BaseModel):
    name: str
    type: str
    default: Optional[str] = None
    # new optional props
    foreign_key: Optional[str] = None   # e.g. "post.id"
    relationship: Optional[RelationshipDef] = None

class ResourceDefinitionIn(BaseModel):
    resource_name: str
    fields: List[FieldDefinition]

class ResourceDefinitionOut(BaseModel):
    id: int
    name: str
    fields: List[FieldDefinition]

    class Config:
        orm_mode = True

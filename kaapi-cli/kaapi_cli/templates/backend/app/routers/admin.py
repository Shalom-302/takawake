# backend/app/routers/admin.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from .auth import get_current_user, require_role
from ..codegen import (
    generate_model_file,
    generate_router_file,
    include_router_in_main,
    remove_router_from_main,
    remove_files_for_resource,
)
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.resource_definition import ResourceDefinition
from app.schemas.resource_definition import (
    ResourceDefinitionIn,
    ResourceDefinitionOut,
    FieldDefinition,
)
import json
import os

router = APIRouter()


# -----------------------------------
# CREATE A NEW RESOURCE
# -----------------------------------
@router.post("/resources")
def create_resource(
    resource: ResourceDefinitionIn,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    resource_name = resource.resource_name
    fields = resource.fields

    base_path = Path(__file__).parents[1]
    models_dir = base_path / "models"
    routers_dir = base_path / "routers"
    schemas_dir = base_path / "schemas"
    main_file = base_path / "main.py"

    if not models_dir.exists() or not routers_dir.exists() or not main_file.exists():
        raise HTTPException(status_code=500, detail="Server misconfiguration: paths not found.")

    # Generate code
    model_path = generate_model_file(resource_name, fields, models_dir)
    router_path = generate_router_file(resource_name, fields, routers_dir, schemas_dir)
    include_router_in_main(resource_name, main_file)

    # Save resource definition to DB
    resource_record = ResourceDefinition(
        name=resource_name,
        fields=json.dumps([field.dict() for field in fields]),
    )
    db.add(resource_record)
    db.commit()
    db.refresh(resource_record)

    return {
        "message": "Resource created successfully.",
        "model_file": str(model_path),
        "router_file": str(router_path),
    }
    
# -----------------------------------
# LIST ALL RESOURCES
# -----------------------------------
@router.get("/resources", response_model=List[ResourceDefinitionOut])
def list_resources(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    resources = db.query(ResourceDefinition).all()
    for r in resources:
        if isinstance(r.fields, str):
            r.fields = json.loads(r.fields)
    return resources

# -----------------------------------
# GET A SINGLE RESOURCE BY NAME
# -----------------------------------
@router.get("/resources/{resource_name}", response_model=ResourceDefinitionOut)
def get_resource_by_name(
    resource_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    resource_db = (
        db.query(ResourceDefinition)
        .filter(ResourceDefinition.name.ilike(resource_name))
        .first()
    )
    if not resource_db:
        raise HTTPException(status_code=404, detail="Resource not found")

    if isinstance(resource_db.fields, str):
        resource_db.fields = json.loads(resource_db.fields)

    return resource_db

# -----------------------------------
# UPDATE A RESOURCE BY NAME
# -----------------------------------
class ResourceDefinitionUpdate(BaseModel):
    """
    For partial updates, fields are optional.
    If 'resource_name' changes, we re-generate or rename code.
    """
    resource_name: Optional[str] = None
    fields: Optional[List[FieldDefinition]] = None

@router.put("/resources/{resource_name}", response_model=ResourceDefinitionOut)
def update_resource_by_name(
    resource_name: str,
    data: ResourceDefinitionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    resource_db = (
        db.query(ResourceDefinition)
        .filter(ResourceDefinition.name.ilike(resource_name))
        .first()
    )
    if not resource_db:
        raise HTTPException(status_code=404, detail="Resource not found")

    old_name = resource_db.name  # e.g. "Post"
    old_name_lower = old_name.lower()

    # Convert the existing JSON fields to a list/dict
    if isinstance(resource_db.fields, str):
        resource_db.fields = json.loads(resource_db.fields)

    # 1) Update resource name if provided
    new_name = old_name
    if data.resource_name is not None:
        new_name = data.resource_name

    # 2) Update fields if provided
    new_fields = resource_db.fields
    if data.fields is not None:
        new_fields = [f.dict() for f in data.fields]
    # This is a list of dict, e.g. [{"name":"title","type":"str","default":null}, ...]

    # ---- Regenerate the code if the name or fields changed ----
    base_path = Path(__file__).parents[1]
    models_dir = base_path / "models"
    routers_dir = base_path / "routers"
    schemas_dir = base_path / "schemas"
    main_file = base_path / "main.py"

    # If the resource name changed, we remove the old files + references, then generate new
    if new_name != old_name:
        # Remove old references from main.py
        remove_router_from_main(old_name, main_file)
        # Remove old model & router files
        remove_files_for_resource(old_name, models_dir, routers_dir, schemas_dir)

    # Generate code for the updated resource
    model_path = generate_model_file(new_name, data.fields or [], models_dir)
    router_path = generate_router_file(new_name, data.fields or [], routers_dir, schemas_dir)
    include_router_in_main(new_name, main_file)

    # Now update DB
    resource_db.name = new_name
    resource_db.fields = json.dumps(new_fields)
    db.commit()
    db.refresh(resource_db)

    # Convert final 'fields' to list for Pydantic
    if isinstance(resource_db.fields, str):
        resource_db.fields = json.loads(resource_db.fields)

    return resource_db

# -----------------------------------
# DELETE A RESOURCE BY NAME
# -----------------------------------
@router.delete("/resources/{resource_name}")
def delete_resource_by_name(
    resource_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    resource_db = (
        db.query(ResourceDefinition)
        .filter(ResourceDefinition.name.ilike(resource_name))
        .first()
    )
    if not resource_db:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Remove code files + references in main.py
    base_path = Path(__file__).parents[1]
    models_dir = base_path / "models"
    routers_dir = base_path / "routers"
    schemas_dir = base_path / "schemas"
    main_file = base_path / "main.py"

    remove_router_from_main(resource_db.name, main_file)
    remove_files_for_resource(resource_db.name, models_dir, routers_dir, schemas_dir)

    # Delete from DB
    db.delete(resource_db)
    db.commit()

    return {"detail": f"Resource '{resource_name}' deleted successfully."}

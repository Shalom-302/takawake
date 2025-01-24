# backend/app/routers/admin.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from .auth import get_current_user
from ..codegen import generate_model_file, generate_router_file, include_router_in_main

router = APIRouter()

class FieldDefinition(BaseModel):
    name: str
    type: str
    default: Optional[str] = None

class ResourceDefinition(BaseModel):
    resource_name: str
    fields: List[FieldDefinition]

@router.post("/resources")
def create_resource(resource: ResourceDefinition, current_user=Depends(get_current_user)):
    # 1. Validate the input
    resource_name = resource.resource_name
    fields = []
    for f in resource.fields:
        fields.append({
            "name": f.name,
            "type": f.type,
            "default": f.default
        })

    # 2. Define paths to models/ and routers/
    #    Assuming our current file is in backend/app/routers/ => go up two levels
    base_path = Path(__file__).parents[1]
    models_dir = base_path / "models"
    routers_dir = base_path / "routers"
    main_file = base_path / "main.py"

    if not models_dir.exists() or not routers_dir.exists() or not main_file.exists():
        raise HTTPException(status_code=500, detail="Server misconfiguration: paths not found.")

    # 3. Generate model, router, and include router
    model_path = generate_model_file(resource_name, fields, models_dir)
    router_path = generate_router_file(resource_name, fields, routers_dir)
    include_router_in_main(resource_name, main_file)

    return {
        "message": "Resource created successfully.",
        "model_file": str(model_path),
        "router_file": str(router_path)
    }

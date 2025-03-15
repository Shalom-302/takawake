# File: backend/app/routers/role.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from collections import defaultdict

from app.core.db import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.resource_definition import ResourceDefinition
from app.schemas.role import RoleCreate, RoleUpdate, RoleOut
from app.schemas.permission import PermissionSchema
from app.core.security import require_role

from casbin import Enforcer
from app.casbin_setup import get_casbin_enforcer  # your Casbin config

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------- Utility: get fields for a resource -------------
def get_fields_for_resource(resource_name: str, db: Session):
    """
    Look up 'resource_name' in the ResourceDefinition table. 
    If found, parse the 'fields' JSON to build a simple object with .fields 
    containing a list of objects each having a 'name' attr.

    e.g. If resource_db.fields is:
      [
        {"name":"title","type":"str"},
        {"name":"content","type":"str"},
        {"name":"likes","type":"int"}
      ]
    We'll produce an object with .fields = [FieldObj("title"), FieldObj("content"), FieldObj("likes")]
    """

    # 1) Query the DB for the resource definition by name
    resource_db = (
        db.query(ResourceDefinition)
        .filter(ResourceDefinition.name.ilike(resource_name))
        .first()
    )

    # We'll define a small inner class to wrap the final result
    class ResourceDef:
        def __init__(self, fields):
            self.fields = fields  # a list of objects each with a .name

    # If not found, return an empty ResourceDef
    if not resource_db:
        return ResourceDef([])

    # Parse the fields if they're stored as JSON
    if isinstance(resource_db.fields, str):
        # sometimes it's stored as a stringified JSON
        import json
        fields_list = json.loads(resource_db.fields)
    else:
        fields_list = resource_db.fields  # assume already a list

    if not isinstance(fields_list, list):
        # If for some reason it's not a list, fallback
        return ResourceDef([])

    # 2) Build a list of small objects with .name
    # We'll create a simple "FieldObj" dynamic class
    FieldObj = type("FieldObj", (), {})
    field_objs = []

    for fdef in fields_list:
        # e.g. fdef might be {"name":"title","type":"str"}
        name = fdef.get("name")
        # We only need 'name' if that's how we do field-level checking
        if name:
            fobj = FieldObj()
            fobj.name = name
            field_objs.append(fobj)

    return ResourceDef(field_objs)

# ---------------------- CRUD on Roles ----------------------

@router.get("/", response_model=List[RoleOut])
def list_roles(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    """
    Get a list of all roles.
    Also calculates how many users are assigned to each role.
    """
    roles = db.query(Role).all()
    role_list = []
    for r in roles:
        user_count = db.query(User).filter(User.role_id == r.id).count()
        role_list.append(
            RoleOut(
                id=r.id,
                name=r.name,
                description=r.description,
                userCount=user_count
            )
        )
    return role_list

@router.post("/", response_model=RoleOut)
def create_role(
    data: RoleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    """
    Create a new role with a name and optional description.
    """
    existing = db.query(Role).filter(Role.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")

    new_role = Role(name=data.name, description=data.description or "")
    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return RoleOut(
        id=new_role.id,
        name=new_role.name,
        description=new_role.description,
        userCount=0  # no users yet
    )

@router.get("/{role_id}", response_model=RoleOut)
def get_role_by_id(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    user_count = db.query(User).filter(User.role_id == role.id).count()
    return RoleOut(
        id=role.id,
        name=role.name,
        description=role.description,
        userCount=user_count
    )

@router.put("/{role_id}", response_model=RoleOut)
def update_role(
    role_id: int,
    data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    """
    Update a role's name/description.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if data.name and data.name != role.name:
        existing = db.query(Role).filter(Role.name == data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Role name already exists")
        role.name = data.name

    if data.description is not None:
        role.description = data.description

    db.commit()
    db.refresh(role)

    user_count = db.query(User).filter(User.role_id == role.id).count()
    return RoleOut(
        id=role.id,
        name=role.name,
        description=role.description,
        userCount=user_count
    )

@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    """
    Delete a role by ID.
    For safety, ensure it's not assigned to any users.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    user_count = db.query(User).filter(User.role_id == role.id).count()
    if user_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete a role that is in use")

    db.delete(role)
    db.commit()
    return {"detail": "Role deleted successfully"}


# ---------------------- Casbin Permissions Management ----------------------

@router.get("/{role_id}/permissions", response_model=List[PermissionSchema])
def get_role_permissions(
    role_id: int,
    db: Session = Depends(get_db),
    enforcer: Enforcer = Depends(get_casbin_enforcer)
):
    """
    Get all permissions assigned to a role (resource-level or field-level).
    If 'v1' includes a colon, that indicates resource:field.
    e.g. "article:title" => resource="article", field="title"
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Retrieve Casbin lines for this role
    casbin_permissions = enforcer.get_filtered_policy(0, role.name)

    results: List[PermissionSchema] = []
    for line in casbin_permissions:
        # Typically line = [roleName, obj, act]
        obj, act = line[1], line[2]
        field = None
        if ":" in obj:
            resource, field = obj.split(":", 1)
        else:
            resource = obj

        results.append(PermissionSchema(resource=resource, field=field, action=act, allowed=True))

    return results


@router.put("/{role_id}/permissions")
def update_role_permissions(
    role_id: int,
    perms: List[PermissionSchema],
    db: Session = Depends(get_db),
    enforcer: Enforcer = Depends(get_casbin_enforcer)
):
    """
    Update permissions for a role with resource-level vs. field-level logic:
      - If resource-level is allowed => skip field lines
      - If resource-level is disallowed but all fields are allowed => store resource-level
      - Else store partial field lines
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role_name = role.name

    # Remove old lines for that role
    enforcer.remove_filtered_policy(0, role_name)

    # Group perms by (resource, action)
    grouped = defaultdict(list)
    for p in perms:
        grouped[(p.resource.lower(), p.action)].append(p)

    for (ress, act), line_perms in grouped.items():
      resource_perm = next((lp for lp in line_perms if lp.field is None), None)

      # Si la ressource est autorisée, on ignore TOUS les field-level pour cette action
      if resource_perm and resource_perm.allowed:
          enforcer.add_policy(role_name, ress, act)
          # Supprimer tous les field-level existants pour cette action
          enforcer.remove_filtered_policy(0, role_name, f"{ress}:", act)
      else:
          # Sinon, on ajoute uniquement les field-level explicitement autorisés
          field_perms = [lp for lp in line_perms if lp.field is not None and lp.allowed]
          for fperm in field_perms:
              obj = f"{ress}:{fperm.field}"
              enforcer.add_policy(role_name, obj, act)
    return {"detail": "Permissions updated with resource/field logic"}

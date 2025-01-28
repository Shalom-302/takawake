from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleCreate, RoleUpdate, RoleOut
from app.schemas.permission import PermissionSchema
from app.routers.auth import require_role

from casbin import Enforcer

# Initialize Casbin Enforcer (assuming your config is already set up)
# Replace `get_casbin_enforcer()` with your actual implementation
from app.casbin_setup import get_casbin_enforcer

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
    # We can add userCount on the fly
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
    # Check if role with same name exists
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

# ---- GET ROLE PERMISSIONS ----
@router.get("/{role_id}/permissions", response_model=List[PermissionSchema])
def get_role_permissions(role_id: int, db: Session = Depends(get_db), enforcer: Enforcer = Depends(get_casbin_enforcer)):
    """
    Get all permissions assigned to a role using Casbin or custom logic.
    """
    # Check if role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Use Casbin to retrieve policies associated with the role
    casbin_permissions = enforcer.get_filtered_policy(0, role.name)  # Role name is typically used
    permissions = []
    for perm in casbin_permissions:
        resource, action = perm[1], perm[2]  # Assume policy format is (role_name, resource, action)
        permissions.append(PermissionSchema(resource=resource, action=action, allowed=True))

    return permissions

# ---- UPDATE ROLE PERMISSIONS ----
@router.put("/{role_id}/permissions")
def update_role_permissions(role_id: int, perms: List[PermissionSchema], db: Session = Depends(get_db), enforcer: Enforcer = Depends(get_casbin_enforcer)):
    """
    Update permissions for a role by modifying Casbin policies.
    """
    # Check if role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    role_name = role.name

    # Remove all existing policies for the role
    enforcer.remove_filtered_policy(0, role_name)

    # Add new policies based on the permissions list
    for perm in perms:
        if perm.allowed:  # Only add allowed permissions
            perm_name = perm.resource.lower()
            enforcer.add_policy(role_name, perm_name, perm.action)

    return {"detail": "Permissions updated successfully"}


@router.get("/{role_id}", response_model=RoleOut)
def get_role_by_id(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Super Admin"))
):
    """
    Fetch a single role by ID.
    """
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

    # If new name is given and is different, check for uniqueness
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
    For safety, ensure it's not assigned to any users (or reassign them).
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # optional check if users exist for this role
    user_count = db.query(User).filter(User.role_id == role.id).count()
    if user_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete a role that is in use")

    db.delete(role)
    db.commit()
    return {"detail": "Role deleted successfully"}

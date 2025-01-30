from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Type, List, Any, Optional, Dict
from pydantic import BaseModel
from app.db import get_db
from app.casbin_setup import get_casbin_enforcer
from app.routers.auth import get_current_user
from app.casbin_enforcer import require_casbin_permission

def get_filter_params(**kwargs) -> Dict[str, Any]:
    """Extract query parameters dynamically for filtering."""
    return {k: v for k, v in kwargs.items() if v is not None}

def get_populate_params(populate: Optional[str] = Query(None)) -> List[str]:
    """Extract populate fields from the request query."""
    return populate.split(",") if populate else []

def create_crud_router(
    model: Type[Any],
    schema_create: Type[BaseModel],
    schema_update: Type[BaseModel],
    resource_name: str,
    exclude_routes: Optional[List[str]] = None,  # New optional parameter
) -> APIRouter:
    """
    Factory function to create an APIRouter with CRUD operations,
    incorporating resource-level and field-level Casbin permissions.
    - Filtering (`?title=abc&author=xyz`)
    - Populate (`?populate=author,comments`)
    
    Parameters:
    - model: The SQLAlchemy model class.
    - schema_create: Pydantic schema for create operations.
    - schema_update: Pydantic schema for update operations.
    - resource_name: Name of the resource (e.g., "book").
    - exclude_routes: List of routes to exclude (e.g., ["create", "delete"]).
    
    Returns:
    - An APIRouter instance with CRUD endpoints.
    """
    router = APIRouter()
    exclude_routes = exclude_routes or []

    # ---------------------------
    # CREATE
    # ---------------------------
    if "create" not in exclude_routes:
        @router.post("/", name=f"create_{resource_name}")
        async def create_item(
            data: schema_create,
            db: Session = Depends(get_db),
            current_user: Any = Depends(get_current_user),
            enforcer: Any = Depends(get_casbin_enforcer),
        ) -> Any:
            role_name = current_user.role.name if current_user.role else "anonymous"
            resource_level_allowed = enforcer.enforce(role_name, resource_name, "create")

            data_dict = data.dict()
            if not resource_level_allowed:
                filtered_data = {field_name: value for field_name, value in data_dict.items()
                                 if enforcer.enforce(role_name, f"{resource_name}:{field_name}", "create")}
                data_dict = filtered_data

            if not data_dict:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No allowed fields for create"
                )

            db_obj = model(**data_dict)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

    # ---------------------------
    # LIST WITH FILTER & POPULATE
    # ---------------------------
    if "list" not in exclude_routes:
        @router.get("/", name=f"list_{resource_name}s")
        async def list_items(
            db: Session = Depends(get_db),
            current_user: Any = Depends(get_current_user),
            enforcer: Any = Depends(get_casbin_enforcer),
            filter_params: Dict[str, Any] = Depends(get_filter_params),
            populate_params: List[str] = Depends(get_populate_params),
        ) -> Any:
            role_name = current_user.role.name if current_user.role else "anonymous"
            query = db.query(model)

            # Apply filters dynamically
            for field, value in filter_params.items():
                if hasattr(model, field):
                    query = query.filter(getattr(model, field) == value)

            # Apply populate (eager loading for relations)
            for rel in populate_params:
                if hasattr(model, rel):
                    query = query.options(joinedload(getattr(model, rel)))

            all_objs = query.all()
            results = []

            for obj in all_objs:
                if enforcer.enforce(role_name, resource_name, "read"):
                    results.append(obj)
                else:
                    partial_data = {column.name: getattr(obj, column.name)
                                    for column in obj.__table__.columns
                                    if enforcer.enforce(role_name, f"{resource_name}:{column.name}", "read")}
                    if not partial_data:
                        raise HTTPException(403, f"No fields allowed for read on {resource_name} item")
                    results.append(partial_data)

            return results

    # ---------------------------
    # GET SINGLE ITEM WITH POPULATE
    # ---------------------------
    if "get" not in exclude_routes:
        @router.get("/{item_id}", name=f"get_{resource_name}")
        async def get_item(
            item_id: int,
            db: Session = Depends(get_db),
            current_user: Any = Depends(get_current_user),
            enforcer: Any = Depends(get_casbin_enforcer),
            populate_params: List[str] = Depends(get_populate_params),
        ) -> Any:
            query = db.query(model).filter(model.id == item_id)

            # Apply eager loading for requested relations
            for rel in populate_params:
                if hasattr(model, rel):
                    query = query.options(joinedload(getattr(model, rel)))

            obj = query.first()
            if not obj:
                raise HTTPException(404, f"{model.__name__} not found")

            role_name = current_user.role.name if current_user.role else "anonymous"
            if enforcer.enforce(role_name, resource_name, "read"):
                return obj
            else:
                partial_data = {column.name: getattr(obj, column.name)
                                for column in obj.__table__.columns
                                if enforcer.enforce(role_name, f"{resource_name}:{column.name}", "read")}
                if not partial_data:
                    raise HTTPException(403, f"No fields allowed for read on {resource_name} item")
                return partial_data

    # ---------------------------
    # UPDATE
    # ---------------------------
    if "update" not in exclude_routes:
        @router.put("/{item_id}", name=f"update_{resource_name}")
        async def update_item(
            item_id: int,
            data: schema_update,
            db: Session = Depends(get_db),
            current_user: Any = Depends(get_current_user),
            enforcer: Any = Depends(get_casbin_enforcer),
        ) -> Any:
            obj = db.query(model).filter(model.id == item_id).first()
            if not obj:
                raise HTTPException(404, f"{model.__name__} not found")

            role_name = current_user.role.name if current_user.role else "anonymous"
            resource_level_allowed = enforcer.enforce(role_name, resource_name, "update")

            update_data = data.dict(exclude_unset=True)
            if not resource_level_allowed:
                filtered_data = {field_name: value for field_name, value in update_data.items()
                                 if enforcer.enforce(role_name, f"{resource_name}:{field_name}", "update")}
                update_data = filtered_data

            if not update_data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No allowed fields for update"
                )

            for key, value in update_data.items():
                setattr(obj, key, value)

            db.commit()
            db.refresh(obj)

            if enforcer.enforce(role_name, resource_name, "read"):
                return obj
            else:
                partial_data = {column.name: getattr(obj, column.name)
                                for column in obj.__table__.columns
                                if enforcer.enforce(role_name, f"{resource_name}:{column.name}", "read")}
                if not partial_data:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"No fields allowed for read on updated {resource_name} item"
                    )
                return partial_data

    # ---------------------------
    # DELETE
    # ---------------------------
    if "delete" not in exclude_routes:
        @router.delete("/{item_id}", dependencies=[Depends(require_casbin_permission(resource_name, "delete"))])
        async def delete_item(
            item_id: int,
            db: Session = Depends(get_db),
        ):
            obj = db.query(model).filter(model.id == item_id).first()
            if not obj:
                raise HTTPException(404, f"{model.__name__} not found")

            db.delete(obj)
            db.commit()
            return {"detail": f"Deleted successfully from {model.__name__}"}

    return router

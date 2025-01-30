

```bash
kaapi-cli/
├── kaapi_cli/
│   ├── __init__.py
│   ├── cli.py
│   └── templates/
│       ├── backend/
│       │   ├── app/
│       │   │   └── main.py      (Minimal FastAPI example)
│       │   └── requirements.txt (Basic dependencies)
│       └── frontend/
│           └── package.json     (Placeholder for Next.js - minimal example)
├── pyproject.toml
└── README.md
```


## RBAC typically uses:

Users: The people (or service accounts) accessing your system.
Roles: Named sets of permissions (e.g. Admin, Editor, Reader).
Permissions: Granular actions (e.g. create_item, edit_item, delete_item).
Assignments: Each user has one or more roles, and each role has certain permissions.
In a simpler setup, you might do:

Admin: Full access to create, read, update, delete any resource.
Editor: Can create/edit items in certain resources but not others.
Reader: Can only read items.



```bash
sqlite3 dev.db
-- Example: assume role_id=1 corresponds to the “Admin” role.
INSERT INTO role (id, name)
VALUES (1, "Admin");

INSERT INTO role (id, name)
VALUES (2, "Editor");

INSERT INTO user (id, username, hashed_password, role_id)
VALUES (1, "admin", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", 1);

INSERT INTO user (id, username, hashed_password, role_id)
VALUES (2, "editor", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", 2);

```
decrypted value == password


```python
def build_router_code(resource_name: str) -> str:
    """
    Generate a FastAPI router using CrudBase for resource-level + field-level Casbin checks.
    Allows for overriding or extending routes in resource-specific routers.
    """
    class_name = resource_name[0].upper() + resource_name[1:]
    lower_name = resource_name.lower()

    router_code = f'''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.{lower_name} import {class_name}
from app.schemas.{lower_name} import {class_name}Create, {class_name}Update, {class_name}Out
from app.crud_base import CrudBase
from app.casbin_setup import get_casbin_enforcer
from app.routers.auth import get_current_user
from app.casbin_enforcer import require_casbin_permission

# Instantiate CrudBase for the '{lower_name}' resource
{lower_name}_crud = CrudBase(
    model={class_name},
    schema_create={class_name}Create,
    schema_update={class_name}Update,
    resource_name="{lower_name}",
)

# Expose the router
router = {lower_name}_crud.router

# ---------------------------
# Example: Override the 'create_item' method for custom behavior
# ---------------------------
# Uncomment and modify the following code if you need custom logic

# @router.post("/", response_model={class_name}Out, name="create_{lower_name}")
# async def custom_create_{lower_name}(
#     data: {class_name}Create,
#     db: Session = Depends(get_db),
#     current_user: Any = Depends(get_current_user),
#     enforcer: Any = Depends(get_casbin_enforcer),
# ):
#     # Custom create logic here
#     role_name = current_user.role.name if current_user.role else "anonymous"
#     resource_level_allowed = enforcer.enforce(role_name, "{lower_name}", "create")
#
#     data_dict = data.dict()
#     if not resource_level_allowed:
#         # Only accept individually allowed fields
#         filtered_data = {{}}
#         for field_name, value in data_dict.items():
#             obj_field = f"{lower_name}:{{field_name}}"
#             allowed = enforcer.enforce(role_name, obj_field, "create")
#             if allowed:
#                 filtered_data[field_name] = value
#         data_dict = filtered_data
#
#     if not data_dict:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="No allowed fields for create"
#         )
#
#     # Custom logic: Assign current user as author
#     data_dict["author_id"] = current_user.id
#
#     db_obj = {class_name}(**data_dict)
#     db.add(db_obj)
#     db.commit()
#     db.refresh(db_obj)
#     return db_obj

# ---------------------------
# Example: Add a custom route
# ---------------------------
# @router.post("/custom-action/{{item_id}}", response_model={class_name}Out)
# async def custom_action(
#     item_id: int,
#     db: Session = Depends(get_db),
#     current_user: Any = Depends(get_current_user),
#     enforcer: Any = Depends(get_casbin_enforcer),
# ):
#     # Custom action logic here
#     post = db.query({class_name}).filter({class_name}.id == item_id).first()
#     if not post:
#         raise HTTPException(status_code=404, detail="{class_name} not found")
#
#     # Example: Toggle publish status
#     post.is_published = not post.is_published
#     db.commit()
#     db.refresh(post)
#     return post
'''
    return router_code

```
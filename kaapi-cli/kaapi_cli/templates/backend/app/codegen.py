# backend/app/codegen.py
from pathlib import Path
import os

def generate_model_file(resource_name: str, fields: list, models_dir: Path) -> Path:
    """
    Creates/overwrites the model .py file in 'models_dir' for the given resource.
    Returns the path to the created/updated file.
    """
    resource_name_lower = resource_name.lower()
    code = build_model_code(resource_name, fields)
    file_path = models_dir / f"{resource_name_lower}.py"
    file_path.write_text(code, encoding="utf-8")
    return file_path


def generate_router_file(resource_name: str, fields: list, routers_dir: Path) -> Path:
    """
    Creates/overwrites the router .py file in 'routers_dir' for the given resource.
    Returns the path to the created/updated file.
    """
    resource_name_lower = resource_name.lower()
    code = build_router_code(resource_name, fields)
    file_path = routers_dir / f"{resource_name_lower}.py"
    file_path.write_text(code, encoding="utf-8")
    return file_path


def include_router_in_main(resource_name: str, main_file: Path):
    """
    Naive approach to insert import and include_router lines into main.py.
    If they don't already exist, we append them.
    """
    resource_name_lower = resource_name.lower()
    import_statement = f"from .routers.{resource_name_lower} import router as {resource_name_lower}_router"
    include_statement = f'app.include_router({resource_name_lower}_router, prefix="/{resource_name_lower}", tags=["{resource_name}"])'

    if not main_file.exists():
        # If there's no main_file, there's nothing to modify
        return

    content = main_file.read_text(encoding="utf-8")
    if import_statement not in content:
        content = import_statement + "\n" + content
    if include_statement not in content:
        content += f"\n{include_statement}\n"
    main_file.write_text(content, encoding="utf-8")


def build_model_code(resource_name: str, fields: list) -> str:
    """
    Returns a string containing the Python code for an SQLAlchemy model with the given fields.
    
    Note that we assume:
      - You have 'backend/app/db.py' with `Base`.
      - This code will *live* in 'backend/app/models/<resource>.py' once generated.
      - The import below references your future location (some_app.db).
    """
    import_section = """from sqlalchemy import Column, Integer, String, Boolean, Float, Text
from app.db import Base   # <-- Adjust this if your path is different
"""

    class_name = resource_name
    table_name = resource_name.lower()

    fields_str = ""
    for f in fields:
        col_type = type_to_sqlalchemy_col(f["type"])
        col_default = ""
        if f["default"] is not None:
            default_str = parse_default_value(f["default"])
            col_default = f", default={default_str}"
        fields_str += f"    {f['name']} = Column({col_type}{col_default})\n"

    model_code = f'''{import_section}

class {class_name}(Base):
    __tablename__ = "{table_name}"
    id = Column(Integer, primary_key=True, index=True)
{fields_str if fields_str else ""}
'''
    return model_code


def build_router_code(resource_name: str, fields: list) -> str:
    """
    Returns a string containing a FastAPI router with basic CRUD endpoints.
    Uses Pydantic schemas from generate_pydantic_schemas().
    We assume that once generated, this file will be placed in `backend/app/routers/<resource>.py`.
    """
    class_name = resource_name
    lower_name = resource_name.lower()
    pydantic_code = generate_pydantic_schemas(class_name, fields)

    router_code = f'''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal  # <-- Adjust if your path is different
from app.models.{lower_name} import {class_name}  # reference the newly generated model
{pydantic_code}

router = APIRouter()

# Dependency to get DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model={class_name}Out)
def create_{lower_name}(data: {class_name}Create, db: Session = Depends(get_db)):
    db_obj = {class_name}(**data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=list[{class_name}Out])
def list_{lower_name}s(db: Session = Depends(get_db)):
    return db.query({class_name}).all()

@router.get("/{{item_id}}", response_model={class_name}Out)
def get_{lower_name}(item_id: int, db: Session = Depends(get_db)):
    obj = db.query({class_name}).filter({class_name}.id == item_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="{class_name} not found")
    return obj

@router.put("/{{item_id}}", response_model={class_name}Out)
def update_{lower_name}(item_id: int, data: {class_name}Update, db: Session = Depends(get_db)):
    obj = db.query({class_name}).filter({class_name}.id == item_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="{class_name} not found")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{{item_id}}")
def delete_{lower_name}(item_id: int, db: Session = Depends(get_db)):
    obj = db.query({class_name}).filter({class_name}.id == item_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="{class_name} not found")

    db.delete(obj)
    db.commit()
    return {{"detail": "Deleted successfully"}}
'''
    return router_code


def generate_pydantic_schemas(class_name: str, fields: list) -> str:
    """
    Return a string containing three Pydantic schemas: 
      - {class_name}Create
      - {class_name}Update
      - {class_name}Out
    """
    lines_create = []
    lines_update = []
    lines_out = ["    id: int"]  # 'id' is included in the "Out" schema

    for f in fields:
        py_type = map_type_to_python(f["type"])

        # CREATE schema: required unless there's a default
        if f["default"] is not None:
            lines_create.append(f"    {f['name']}: {py_type} = {f['default']}")
        else:
            lines_create.append(f"    {f['name']}: {py_type}")

        # UPDATE schema: optional
        lines_update.append(f"    {f['name']}: {py_type} | None = None")
        # OUT schema
        lines_out.append(f"    {f['name']}: {py_type}")

    schema_code = f"""
from pydantic import BaseModel

class {class_name}Create(BaseModel):
{os.linesep.join(lines_create)}

class {class_name}Update(BaseModel):
{os.linesep.join(lines_update)}

class {class_name}Out(BaseModel):
{os.linesep.join(lines_out)}
"""
    return schema_code

# ============ Helper Functions ============

def type_to_sqlalchemy_col(py_type: str) -> str:
    """
    Map a string-based type (e.g. "str", "bool", "int", "float") to an SQLAlchemy column type.
    For unknown types, default to Text.
    """
    py_type = py_type.lower()
    if py_type == "str":
        return "String"
    elif py_type == "bool":
        return "Boolean"
    elif py_type == "int":
        return "Integer"
    elif py_type == "float":
        return "Float"
    else:
        # For now, default to Text for any other type
        return "Text"


def map_type_to_python(py_type: str) -> str:
    """
    Map a string-based type to a Python type used in Pydantic models.
    """
    py_type = py_type.lower()
    if py_type == "str":
        return "str"
    elif py_type == "bool":
        return "bool"
    elif py_type == "int":
        return "int"
    elif py_type == "float":
        return "float"
    else:
        return "str"  # fallback


def parse_default_value(default_raw: str) -> str:
    """
    Given a default value string (e.g. 'True', '42', 'hello'), produce a Python-friendly expression.
    - 'true' or 'false' -> bool
    - digits -> int
    - otherwise -> string literal
    """
    d = default_raw.strip().lower()
    if d == "true" or d == "false":
        return d.capitalize()  # "true" -> "True", "false" -> "False"
    if d.isdigit():
        # Convert digits to int
        return d
    # Otherwise treat as string
    # Escape quotes if needed. For simplicity, we'll wrap in single quotes
    return f"'{default_raw}'"

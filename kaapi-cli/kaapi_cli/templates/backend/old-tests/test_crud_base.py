import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String
from pydantic import BaseModel, ConfigDict
from typing import Optional
import os
from datetime import datetime

from app.crud_base import create_crud_router, parse_filters, apply_filters
from app.core.db import get_db
from app.casbin_setup import get_casbin_enforcer
from app.core.security import get_current_user

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Mock models for testing
class TestModel(Base):
    __tablename__ = "test_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)

class AuditLog(Base):
    __tablename__ = "kaapi_audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    action = Column(String)
    resource = Column(String)
    details = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class TestCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None

class TestUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TestOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    description: Optional[str] = None

# Test fixtures
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    if os.path.exists("test.db"):
        os.remove("test.db")
    Base.metadata.create_all(bind=engine)
    yield
    if os.path.exists("test.db"):
        os.remove("test.db")

@pytest.fixture
def test_db():
    db = TestingSessionLocal()
    try:
        # Clear all tables before each test
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
        yield db
    finally:
        db.close()

@pytest.fixture
def app(test_db):
    app = FastAPI()
    
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.close()
    
    # Mock current user for testing
    async def mock_current_user():
        return type('User', (), {'id': 1, 'role': type('Role', (), {'name': 'admin'})})()
    
    # Mock Casbin enforcer
    def mock_enforcer():
        return type('Enforcer', (), {
            'enforce': lambda *args: True  # Always allow for testing
        })()
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = mock_current_user
    app.dependency_overrides[get_casbin_enforcer] = mock_enforcer
    
    # Create and include the test router
    test_router = create_crud_router(
        model=TestModel,
        schema_create=TestCreateSchema,
        schema_update=TestUpdateSchema,
        schema_out=TestOutSchema,
        resource_name="test_item"
    )
    app.include_router(test_router, prefix="/test-items")
    
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

# Tests for CRUD operations
def test_create_item(client):
    response = client.post(
        "/test-items/",
        json={"name": "Test Item", "description": "Test Description"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["description"] == "Test Description"
    assert "id" in data

def test_read_items(client):
    # Create test items first
    client.post("/test-items/", json={"name": "Item 1"})
    client.post("/test-items/", json={"name": "Item 2"})
    
    response = client.get("/test-items/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Item 1"
    assert data[1]["name"] == "Item 2"

def test_read_item(client):
    # Create test item
    create_response = client.post(
        "/test-items/",
        json={"name": "Test Item", "description": "Test Description"}
    )
    item_id = create_response.json()["id"]
    
    response = client.get(f"/test-items/{item_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["description"] == "Test Description"

def test_update_item(client):
    # Create test item
    create_response = client.post(
        "/test-items/",
        json={"name": "Original Name", "description": "Original Description"}
    )
    item_id = create_response.json()["id"]
    
    # Update item
    response = client.put(
        f"/test-items/{item_id}",
        json={"name": "Updated Name", "description": "Updated Description"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated Description"

def test_delete_item(client):
    # Create test item
    create_response = client.post(
        "/test-items/",
        json={"name": "Test Item"}
    )
    item_id = create_response.json()["id"]
    
    # Delete item
    response = client.delete(f"/test-items/{item_id}")
    assert response.status_code == 200
    
    # Verify item is deleted
    get_response = client.get(f"/test-items/{item_id}")
    assert get_response.status_code == 404

# Tests for filter parsing and application
def test_parse_filters():
    query_params = {
        "filters[name][$eq]": "Test",
        "filters[description][$contains]": "sample"
    }
    filters = parse_filters(query_params)
    assert filters["name"]["$eq"] == "Test"
    assert filters["description"]["$contains"] == "sample"

def test_complex_filters(client):
    # Create test items
    client.post("/test-items/", json={"name": "Test 1", "description": "ABC"})
    client.post("/test-items/", json={"name": "Test 2", "description": "DEF"})
    
    # Test filtering
    response = client.get("/test-items/?filters[name][$eq]=Test 1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test 1"

# Test error handling
def test_create_item_invalid_data(client):
    response = client.post(
        "/test-items/",
        json={}  # Missing required field 'name'
    )
    assert response.status_code == 422

def test_update_nonexistent_item(client):
    response = client.put(
        "/test-items/999",
        json={"name": "Updated Name"}
    )
    assert response.status_code == 404

def test_delete_nonexistent_item(client):
    response = client.delete("/test-items/999")
    assert response.status_code == 404

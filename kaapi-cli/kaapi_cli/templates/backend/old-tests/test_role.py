import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from jose import jwt
from app.core.config import settings
from app.core.security import get_password_hash

from app.main import app
from app.core.db import Base, get_db
from app.models.role import Role
from app.models.user import User
from app.models.resource_definition import ResourceDefinition
from app.schemas.role import RoleCreate, RoleUpdate
from app.schemas.permission import PermissionSchema

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./dev.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables in the test database
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the get_db dependency
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    """Fixture to set up the database before each test"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    """Fixture that provides a database session"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def admin_user(db_session):
    """Fixture that creates an admin user"""
    admin_role = Role(name="Admin", description="Administrator role")
    db_session.add(admin_role)
    db_session.commit()

    admin = User(
        username="admin",
        # email="admin@example.com",
        hashed_password=get_password_hash("adminpass"),
        role_id=admin_role.id,
        # is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    return admin

@pytest.fixture
def admin_token(admin_user):
    """Fixture that provides an admin token"""
    access_token = jwt.encode(
        {
            "sub": str(admin_user.id),
            "role": "Admin"
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return access_token

@pytest.fixture
def test_role(db_session):
    """Fixture that creates a test role"""
    role = Role(name="Test Role", description="Test Description")
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role

def test_list_roles(admin_token):
    """Test listing all roles"""
    response = client.get(
        "/roles/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_role(admin_token):
    """Test creating a new role"""
    role_data = {
        "name": "New Role",
        "description": "New Role Description"
    }
    response = client.post(
        "/roles/",
        json=role_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == role_data["name"]
    assert data["description"] == role_data["description"]

def test_get_role(test_role, admin_token):
    """Test getting a specific role"""
    response = client.get(
        f"/roles/{test_role.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_role.name
    assert data["description"] == test_role.description

def test_update_role(test_role, admin_token):
    """Test updating a role"""
    update_data = {
        "name": "Updated Role",
        "description": "Updated Description"
    }
    response = client.put(
        f"/roles/{test_role.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]

def test_delete_role(test_role, admin_token):
    """Test deleting a role"""
    response = client.delete(
        f"/roles/{test_role.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 204

def test_get_role_permissions(test_role, admin_token):
    """Test getting role permissions"""
    response = client.get(
        f"/roles/{test_role.id}/permissions",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "resource_permissions" in data
    assert "field_permissions" in data

def test_update_role_permissions(test_role, admin_token):
    """Test updating role permissions"""
    permissions = [
        {
            "resource": "article",
            "action": "read",
            "allowed": True
        },
        {
            "resource": "article",
            "action": "write",
            "allowed": False
        }
    ]
    response = client.put(
        f"/roles/{test_role.id}/permissions",
        json=permissions,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200

def test_create_role_duplicate_name(admin_token):
    """Test creating a role with duplicate name"""
    role_data = {
        "name": "Duplicate Role",
        "description": "Description"
    }
    # Create first role
    client.post(
        "/roles/",
        json=role_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    # Try to create second role with same name
    response = client.post(
        "/roles/",
        json=role_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 400

def test_delete_role_with_users(test_role, db_session, admin_token):
    """Test deleting a role that has users assigned"""
    # Create a user and assign the test role
    user = User(
        username="testuser",
        # email="test@example.com",
        role_id=test_role.id
    )
    db_session.add(user)
    db_session.commit()

    # Try to delete the role
    response = client.delete(
        f"/roles/{test_role.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 400

def test_unauthorized_access():
    """Test accessing endpoints without proper authorization"""
    response = client.get("/roles/")
    assert response.status_code == 401

def test_non_admin_access(admin_token):
    """Test accessing endpoints with non-admin token"""
    non_admin_token = "non_admin_token"
    response = client.get(
        "/roles/",
        headers={"Authorization": f"Bearer {non_admin_token}"}
    )
    assert response.status_code == 403

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
import jwt
import hashlib
import datetime

from app.main import app, init_db
from app.core.db import Base, get_db
from app.models.user import User
from app.models.role import Role
from app.models.resource_definition import ResourceDefinition
from app.core.config import settings

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./tests.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize test database and create test data
print("\n🔵 Setting up test database...")
Base.metadata.create_all(bind=engine)
print("🔵 Initializing database with plugins...")
init_db()
print("🔵 Test database setup complete")

# Create initial test data
def create_test_data():
    print("\n🔵 Creating initial test data...")
    db = TestingSessionLocal()
    try:
        # Create roles
        admin_role = Role(name="Admin", description="Administrator role")
        user_role = Role(name="Editor", description="Regular user role")
        db.add(admin_role)
        db.add(user_role)
        db.commit()
        print("🔵 Roles created")

        # Create users
        admin_password = hashlib.sha256("adminpass".encode()).hexdigest()
        user_password = hashlib.sha256("userpass".encode()).hexdigest()
        
        admin = User(
            username="admin",
            hashed_password=admin_password,
            role_id=admin_role.id
        )
        regular_user = User(
            username="user",
            hashed_password=user_password,
            role_id=user_role.id
        )
        db.add(admin)
        db.add(regular_user)
        db.commit()
        print("🔵 Users created")
        
    finally:
        db.close()

create_test_data()

@pytest.fixture
def db_session():
    """Fixture that provides a database session"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

def override_get_db():
    """Override get_db dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    """Fixture that provides a test client"""
    return TestClient(app)

@pytest.fixture
def admin_role(db_session):
    """Fixture that provides the admin role"""
    return db_session.query(Role).filter(Role.name == "Admin").first()

@pytest.fixture
def user_role(db_session):
    """Fixture that provides the regular user role"""
    return db_session.query(Role).filter(Role.name == "Editor").first()

@pytest.fixture
def admin_user(db_session):
    """Fixture that provides the admin user"""
    return db_session.query(User).filter(User.username == "admin").first()

@pytest.fixture
def regular_user(db_session):
    """Fixture that provides the regular user"""
    return db_session.query(User).filter(User.username == "user").first()

@pytest.fixture
def admin_token(admin_user):
    """Fixture that provides an admin token"""
    payload = {
        "sub": str(admin_user.id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token

@pytest.fixture
def user_token(regular_user):
    """Fixture that provides a regular user token"""
    payload = {
        "sub": str(regular_user.id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token

@pytest.fixture
def auth_headers(admin_token):
    """Fixture that provides authorization headers with admin token"""
    return {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture
def user_auth_headers(user_token):
    """Fixture that provides authorization headers with user token"""
    return {"Authorization": f"Bearer {user_token}"}

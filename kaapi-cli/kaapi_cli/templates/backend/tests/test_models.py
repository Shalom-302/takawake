import pytest
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.role import Role
from app.models.resource_definition import ResourceDefinition

def test_create_role(db_session):
    """Test creating a role"""
    role = Role(name="Test Role", description="Test Description")
    db_session.add(role)
    db_session.commit()
    
    assert role.id is not None
    assert role.name == "Test Role"
    assert role.description == "Test Description"

def test_create_role_unique_name(db_session):
    """Test that role names must be unique"""
    role1 = Role(name="Test Role", description="First role")
    db_session.add(role1)
    db_session.commit()
    
    role2 = Role(name="Test Role", description="Second role")
    db_session.add(role2)
    with pytest.raises(IntegrityError):
        db_session.commit()

def test_create_user(db_session, admin_role):
    """Test creating a user"""
    user = User(
        username="testuser",
        hashed_password="hashedpass",
        role_id=admin_role.id
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.username == "testuser"
    assert user.hashed_password == "hashedpass"
    assert user.role_id == admin_role.id

def test_create_user_unique_username(db_session, admin_role):
    """Test that usernames must be unique"""
    user1 = User(
        username="testuser",
        hashed_password="hashedpass1",
        role_id=admin_role.id
    )
    db_session.add(user1)
    db_session.commit()
    
    user2 = User(
        username="testuser",
        hashed_password="hashedpass2",
        role_id=admin_role.id
    )
    db_session.add(user2)
    with pytest.raises(IntegrityError):
        db_session.commit()

# def test_user_role_relationship(db_session, admin_role, admin_user):
#     """Test the relationship between User and Role"""
#     # Get user from database
#     user = db_session.query(User).filter_by(id=admin_user.id).first()
    
#     # Test relationship
#     assert user.role is not None
#     assert user.role.id == admin_role.id
#     assert user.role.name == "Admin"
    
#     # Test reverse relationship
#     assert admin_user in admin_role.users

def test_create_resource_definition(db_session):
    """Test creating a resource definition"""
    resource = ResourceDefinition(
        name="article",
        fields=[
            {"name": "title", "type": "string"},
            {"name": "content", "type": "text"},
            {"name": "published", "type": "boolean"}
        ]
    )
    db_session.add(resource)
    db_session.commit()
    
    assert resource.id is not None
    assert resource.name == "article"
    assert len(resource.fields) == 3
    assert resource.fields[0]["name"] == "title"

def test_create_resource_definition_unique_name(db_session):
    """Test that resource definition names must be unique"""
    resource1 = ResourceDefinition(
        name="article",
        fields=[{"name": "title", "type": "string"}]
    )
    db_session.add(resource1)
    db_session.commit()
    
    resource2 = ResourceDefinition(
        name="article",
        fields=[{"name": "content", "type": "text"}]
    )
    db_session.add(resource2)
    with pytest.raises(IntegrityError):
        db_session.commit()

# def test_delete_role_cascade(db_session, admin_role, admin_user):
#     """Test that deleting a role fails if it has users"""
#     with pytest.raises(IntegrityError):
#         db_session.delete(admin_role)
#         db_session.commit()

# def test_delete_user(db_session, admin_user):
#     """Test deleting a user"""
#     db_session.delete(admin_user)
#     db_session.commit()
    
#     user = db_session.query(User).filter_by(id=admin_user.id).first()
#     assert user is None

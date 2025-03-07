import pytest
from fastapi import status
import jwt
import datetime
from app.core.config import settings

def test_login_success(client, admin_user):
    """Test successful login"""
    response = client.post(
        "/auth/email/login",
        json={
            "username": "admin",
            "password": "adminpass"
        }
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    
    # Verify token contents
    token = data["access_token"]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

    assert payload["sub"] == str(admin_user.id)
    assert "exp" in payload
    # assert "iat" in payload

def test_login_invalid_username(client):
    """Test login with invalid username"""
    response = client.post(
        "/auth/email/login",
        json={
            "username": "nonexistent",
            "password": "userpass"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_login_invalid_password(client, admin_user):
    """Test login with invalid password"""
    response = client.post(
        "/auth/email/login",
        json={
            "username": "admin",
            "password": "wrongpass"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_protected_route_no_token(client):
    """Test accessing protected route without token"""
    response = client.get("/roles/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_protected_route_invalid_token(client):
    """Test accessing protected route with invalid token"""
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/roles/", headers=headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

# def test_protected_route_expired_token(client, regular_user):
#     """Test accessing protected route with expired token"""
#     # Create expired token
#     payload = {
#         "sub": str(regular_user.id),
#         "exp": datetime.datetime.utcnow() - datetime.timedelta(hours=1),
#         "iat": datetime.datetime.utcnow() - datetime.timedelta(hours=2)
#     }
#     token = jwt.encode(payload, "CHANGE_ME", algorithm="HS256")
#     headers = {"Authorization": f"Bearer {token}"}
    
#     response = client.get("/roles/", headers=headers)
#     assert response.status_code == status.HTTP_401_UNAUTHORIZED
#     assert response.json()["detail"] == "Token expired"

# def test_admin_route_with_user_token(client, user_auth_headers):
#     """Test accessing admin route with regular user token"""
#     response = client.get("/roles/", headers=user_auth_headers)
#     print("======>",response.json())
#     assert response.status_code == status.HTTP_403_FORBIDDEN

# def test_admin_route_with_admin_token(client, auth_headers):
#     """Test accessing admin route with admin token"""
#     response = client.get("/roles/", headers=auth_headers)
#     assert response.status_code == status.HTTP_200_OK

# import pytest
# from fastapi import status

# def test_list_roles_empty(client, auth_headers):
#     """Test listing roles when there are none"""
#     response = client.get("/roles/", headers=auth_headers)
#     assert response.status_code == status.HTTP_200_OK
#     data = response.json()
#     assert isinstance(data, list)
#     assert len(data) == 0

# def test_list_roles(client, auth_headers, admin_role, user_role):
#     """Test listing all roles"""
#     response = client.get("/roles/", headers=auth_headers)
#     assert response.status_code == status.HTTP_200_OK
#     data = response.json()
#     assert isinstance(data, list)
#     assert len(data) == 2
#     role_names = {role["name"] for role in data}
#     assert role_names == {"Admin", "User"}

# def test_create_role(client, auth_headers):
#     """Test creating a new role"""
#     role_data = {
#         "name": "Editor",
#         "description": "Can edit content"
#     }
#     response = client.post("/roles/", json=role_data, headers=auth_headers)
#     assert response.status_code == status.HTTP_201_CREATED
#     data = response.json()
#     assert data["name"] == role_data["name"]
#     assert data["description"] == role_data["description"]

# def test_create_role_duplicate_name(client, auth_headers, admin_role):
#     """Test creating a role with duplicate name"""
#     role_data = {
#         "name": "Admin",
#         "description": "Another admin role"
#     }
#     response = client.post("/roles/", json=role_data, headers=auth_headers)
#     assert response.status_code == status.HTTP_400_BAD_REQUEST

# def test_get_role(client, auth_headers, admin_role):
#     """Test getting a specific role"""
#     response = client.get(f"/roles/{admin_role.id}", headers=auth_headers)
#     assert response.status_code == status.HTTP_200_OK
#     data = response.json()
#     assert data["name"] == admin_role.name
#     assert data["description"] == admin_role.description

# def test_get_role_not_found(client, auth_headers):
#     """Test getting a non-existent role"""
#     response = client.get("/roles/999", headers=auth_headers)
#     assert response.status_code == status.HTTP_404_NOT_FOUND

# def test_update_role(client, auth_headers, user_role):
#     """Test updating a role"""
#     update_data = {
#         "name": "Basic User",
#         "description": "Updated description"
#     }
#     response = client.put(
#         f"/roles/{user_role.id}",
#         json=update_data,
#         headers=auth_headers
#     )
#     assert response.status_code == status.HTTP_200_OK
#     data = response.json()
#     assert data["name"] == update_data["name"]
#     assert data["description"] == update_data["description"]

# def test_update_role_not_found(client, auth_headers):
#     """Test updating a non-existent role"""
#     update_data = {
#         "name": "Not Found",
#         "description": "This role doesn't exist"
#     }
#     response = client.put("/roles/999", json=update_data, headers=auth_headers)
#     assert response.status_code == status.HTTP_404_NOT_FOUND

# def test_delete_role(client, auth_headers, user_role):
#     """Test deleting a role"""
#     response = client.delete(f"/roles/{user_role.id}", headers=auth_headers)
#     assert response.status_code == status.HTTP_204_NO_CONTENT

#     # Verify role is deleted
#     response = client.get(f"/roles/{user_role.id}", headers=auth_headers)
#     assert response.status_code == status.HTTP_404_NOT_FOUND

# def test_delete_role_with_users(client, auth_headers, admin_role, admin_user):
#     """Test deleting a role that has users assigned"""
#     response = client.delete(f"/roles/{admin_role.id}", headers=auth_headers)
#     assert response.status_code == status.HTTP_400_BAD_REQUEST

# def test_delete_role_not_found(client, auth_headers):
#     """Test deleting a non-existent role"""
#     response = client.delete("/roles/999", headers=auth_headers)
#     assert response.status_code == status.HTTP_404_NOT_FOUND

# # Permission Tests
# def test_get_role_permissions(client, auth_headers, admin_role):
#     """Test getting role permissions"""
#     response = client.get(
#         f"/roles/{admin_role.id}/permissions",
#         headers=auth_headers
#     )
#     assert response.status_code == status.HTTP_200_OK
#     data = response.json()
#     assert "resource_permissions" in data
#     assert "field_permissions" in data

# def test_update_role_permissions(client, auth_headers, admin_role):
#     """Test updating role permissions"""
#     permissions = [
#         {
#             "resource": "article",
#             "action": "read",
#             "allowed": True
#         },
#         {
#             "resource": "article",
#             "action": "write",
#             "allowed": False
#         }
#     ]
#     response = client.put(
#         f"/roles/{admin_role.id}/permissions",
#         json=permissions,
#         headers=auth_headers
#     )
#     assert response.status_code == status.HTTP_200_OK

#     # Verify permissions were updated
#     response = client.get(
#         f"/roles/{admin_role.id}/permissions",
#         headers=auth_headers
#     )
#     data = response.json()
#     assert any(
#         p["resource"] == "article" and p["action"] == "read" and p["allowed"]
#         for p in data["resource_permissions"]
#     )
#     assert any(
#         p["resource"] == "article" and p["action"] == "write" and not p["allowed"]
#         for p in data["resource_permissions"]
#     )

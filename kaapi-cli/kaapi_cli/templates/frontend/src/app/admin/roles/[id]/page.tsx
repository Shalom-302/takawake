// Page: frontend/pages/admin/roles/[id].tsx
"use client";
import React, { useState, useEffect } from "react";

interface ResourceDef {
  resource_name: string;
  // Possibly other data like fields, but we only need 'resource_name' here
}

interface Permission {
  resource: string;
  action: string;   // "create" | "read" | "update" | "delete" | "publish"
  allowed: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function EditRolePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [resources, setResources] = useState<ResourceDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The standard set of actions we want to show for each collection type
  const ACTIONS = ["create", "read", "update", "delete", "publish"];

  useEffect(() => {
    if (!id) return;
    fetchRole(id);
    fetchPermissions(id);
    fetchCollections();
  }, [id]);

  // 1) Fetch the basic role info: name, description
  const fetchRole = async (roleId: string) => {
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch(`http://localhost:8000/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch role");
      }
      const data = await res.json();
      setRole(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2) Fetch existing permissions for this role => an array of { resource, action, allowed }
  const fetchPermissions = async (roleId: string) => {
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch(`http://localhost:8000/roles/${roleId}/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        // If your route doesn't exist, or returns 404 if no perms, handle gracefully
        console.warn("No /roles/{id}/permissions found or error");
        return;
      }
      const data = await res.json();
      console.log("hahaha", data)
      const perms = data.map((d) => { return {
        ...d,
        resource : d?.resource?.toLowerCase()
      }})
      setPermissions(perms);
    } catch (err) {
      console.warn("Error fetching role permissions:", err);
    }
  };

  // 3) Fetch all collections => so we can list them in the table
  const fetchCollections = async () => {
    const token = localStorage.getItem("kaapi_token");
    try {
      // Suppose GET /admin/resources returns e.g. [{ resource_name: "article" }, { resource_name: "author" }, ...]
      const res = await fetch("http://localhost:8000/admin/resources", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      } else {
        console.warn("No /admin/resources route or not OK");
      }
    } catch (err) {
      console.warn("Error fetching collections:", err);
    }
  };

  // 4) Save the role's name/description
  const saveRole = async () => {
    if (!role) return;
    const token = localStorage.getItem("kaapi_token");
    const body = {
      name: role.name,
      description: role.description
    };
    try {
      const res = await fetch(`http://localhost:8000/roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error updating role: " + errData.detail);
      } else {
        alert("Role updated successfully!");
      }
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  };

  // 5) We maintain `permissions` as an array => toggle each checkbox
  const togglePermission = (resource: string, action: string) => {
    const updated = [...permissions];
    const idx = updated.findIndex(
      (p) => p.resource === resource?.toLocaleLowerCase() && p.action === action
    );
    if (idx >= 0) {
      updated[idx].allowed = !updated[idx].allowed;
    } else {
      // if not found, add it with allowed = true
      updated.push({ resource : resource?.toLowerCase(), action, allowed: true });
    }
    setPermissions(updated);
  };

  // 6) Save all updated permissions => PUT /roles/{id}/permissions
  const savePermissions = async () => {
    if (!role) return;
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch(`http://localhost:8000/roles/${role.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(permissions)
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error saving permissions: " + errData.detail);
      } else {
        alert("Permissions saved successfully!");
      }
    } catch (err: any) {
      alert("Failed to save permissions: " + err.message);
    }
  };

  if (loading) return <div>Loading role data...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!role) return <div>Role not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Role</h1>
      <label>
        Name:{" "}
        <input
          type="text"
          value={role.name}
          onChange={(e) => setRole({ ...role, name: e.target.value })}
        />
      </label>
      <br />
      <label>
        Description:{" "}
        <input
          type="text"
          value={role.description}
          onChange={(e) => setRole({ ...role, description: e.target.value })}
        />
      </label>
      <br />
      <button onClick={saveRole}>Save Role</button>

      <h2>Permissions</h2>
      <p>
        By default, listing all collection types (resources) with actions below:
      </p>

      <table border={1} cellPadding={8} style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Collection</th>
       
            {ACTIONS.map((act) => (
              <th key={act}>{act.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              {ACTIONS.map((act) => {
                // find the permission object
                const perm = permissions.find(
                  (p) => p.resource === r.name?.toLocaleLowerCase() && p.action === act
                );
                const isAllowed = perm ? perm.allowed : false;
                return (
                  <td key={act} style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isAllowed}
                      onChange={() => togglePermission(r.name, act)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={savePermissions} style={{ marginTop: 10 }}>
        Save Permissions
      </button>
    </div>
  );
}

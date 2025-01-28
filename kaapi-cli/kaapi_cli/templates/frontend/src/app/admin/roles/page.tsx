// Page: frontend/admin/roles/index.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Role {
  id: number;
  name: string;
  description: string;
  // Possibly a userCount or something from the backend
  userCount?: number;
}

export default function RolesListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For creating a new role
  const [showModal, setShowModal] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch("http://localhost:8000/roles", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch roles");
      }
      const data = await res.json();
      setRoles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    const token = localStorage.getItem("kaapi_token");
    const body = {
      name: roleName,
      description: roleDesc
    };
    try {
      const res = await fetch("http://localhost:8000/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error creating role: " + errData.detail);
      } else {
        alert("Role created successfully");
        setShowModal(false);
        setRoleName("");
        setRoleDesc("");
        fetchRoles();
      }
    } catch (err: any) {
      alert("Failed to create role: " + err.message);
    }
  };

  if (loading) return <div>Loading roles...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Roles</h1>
      <p>List of roles</p>

      <button onClick={() => setShowModal(true)}>+ Add new role</button>

      <table border={1} cellPadding={6} style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Users</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.description}</td>
              <td>{r.userCount || 0} user(s)</td>
              <td>
                <Link href={`/admin/roles/${r.id}`}>
                  <button>Edit</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for creating role */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center"
          }}
        >
          <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
            <h2>Create a New Role</h2>
            <label>
              Name:
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </label>
            <br />
            <label>
              Description:
              <input
                type="text"
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
              />
            </label>
            <br />
            <button onClick={createRole}>Create</button>
            <button onClick={() => setShowModal(false)} style={{ marginLeft: 8 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

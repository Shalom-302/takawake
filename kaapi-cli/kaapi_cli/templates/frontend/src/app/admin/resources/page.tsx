// File: frontend/pages/admin/resources/page.tsx
"use client";
import React, { useEffect, useState } from "react";

// Updated Field interface to include optional foreign_key
interface Field {
  name: string;
  type: string;
  default?: string;
  foreign_key?: string;  // <--- new
}

interface ResourceDef {
  id: number;
  name: string;
  fields: string; // This is JSON from the DB
}

export default function AdminIndex() {
  const [resources, setResources] = useState<ResourceDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false); // Modal state

  // State for creating a new resource
  const [resourceName, setResourceName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [currentField, setCurrentField] = useState<Field>({ name: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("kaapi_token");

    if (!token) {
      setError("Token is missing. Please log in again.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/admin/resources", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized: Your session has expired.");
          if (res.status === 403) throw new Error("Forbidden: Access denied.");
          throw new Error("Failed to fetch resources.");
        }
        return res.json();
      })
      .then((data) => {
        setResources(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add field to local state
  const addField = () => {
    if (!currentField.name || !currentField.type) return;
    setFields([...fields, currentField]);
    setCurrentField({ name: "", type: "", foreign_key: "" });
  };

  // Create the resource (POST /admin/resources)
  const createResource = async () => {
    const token = localStorage.getItem("kaapi_token");
    const body = {
      resource_name: resourceName,
      fields: fields,
    };

    try {
      const res = await fetch("http://localhost:8000/admin/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Error: " + data.detail);
      } else {
        alert("Resource created successfully!");
        // Close modal, reset fields, and refresh resources
        setShowModal(false);
        setResourceName("");
        setFields([]);
        // If the backend returns a partial resource object, you can push it into resources
        // or re-fetch. For now we push a dummy entry or re-fetch if you prefer
        // setResources((prev) => [...prev, data]);
      }
    } catch (err: any) {
      alert("Failed to create resource: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={() => (window.location.href = "/admin/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={() => setShowModal(true)}>Add New Resource</button>

      <ul>
        {resources.map((r) => (
          <li key={r.id}>
            <a href={`/admin/resources/${r?.name?.toLowerCase()}`}>{r?.name}</a>
          </li>
        ))}
      </ul>

      {/* Modal for creating a new resource */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "500px",
            }}
          >
            <h2>Create a New Resource</h2>

            <label>Resource Name:</label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            />

            <h3>Fields</h3>
            <div>
              <input
                type="text"
                placeholder="Field name"
                value={currentField.name}
                onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
                style={{ marginRight: "10px" }}
              />
              <input
                type="text"
                placeholder="Field type (str, bool, int, float...)"
                value={currentField.type}
                onChange={(e) => setCurrentField({ ...currentField, type: e.target.value })}
                style={{ marginRight: "10px" }}
              />
              <input
                type="text"
                placeholder="Default value (optional)"
                value={currentField.default || ""}
                onChange={(e) => setCurrentField({ ...currentField, default: e.target.value })}
                style={{ marginRight: "10px" }}
              />
              {/* NEW optional foreign_key input */}
              <input
                type="text"
                placeholder="Foreign key (e.g. post.id)"
                value={currentField.foreign_key || ""}
                onChange={(e) => setCurrentField({ ...currentField, foreign_key: e.target.value })}
                style={{ marginRight: "10px" }}
              />

              <button onClick={addField}>Add Field</button>
            </div>

            <ul style={{ marginTop: "10px" }}>
              {fields.map((f, idx) => (
                <li key={idx}>
                  {f.name}:{f.type}
                  {f.default ? ` = ${f.default}` : ""}
                  {f.foreign_key ? ` (fk=${f.foreign_key})` : ""}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "20px" }}>
              <button onClick={createResource} style={{ marginRight: "10px" }}>
                Create Resource
              </button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

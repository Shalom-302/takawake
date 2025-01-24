// frontend/pages/admin/resources.tsx
"use client"
import React, { useState } from "react";

interface Field {
  name: string;
  type: string;
  default?: string;
}

export default function ResourcesPage() {
  const [resourceName, setResourceName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [currentField, setCurrentField] = useState<Field>({ name: "", type: "" });

  const addField = () => {
    if (!currentField.name || !currentField.type) return;
    setFields([...fields, currentField]);
    setCurrentField({ name: "", type: "" });
  };

  const createResource = async () => {
    const token = localStorage.getItem("kaapi_token");  // Retrieve token from storage
    const body = {
      resource_name: resourceName,
      fields: fields
    };

    try {
      const res = await fetch("http://localhost:8000/admin/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include token as Bearer
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Error: " + data.detail);
      } else {
        alert("Resource created successfully! " + JSON.stringify(data));
      }
    } catch (err: any) {
      alert("Failed to create resource: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Create a new Resource</h1>

      <label>Resource Name:</label>
      <input
        type="text"
        value={resourceName}
        onChange={(e) => setResourceName(e.target.value)}
      />

      <h2>Fields</h2>
      <div>
        <input
          type="text"
          placeholder="Field name"
          value={currentField.name}
          onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Field type (str, bool, int, float...)"
          value={currentField.type}
          onChange={(e) => setCurrentField({ ...currentField, type: e.target.value })}
        />
        <input
          type="text"
          placeholder="Default value (optional)"
          value={currentField.default || ""}
          onChange={(e) => setCurrentField({ ...currentField, default: e.target.value })}
        />
        <button onClick={addField}>Add Field</button>
      </div>

      <ul>
        {fields.map((f, idx) => (
          <li key={idx}>
            {f.name}:{f.type}
            {f.default ? `=${f.default}` : ""}
          </li>
        ))}
      </ul>

      <button onClick={createResource}>Create Resource</button>
    </div>
  );
}

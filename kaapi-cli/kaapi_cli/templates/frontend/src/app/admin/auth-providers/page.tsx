// Page: frontend/admin/auth-providers.tsx
"use client";
import React, { useState, useEffect } from "react";

interface Provider {
  provider: string;
  is_active: boolean; // "enabled" or "disabled"
}

export default function AuthProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch("http://localhost:8000/plugins/auth-providers/providers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch providers");
      }
      const data = await res.json();
      setProviders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (providerName: string, enable: boolean) => {
    const token = localStorage.getItem("kaapi_token");
    console.log("hihi", providerName)
    try {
      const res = await fetch(`http://localhost:8000/plugins/auth-providers/enable-provider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: providerName?.toUpperCase(), enable })
      });
      if (!res.ok) {
        const errData = await res.json();
        console.log("hehehe", errData.detail)
        alert("Error toggling provider: " + errData.detail);
      } else {
        alert(`Provider ${providerName} is now ${enable ? "enabled" : "disabled"}`);
        fetchProviders();
      }
    } catch (err: any) {
      alert("Failed to toggle provider: " + err.message);
    }
  };

  if (loading) return <div>Loading auth providers...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Auth Providers</h1>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.provider}>
              <td>{p.provider}</td>
              <td>{p.is_active ? "True": "False"}</td>
              <td>
                {p.is_active ? (
                  <button onClick={() => toggleProvider(p.provider, false)}>Disable</button>
                ) : (
                  <button onClick={() => toggleProvider(p.provider, true)}>Enable</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

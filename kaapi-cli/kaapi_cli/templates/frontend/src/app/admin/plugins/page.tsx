"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PluginInfo {
  name: string;
  enabled: boolean;
}

interface ToggleBody {
  enabled: boolean;
}

export default function PluginsPage() {
  const router = useRouter();
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("kaapi_token");
    if (!token) {
      alert("You must be logged in as an admin!");
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/admin/plugins", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch plugins");
      }
      const data = await res.json();
      setPlugins(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePlugin = async (pluginName: string, newEnabled: boolean) => {
    setError(null);
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch(`http://localhost:8000/admin/plugins/${pluginName}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: newEnabled } as ToggleBody)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to toggle plugin");
      }
      // Update local state
      setPlugins((prev) =>
        prev.map((p) =>
          p.name === pluginName ? { ...p, enabled: newEnabled } : p
        )
      );
      alert(`Plugin ${pluginName} is now ${newEnabled ? "enabled" : "disabled"}.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Plugins</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <ul>
        {plugins.map((plugin) => (
          <li key={plugin.name} style={{ marginBottom: "10px" }}>
            <strong>{plugin.name}</strong> <br/>
            <span>Enabled: {plugin.enabled ? "Yes" : "No"}</span>
            <br/>
            <button onClick={() => togglePlugin(plugin.name, !plugin.enabled)}>
              {plugin.enabled ? "Disable" : "Enable"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

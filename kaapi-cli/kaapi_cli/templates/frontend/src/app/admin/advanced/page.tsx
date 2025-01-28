// Page: frontend/admin/advanced.tsx
"use client";
import React, { useState, useEffect } from "react";

interface AdvancedSettings {
  default_authenticated_role: string;
  enable_signups: boolean;
  email_confirmation: boolean;
}

export default function AdvancedSettingsPage() {
  const [settings, setSettings] = useState<AdvancedSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch("http://localhost:8000/admin-advanced/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch settings");
      }
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch("http://localhost:8000/admin-advanced/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error saving settings: " + errData.detail);
      } else {
        alert("Settings saved successfully");
      }
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    }
  };

  if (loading) return <div>Loading advanced settings...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!settings) return <div>No settings available</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Advanced Settings</h1>

      <label>
        Default role for authenticated users:
        <input
          type="text"
          value={settings.default_authenticated_role}
          onChange={(e) =>
            setSettings({ ...settings, default_authenticated_role: e.target.value })
          }
        />
      </label>
      <br />

      <label>
        Enable sign-ups:
        <input
          type="checkbox"
          checked={settings.enable_signups}
          onChange={(e) =>
            setSettings({ ...settings, enable_signups: e.target.checked })
          }
        />
      </label>
      <br />

      <label>
        Enable email confirmation:
        <input
          type="checkbox"
          checked={settings.email_confirmation}
          onChange={(e) =>
            setSettings({ ...settings, email_confirmation: e.target.checked })
          }
        />
      </label>
      <br />

      <button onClick={saveSettings} style={{marginTop: 20}}>Save Settings</button>
    </div>
  );
}

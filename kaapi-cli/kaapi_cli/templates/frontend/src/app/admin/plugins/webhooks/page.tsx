"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Webhook {
  id: number;
  name: string;
  event: string;
  url: string;
  secret: string;
  is_enabled: boolean;
  config?: Record<string, any>;
}

export default function WebhooksAdminPage() {
  const router = useRouter();

  // Local state for storing webhook list and form data
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [name, setName] = useState("");
  const [event, setEvent] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [config, setConfig] = useState("{}"); // JSON string for extra settings
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all webhook subscriptions from the backend
  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/plugins/webhooks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch webhooks");
      }
      const data = await res.json();
      setWebhooks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new webhook subscription
  const createWebhook = async () => {
    if (!name || !event || !url) {
      alert("Please fill in the required fields: Name, Event, and URL.");
      return;
    }
    let parsedConfig: Record<string, any> = {};
    try {
      parsedConfig = JSON.parse(config);
    } catch (err) {
      alert("Invalid JSON in Config field.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/plugins/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          event,
          url,
          secret,
          is_enabled: isEnabled,
          config: parsedConfig
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create webhook");
      }
      alert("Webhook created successfully!");
      resetForm();
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing webhook subscription
  const updateWebhook = async () => {
    if (!editingWebhook) return;
    let parsedConfig: Record<string, any> = {};
    try {
      parsedConfig = JSON.parse(config);
    } catch (err) {
      alert("Invalid JSON in Config field.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch(`http://localhost:8000/plugins/webhooks/${editingWebhook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          event,
          url,
          secret,
          is_enabled: isEnabled,
          config: parsedConfig
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update webhook");
      }
      alert("Webhook updated successfully!");
      resetForm();
      setEditingWebhook(null);
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an existing webhook subscription
  const deleteWebhook = async (id: number) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch(`http://localhost:8000/plugins/webhooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to delete webhook");
      }
      alert("Webhook deleted successfully!");
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Populate the form fields for editing an existing webhook
  const startEditing = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setName(webhook.name);
    setEvent(webhook.event);
    setUrl(webhook.url);
    setSecret(webhook.secret);
    setIsEnabled(webhook.is_enabled);
    setConfig(JSON.stringify(webhook.config || {}, null, 2));
  };

  // Cancel editing and reset the form
  const cancelEditing = () => {
    setEditingWebhook(null);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setEvent("");
    setUrl("");
    setSecret("");
    setIsEnabled(true);
    setConfig("{}");
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Webhooks Admin</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Create / Edit Webhook Form */}
      <section style={{ marginBottom: 20 }}>
        <h2>{editingWebhook ? "Edit Webhook" : "Create Webhook"}</h2>
        <div>
          <label>Name:</label>{" "}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 'User Signup Notification'"
          />
        </div>
        <div>
          <label>Event:</label>{" "}
          <input
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            placeholder="e.g. 'user.created'"
          />
        </div>
        <div>
          <label>URL:</label>{" "}
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. 'https://example.com/webhook-handler'"
          />
        </div>
        <div>
          <label>Secret:</label>{" "}
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Optional secret for signing payloads"
          />
        </div>
        <div>
          <label>Enabled:</label>{" "}
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
        </div>
        <div>
          <label>Config (JSON):</label>{" "}
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            rows={4}
            style={{ width: "300px" }}
            placeholder='e.g. {"retry": 3}'
          />
        </div>
        <div style={{ marginTop: 10 }}>
          {editingWebhook ? (
            <>
              <button onClick={updateWebhook} disabled={loading}>
                Update Webhook
              </button>
              <button onClick={cancelEditing} style={{ marginLeft: "10px" }}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={createWebhook} disabled={loading}>
              Create Webhook
            </button>
          )}
        </div>
      </section>

      {/* Existing Webhooks List */}
      <section>
        <h2>Existing Webhooks</h2>
        {webhooks.length === 0 ? (
          <p>No webhooks found.</p>
        ) : (
          webhooks.map((w) => (
            <div
              key={w.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px"
              }}
            >
              <p>
                <strong>{w.name}</strong> (ID: {w.id})
              </p>
              <p>Event: {w.event}</p>
              <p>URL: {w.url}</p>
              <p>Enabled: {w.is_enabled ? "Yes" : "No"}</p>
              <div>
                <button onClick={() => startEditing(w)}>Edit</button>
                <button onClick={() => deleteWebhook(w.id)} style={{ marginLeft: "10px" }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

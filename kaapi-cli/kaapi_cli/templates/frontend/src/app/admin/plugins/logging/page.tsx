"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlugins } from "@/contexts/plugins";

interface LogEntry {
  id: string;
  level: string;
  message: string;
  labels: Record<string, string>;
}

export default function LoggingPage() {
  const router = useRouter();

  // Get global plugin info
  const { plugins, loading: pluginsLoading, error: pluginsError } = usePlugins();

  // Local state for logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState("INFO");
  const [message, setMessage] = useState("");
  const [labels, setLabels] = useState("{}");

  // Local states to show loading/error if "advanced_logging" is disabled or any fetch fails
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure admin token
  useEffect(() => {
    const token = localStorage.getItem("kaapi_token");
    if (!token) {
      alert("You must be logged in as an admin!");
      router.push("/admin/login");
    }
  }, [router]);

  // Once the global plugin data is loaded, check if advanced_logging is enabled. 
  // If yes, fetch logs. If not, set error "Logging plugin is disabled."
  useEffect(() => {
    if (!pluginsLoading && !pluginsError) {
      const loggingPlugin = plugins.find((p) => p.name === "advanced_logging");
      if (!loggingPlugin || !loggingPlugin.enabled) {
        setError("Logging plugin is disabled");
      } else {
        // plugin is enabled => fetch logs
        fetchLogs();
      }
    }
  }, [plugins, pluginsLoading, pluginsError]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/plugins/advanced_logging/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch logs");
      }
      const data: LogEntry[] = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createLog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("kaapi_token");
      const parsedLabels = JSON.parse(labels || "{}");

      const res = await fetch("http://localhost:8000/plugins/advanced_logging/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          level,
          message,
          labels: parsedLabels
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create log");
      }

      // Refresh logs
      fetchLogs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If plugin list is still loading
  if (pluginsLoading) {
    return <p>Loading plugin info...</p>;
  }
  // If there was an error fetching the global plugin list
  if (pluginsError) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Advanced Logging</h1>
        <p style={{ color: "red" }}>Error loading plugin data: {pluginsError}</p>
      </div>
    );
  }
  // If advanced_logging is disabled or a local error occurred
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Advanced Logging</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  // Otherwise, show the normal logging UI
  return (
    <div style={{ padding: 20 }}>
      <h1>Advanced Logging</h1>

      {loading && <p>Loading...</p>}

      <div>
        <label>Level: </label>
        <input value={level} onChange={(e) => setLevel(e.target.value)} />
      </div>
      <div>
        <label>Message: </label>
        <input value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <div>
        <label>Labels (JSON): </label>
        <input value={labels} onChange={(e) => setLabels(e.target.value)} />
      </div>
      <button onClick={createLog}>Create Log</button>

      <h2>Logs</h2>
      {logs.map((lg) => (
        <div key={lg.id}>
          <strong>{lg.level}</strong>: {lg.message} <br/>
          (labels: {JSON.stringify(lg.labels)})
          <hr />
        </div>
      ))}
    </div>
  );
}

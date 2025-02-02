"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlugins } from "@/contexts/plugins";

interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource: string;
  details?: string;
  created_at: string;
}

interface Resource {
  id: number;
  name: string;
}

const ACTION_OPTIONS = ["created", "updated", "deleted"];

export default function AdvancedAuditPage() {
  const router = useRouter();
  const { plugins, loading: pluginsLoading, error: pluginsError } = usePlugins();

  // States for audit logs and pagination
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);

  // States for filtering
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");

  // States for resources (to fill the resource dropdown)
  const [resources, setResources] = useState<Resource[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for admin token on mount
  useEffect(() => {
    const token = localStorage.getItem("kaapi_token");
    if (!token) {
      alert("You must be logged in as an admin!");
      router.push("/admin/login");
    }
  }, [router]);

  // Fetch available resources for filtering
  const fetchResources = async () => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/admin/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch resources");
      }
      const data = await res.json();
      setResources(data);
    } catch (err: any) {
      console.error("Error fetching resources:", err.message);
    }
  };

  // Fetch audit logs with pagination and filters
  const fetchLogs = async (pageNum: number = page, pageSizeNum: number = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("kaapi_token");

      // Build query string with filtering and pagination
      let query = "";
      if (selectedResource) {
        query += `&filters[resource][$eq]=${encodeURIComponent(selectedResource)}`;
      }
      if (selectedAction) {
        query += `&filters[action][$eq]=${encodeURIComponent(selectedAction)}`;
      }
      // query += `&page=${pageNum}&pageSize=${pageSizeNum}`;
      // if (query.startsWith("&")) {
      //   query = "?" + query.substring(1);
      // }

      const res = await fetch(`http://localhost:8000/plugins/advanced_audit/logs${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("ehehehe", res)
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch audit logs");
      }
      const data = await res.json();
      // Assume the response has the shape: { data: AuditLog[], meta: { pagination: { pageCount: number } } }
      setLogs(data.data || data);
      if (data.meta && data.meta.pagination) {
        setTotalPages(data.meta.pagination.pageCount);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler for applying filters
  const handleFilter = () => {
    setPage(1);
    fetchLogs(1, pageSize);
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      fetchLogs(page - 1, pageSize);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      fetchLogs(page + 1, pageSize);
    }
  };

  // Delete a specific audit log
  const handleDeleteLog = async (logId: number) => {
    if (!confirm("Are you sure you want to delete this audit log?")) return;
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch(`http://localhost:8000/plugins/advanced_audit/logs/${logId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to delete audit log");
      }
      alert("Audit log deleted successfully!");
      fetchLogs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete all audit logs
  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL audit logs?")) return;
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/plugins/advanced_audit/logs", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to delete all audit logs");
      }
      alert("All audit logs deleted successfully!");
      fetchLogs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Export audit logs (e.g., as CSV)
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/plugins/advanced_audit/logs/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to export audit logs");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit_logs.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // On mount, fetch resources and logs
  useEffect(() => {
    fetchResources();
    fetchLogs();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Advanced Audit Logs</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Filter Form */}
      <section style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 8 }}>Resource:</label>
        <select
          value={selectedResource}
          onChange={(e) => setSelectedResource(e.target.value)}
        >
          <option value="">All Resources</option>
          {resources.map((res) => (
            <option key={res.id} value={res.name}>
              {res.name}
            </option>
          ))}
        </select>
        <label style={{ margin: "0 8px" }}>Action:</label>
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
        >
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
        <button onClick={handleFilter} style={{ marginLeft: 10 }}>
          Apply Filters
        </button>
      </section>

      {/* Pagination Controls */}
      <section style={{ marginBottom: 20 }}>
        <button onClick={handlePrevPage} disabled={page <= 1}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page >= totalPages}>
          Next
        </button>
      </section>

      {/* Action Buttons */}
      <section style={{ marginBottom: 20 }}>
        <button onClick={handleDeleteAll} style={{ marginRight: 10 }}>
          Delete All Logs
        </button>
        <button onClick={handleExport}>
          Export Logs
        </button>
      </section>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            style={{
              border: "1px solid #ccc",
              marginBottom: 10,
              padding: 10,
              borderRadius: 4,
            }}
          >
            <p>
              <strong>{log.action}</strong> on <em>{log.resource}</em> at{" "}
              {new Date(log.created_at).toLocaleString()}
            </p>
            {log.details && <p>Details: {log.details}</p>}
            <button onClick={() => handleDeleteLog(log.id)}>
              Delete Log
            </button>
          </div>
        ))
      )}
    </div>
  );
}

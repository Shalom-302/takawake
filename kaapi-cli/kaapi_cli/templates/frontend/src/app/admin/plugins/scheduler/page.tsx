"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlugins } from "@/contexts/plugins";

interface Job {
  id: number;
  name: string;
  cron_expr: string;
  task_name: string;
  args: Record<string, any>;
  enabled: boolean;
}

export default function AdvancedSchedulerPage() {
  const router = useRouter();
  const { plugins, loading: pluginsLoading, error: pluginsError } = usePlugins();

  // Local state for the list of jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // Form fields for creating a job
  const [jobName, setJobName] = useState("");
  const [cronExpr, setCronExpr] = useState("");
  const [taskName, setTaskName] = useState("");
  const [argsJson, setArgsJson] = useState("{}"); // user can type JSON
  
  // For local loading/error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Verify admin token
  useEffect(() => {
    const token = localStorage.getItem("kaapi_token");
    if (!token) {
      alert("You must be logged in as an admin!");
      router.push("/admin/login");
    }
  }, [router]);

  // 2) Check if advanced_scheduler plugin is enabled, then fetch jobs
  useEffect(() => {
    if (!pluginsLoading && !pluginsError) {
      const advPlugin = plugins.find(p => p.name === "advanced_scheduler");
      if (!advPlugin || !advPlugin.enabled) {
        setError("Scheduler plugin is disabled");
      } else {
        fetchJobs();
      }
    }
  }, [plugins, pluginsLoading, pluginsError]);

  // Fetch the existing jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/plugins/advanced_scheduler/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch jobs");
      }
      const data = await res.json();
      setJobs(data); // We assume the backend returns a raw array of jobs
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3) Create a new scheduled job
  const createJob = async () => {
    if (!jobName || !cronExpr || !taskName) {
      alert("Please fill out the Name, CRON, and Task fields!");
      return;
    }

    // Parse JSON from the text field
    let parsedArgs: Record<string, any> = {};
    try {
      parsedArgs = JSON.parse(argsJson);
    } catch (err) {
      alert("Please enter valid JSON for task args.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("kaapi_token");

      // IMPORTANT: Prepend "advanced_scheduler.tasks." to the user’s input
      // e.g. if they typed "sample_task", we send "advanced_scheduler.tasks.sample_task"
      const finalTaskName = `advanced_scheduler.tasks.${taskName}`;

      const response = await fetch("http://localhost:8000/plugins/advanced_scheduler/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: jobName,
          cron_expr: cronExpr,
          task_name: finalTaskName,
          args: parsedArgs
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to create job");
      }
      alert("Job created successfully!");

      // reset the form
      setJobName("");
      setCronExpr("");
      setTaskName("");
      setArgsJson("{}");

      // Refresh the list
      fetchJobs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4) Delete an existing job
  const deleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(
        `http://localhost:8000/plugins/advanced_scheduler/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete job");
      }
      alert("Job deleted successfully!");
      fetchJobs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render logic
  if (pluginsLoading) {
    return <p>Loading plugin info...</p>;
  }
  if (pluginsError) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Advanced Scheduler</h1>
        <p style={{ color: "red" }}>Error loading plugin data: {pluginsError}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Advanced Scheduler</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Advanced Scheduler</h1>
      <p>
        Create or manage scheduled tasks by specifying a Celery task name, CRON expression,
        and optional arguments.
      </p>
      <p>
        <em>
          Example tasks:
          <ul>
            <li>
              <strong>sample_task</strong> with JSON args:{" "}
              <code>{"{\"x\": 3, \"y\": 5}"}</code>
            </li>
            <li>
              <strong>long_running_task</strong> with JSON args:{" "}
              <code>{"{\"duration\": 10}"}</code>
            </li>
          </ul>
          Cron examples:
          <ul>
            <li><code>0 3 * * *</code> &rarr; 3 AM daily</li>
            <li><code>*/5 * * * *</code> &rarr; every 5 minutes</li>
          </ul>
        </em>
      </p>

      {loading && <p>Loading...</p>}

      {/* CREATE JOB FORM */}
      <section style={{ marginBottom: 30 }}>
        <h2>Create New Scheduled Job</h2>
        <div style={{ marginTop: 10 }}>
          <label>Job Name: </label>
          <input
            type="text"
            value={jobName}
            onChange={e => setJobName(e.target.value)}
            placeholder="e.g. 'Nightly cleanup'"
            style={{ marginLeft: 6 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>CRON Expr: </label>
          <input
            type="text"
            value={cronExpr}
            onChange={e => setCronExpr(e.target.value)}
            placeholder="e.g. '0 3 * * *'"
            style={{ marginLeft: 6 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Task Name: </label>
          <input
            type="text"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            placeholder="e.g. 'sample_task'"
            style={{ marginLeft: 6 }}
          />
          <p style={{ fontSize: "0.9em", marginLeft: 6, color: "#666" }}>
            (We will prepend "advanced_scheduler.tasks." automatically.)
          </p>
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Task Args (JSON): </label>
          <input
            type="text"
            value={argsJson}
            onChange={e => setArgsJson(e.target.value)}
            placeholder='e.g. {"x":3,"y":5}'
            style={{ marginLeft: 6, width: 300 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <button onClick={createJob} disabled={loading}>
            Create Job
          </button>
        </div>
      </section>

      {/* LIST EXISTING JOBS */}
      <section>
        <h2>Existing Jobs</h2>
        {!jobs.length && <p>No scheduled jobs found.</p>}
        {jobs.map(job => (
          <div
            key={job.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
              borderRadius: 4
            }}
          >
            <p>
              <strong>Name:</strong> {job.name}
            </p>
            <p>
              <strong>CRON:</strong> {job.cron_expr}
            </p>
            <p>
              <strong>Task:</strong> {job.task_name}
            </p>
            <p>
              <strong>Args:</strong>{" "}
              {JSON.stringify(job.args, null, 2)}
            </p>
            <button onClick={() => deleteJob(job.id)}>
              Delete
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

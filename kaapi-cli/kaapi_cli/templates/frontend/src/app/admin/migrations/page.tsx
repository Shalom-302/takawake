"use client";
import React, { useState, useEffect } from "react";

// Our naive parser from above
function parseMigrationScript(script: string): string[] {
  const lines = script.split("\n");
  const summary: string[] = [];

  let inUpgrade = false; // We'll track when we're inside `def upgrade(): ...`

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Start collecting lines only inside upgrade()
    if (line.startsWith("def upgrade(")) {
      inUpgrade = true;
      continue;
    }
    if (line.startsWith("def ")) {
      // That means we just hit def downgrade() or some other function
      inUpgrade = false;
    }

    // If we're not in upgrade(), skip
    if (!inUpgrade) continue;

    // Now we only parse lines that start with op.
    if (line.startsWith("op.")) {
      if (line.includes("create_table")) {
        const match = line.match(/create_table\('(.*?)'/);
        if (match) {
          summary.push(`Create table '${match[1]}'`);
        } else {
          summary.push(line);
        }
      } else if (line.includes("drop_table")) {
        const match = line.match(/drop_table\('(.*?)'/);
        if (match) {
          summary.push(`Drop table '${match[1]}'`);
        } else {
          summary.push(line);
        }
      } else if (line.includes("drop_index")) {
        const idxMatch = line.match(/drop_index\('(.*?)'/);
        const tblMatch = line.match(/table_name='(.*?)'/);
        if (idxMatch && tblMatch) {
          summary.push(`Drop index '${idxMatch[1]}' on table '${tblMatch[1]}'`);
        } else {
          summary.push(line);
        }
      } else if (line.includes("create_index")) {
        const idxMatch = line.match(/create_index\('(.*?)'/);
        const tblMatch = line.match(/'(.*?)', \[/); // naive
        if (idxMatch && tblMatch) {
          summary.push(`Create index '${idxMatch[1]}' on table '${tblMatch[1]}'`);
        } else {
          summary.push(line);
        }
      } else if (line.includes("add_column")) {
        // e.g. op.add_column('sponsor', sa.Column('email', ...))
        const match = line.match(/add_column\('(.*?)',.*Column\('(.*?)'/);
        if (match) {
          summary.push(`Add column '${match[2]}' to table '${match[1]}'`);
        } else {
          summary.push(line);
        }
      } else if (line.includes("drop_column")) {
        // e.g. op.drop_column('sponsor', 'siren')
        // We'll match two groups: table, column
        const match = line.match(/drop_column\('(.*?)',\s*'(.*?)'/);
        if (match) {
          summary.push(`Drop column '${match[2]}' from table '${match[1]}'`);
        } else {
          summary.push(line);
        }
      } else {
        // fallback
        summary.push(line);
      }
    }
  }

  return summary;
}

interface MigrationChanges {
  changes: string;
}

export default function MigrationsPage() {
  const [changes, setChanges] = useState<MigrationChanges | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // state for toggling full script view
  const [showFullScript, setShowFullScript] = useState(false);

  useEffect(() => {
    fetchPendingChanges();
  }, []);

  const fetchPendingChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/admin/migrations/changes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError("Failed to fetch changes: " + errData.detail);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setChanges(data);
    } catch (err: any) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyMigrations = async () => {
    if (!confirm("Are you sure you want to run migrations?")) return;
    setError(null);
    try {
      const token = localStorage.getItem("kaapi_token");
      const res = await fetch("http://localhost:8000/admin/migrations/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError("Migration failed: " + errData.detail);
        return;
      }
      alert("Migrations applied successfully!");
      fetchPendingChanges();
    } catch (err: any) {
      setError("Migration error: " + err.message);
    }
  };

  if (loading) return <div>Loading migrations...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  // If we have changes, let's unescape any triple-quoted portion
  // (like the previous example). Then parse + display.
  let rawScript = changes?.changes || "";
  // Quick unescape of \n, \"
  rawScript = rawScript
    .replace(/^"|"$/g, "")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n");

  // Now parse for a bullet list
  const summaryList = parseMigrationScript(rawScript);

  return (
    <div style={{ padding: 20 }}>
      <h1>Pending Migrations</h1>

      {summaryList.length === 0 ? (
        <div>No pending changes detected.</div>
      ) : (
        <div>
          <h2>Detected Changes</h2>
          <ul>
            {summaryList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <button onClick={() => setShowFullScript(!showFullScript)}>
            {showFullScript ? "Hide Full Migration Script" : "Show Full Migration Script"}
          </button>
          {showFullScript && (
            <pre style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
              {rawScript}
            </pre>
          )}

          <button onClick={applyMigrations} style={{ display: "block", marginTop: "1rem" }}>
            Launch Migrations
          </button>
        </div>
      )}
    </div>
  );
}

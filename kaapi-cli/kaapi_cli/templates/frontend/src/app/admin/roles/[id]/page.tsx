"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FieldDef {
  name: string;
}

interface ResourceDefinition {
  name: string; // e.g. "article"
  fields: FieldDef[]; // e.g. [{name:"title"}, {name:"content"}]
}

interface Permission {
  resource: string; // e.g. "article"
  field?: string; // If set, this is a field-level perm
  action: string; // e.g. "create", "read", "update", "delete"
  allowed: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function EditRolePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  // The role being edited (name, desc, etc.)
  const [role, setRole] = useState<Role | null>(null);

  // The overall permissions array (resource-level + field-level).
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // The list of resources from the backend.
  const [resources, setResources] = useState<ResourceDefinition[]>([]);

  // Which resources are expanded to show field-level table
  const [expandedResources, setExpandedResources] = useState<string[]>([]);

  // Resource-level actions
  const ACTIONS_RESOURCE = ["create", "read", "update", "delete"];
  // Field-level actions
  const ACTIONS_FIELDS = ["create", "read", "update"];

  useEffect(() => {
    if (!id) return;
    fetchRoleData(id);
    fetchRolePermissions(id);
    fetchAllResources();
  }, [id]);

  // =====================
  // 1) Fetch the role
  // =====================
  const fetchRoleData = async (roleId: string) => {
    const token = localStorage.getItem("kaapi_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error fetching role: " + errData.detail);
        return;
      }
      const data = await res.json();
      setRole(data);
    } catch (err: any) {
      alert("Failed to fetch role: " + err.message);
    }
  };

  // =====================
  // 2) Fetch current permissions
  // =====================
  const fetchRolePermissions = async (roleId: string) => {
    const token = localStorage.getItem("kaapi_token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/roles/${roleId}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error fetching role permissions: " + errData.detail);
        return;
      }
      const data = await res.json();
      console.log("Fetched permissions:", data);
      setPermissions(data);
    } catch (err: any) {
      alert("Failed to fetch permissions: " + err.message);
    }
  };

  // =====================
  // 3) Fetch resources
  // =====================
  const fetchAllResources = async () => {
    const token = localStorage.getItem("kaapi_token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/admin/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error fetching resources: " + errData.detail);
        return;
      }
      const data = await res.json();
      // e.g. [ { name:"article", fields:[{name:"title"}, {name:"content"}] }, ... ]
      setResources(data);
    } catch (err: any) {
      alert("Failed to fetch resources: " + err.message);
    }
  };

  // =====================
  // Toggle resource-level action
  // =====================
  const toggleResourcePermission = (resource: string, action: string) => {
    const resLower = resource.toLowerCase();
    const updated = [...permissions];

    // Find or create the resource-level permission
    const idx = updated.findIndex(
      (p) => p.resource === resLower && !p.field && p.action === action
    );
    if (idx >= 0) {
      // Flip the existing allowed
      updated[idx].allowed = !updated[idx].allowed;
    } else {
      // If none, add
      updated.push({ resource: resLower, action, allowed: true });
    }

    // Synchronization logic for "create", "read", "update"
    if (ACTIONS_RESOURCE.includes(action)) {
      const resourcePerm = updated.find(
        (p) => p.resource === resLower && !p.field && p.action === action
      );

      if (resourcePerm && resourcePerm.allowed) {
        // If resource-level action is now allowed, set all field-level actions to allowed
        const resourceObj = resources.find((r) => r.name.toLowerCase() === resLower);
        if (resourceObj) {
          resourceObj.fields.forEach((fld) => {
            const fIdx = updated.findIndex(
              (p) =>
                p.resource === resLower && p.field === fld.name && p.action === action
            );
            if (fIdx >= 0) {
              updated[fIdx].allowed = true;
            } else {
              updated.push({
                resource: resLower,
                field: fld.name,
                action: action,
                allowed: true,
              });
            }
          });
        }
      } else {
        // If resource-level action is now disallowed, set all field-level actions to disallowed
        updated.forEach((p) => {
          if (p.resource === resLower && p.action === action) {
            p.allowed = false;
          }
        });
      }
    }

    setPermissions(updated);
  };

  // =====================
  // Toggle field-level permission
  // =====================
  const toggleFieldPermission = (resource: string, field: string, action: string) => {
    const resLower = resource.toLowerCase();
    const updated = [...permissions];

    // Find or create field-level permission
    const idx = updated.findIndex(
      (p) => p.resource === resLower && p.field === field && p.action === action
    );
    if (idx >= 0) {
      updated[idx].allowed = !updated[idx].allowed;
    } else {
      updated.push({ resource: resLower, field, action, allowed: true });
    }

    // Synchronization logic for "create", "read", "update"
    if (ACTIONS_FIELDS.includes(action)) {
      const resourcePerm = updated.find(
        (p) => p.resource === resLower && !p.field && p.action === action
      );

      const resourceData = resources.find((r) => r.name.toLowerCase() === resLower);
      if (resourceData) {
        const fieldPerms = resourceData.fields.map((fld) => {
          const perm = updated.find(
            (p) => p.resource === resLower && p.field === fld.name && p.action === action
          );
          return perm ? perm.allowed : false;
        });

        const allAllowed = fieldPerms.length > 0 && fieldPerms.every((allowed) => allowed);

        if (allAllowed) {
          // Set resource-level action to allowed
          if (resourcePerm) {
            resourcePerm.allowed = true;
          } else {
            updated.push({ resource: resLower, action, allowed: true });
          }
        } else {
          // Set resource-level action to disallowed
          if (resourcePerm) {
            resourcePerm.allowed = false;
          }
        }
      }
    }

    setPermissions(updated);
  };

  // Expand/collapse
  const toggleExpandResource = (resName: string) => {
    const resLower = resName.toLowerCase();
    if (expandedResources.includes(resLower)) {
      setExpandedResources(expandedResources.filter((r) => r !== resLower));
    } else {
      setExpandedResources([...expandedResources, resLower]);
    }
  };

  // =====================
  // Save the final permissions
  // =====================
  const savePermissions = async () => {
    if (!role) return;
    const token = localStorage.getItem("kaapi_token");
    try {
      const res = await fetch(`http://localhost:8000/roles/${role.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(permissions),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error saving permissions: " + errData.detail);
        return;
      }
      alert("Permissions saved successfully!");
    } catch (err: any) {
      alert("Failed to save permissions: " + err.message);
    }
  };

  if (!role) return <div>Loading role...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Role: {role.name}</h1>
      <p>{role.description}</p>

      <h2>Permissions</h2>
      <p>Manage resource-level and field-level permissions below.</p>

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Collection</th>
            {ACTIONS_RESOURCE.map((act) => (
              <th key={act}>{act.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <React.Fragment key={r.name}>
              {/* Resource-level row */}
              <tr>
                <td>
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => toggleExpandResource(r.name)}
                  >
                    {r.name}{" "}
                    {expandedResources.includes(r.name.toLowerCase()) ? "▲" : "▼"}
                  </span>
                </td>
                {ACTIONS_RESOURCE.map((act) => {
                  const perm = permissions.find(
                    (p) => p.resource === r.name.toLowerCase() && !p.field && p.action === act
                  );
                  const isAllowed = perm ? perm.allowed : false;
                  return (
                    <td key={act} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={() => toggleResourcePermission(r.name, act)}
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Field-level subtable, if expanded */}
              {expandedResources.includes(r.name.toLowerCase()) && (
                <tr>
                  <td
                    colSpan={ACTIONS_RESOURCE.length + 1}
                    style={{ background: "#333", color: "#fff" }}
                  >
                    <strong>FIELDS PERMISSIONS</strong>
                    <table border={1} cellPadding={4} style={{ marginTop: 8 }}>
                      <thead>
                        <tr>
                          <th>Field</th>
                          {ACTIONS_FIELDS.map((act) => (
                            <th key={act}>{act.toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {r.fields.map((fld) => (
                          <tr key={fld.name}>
                            <td>{fld.name}</td>
                            {ACTIONS_FIELDS.map((act) => {
                              const perm = permissions.find(
                                (p) =>
                                  p.resource === r.name.toLowerCase() &&
                                  p.field === fld.name &&
                                  p.action === act
                              );
                              const isAllowed =  perm?.allowed ?? false;
                              return (
                                <td key={act} style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={isAllowed}
                                    onChange={() =>
                                      toggleFieldPermission(r.name, fld.name, act)
                                    }
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <button onClick={savePermissions} style={{ marginTop: 10 }}>
        Save Permissions
      </button>
    </div>
  );
}

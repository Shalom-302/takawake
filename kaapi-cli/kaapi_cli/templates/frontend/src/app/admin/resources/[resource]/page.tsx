"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FieldDef {
  name: string;
  type: string;
  default?: string;
  foreign_key?: string; // <--- can be e.g. "post.id"
}

interface ResourceItem {
  id: number;
  [key: string]: any;
}

// Example: reference data structure for foreign tables
// e.g. referenceData["post"] = [{ id: 1, title: "Hello" }, ...]
type ReferenceDataMap = {
  [tableName: string]: Array<{ id: number; [key: string]: any }>;
};

export default function ResourcePage({ params }: { params: { resource: string } }) {
  const router = useRouter();
  const { resource } = params;

  // Resource definition
  const [fieldsDef, setFieldsDef] = useState<FieldDef[]>([]);
  // Items in the current resource
  const [items, setItems] = useState<ResourceItem[]>([]);
  // Data for creating a new item
  const [newItem, setNewItem] = useState<{ [key: string]: any }>({});

  // For editing the resource structure
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [editedFields, setEditedFields] = useState<FieldDef[]>([]);
  const [newEditedField, setNewEditedField] = useState<FieldDef>({ name: "", type: "" });

  // For editing an individual item
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editItemData, setEditItemData] = useState<{ [key: string]: any }>({});

  // For storing reference data of foreign tables
  const [referenceData, setReferenceData] = useState<ReferenceDataMap>({});

  useEffect(() => {
    if (!resource) return;
    fetchResourceDef(resource);
    fetchItems(resource);
  }, [resource]);

  // Fetch the resource definition (fields array, including foreign_key, etc.)
  const fetchResourceDef = async (resName: string) => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/admin/resources/${resName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error fetching resource definition: " + errData.detail);
        return;
      }
      const data = await response.json();
      // data.fields is an array of { name, type, default, foreign_key }
      setFieldsDef(data.fields);
      setEditedFields(data.fields);

      // For each foreign_key, parse the table name and fetch reference data
      data.fields.forEach((f: FieldDef) => {
        if (f.foreign_key) {
          const [table] = f.foreign_key.split(".");
          fetchReferenceData(table);
        }
      });
    } catch (err: any) {
      alert("Failed to fetch resource definition: " + err.message);
    }
  };

  // Fetch the actual items in this resource
  const fetchItems = async (resName: string) => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/${resName}?filters[price][$gte]=32`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error fetching items: " + JSON.stringify(errData.detail));
        return;
      }
      const data = await response.json();
      console.log("hahaha", data)
      setItems(data ?? []);
    } catch (err: any) {
      alert("Failed to fetch items: " + err.message);
    }
  };

  // Utility: fetch data from a related table (like "post") to populate a select
  const fetchReferenceData = async (table: string) => {
    // If we already fetched it, skip
    if (referenceData[table]) return;

    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/${table}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.warn(`Could not fetch reference data for table ${table}`);
        return;
      }
      const data = await response.json();
      setReferenceData((prev) => ({ ...prev, [table]: data }));
    } catch (err) {
      console.warn(`Failed to fetch reference data for ${table}:`, err);
    }
  };

  // CREATE a new item
  const createItem = async () => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/${resource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error creating item: " + errData.detail);
        return;
      }
      const data = await response.json();
      console.log("hehehe", data)
      alert("Created new item successfully!");
      setNewItem({});
      fetchItems(resource);
    } catch (err: any) {
      alert("Failed to create item: " + err.message);
    }
  };

  // DELETE an item
  const deleteItem = async (id: number) => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/${resource}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error deleting item: " + errData.detail);
        return;
      }
      alert("Deleted item successfully!");
      fetchItems(resource);
    } catch (err: any) {
      alert("Failed to delete item: " + err.message);
    }
  };

  // Start editing a row
  const startEditItem = (item: ResourceItem) => {
    setEditingItemId(item.id);
    setEditItemData({ ...item });
  };

  // Cancel editing
  const cancelEditItem = () => {
    setEditingItemId(null);
    setEditItemData({});
  };

  // Save changes to an item (PUT)
  const saveItemChanges = async (id: number) => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/${resource}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editItemData),
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error updating item: " + errData.detail);
        return;
      }
      alert("Item updated successfully!");
      setEditingItemId(null);
      setEditItemData({});
      fetchItems(resource);
    } catch (err: any) {
      alert("Failed to update item: " + err.message);
    }
  };

  // UPDATE RESOURCE structure
  const updateResource = async () => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/admin/resources/${resource}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fields: editedFields }),
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error updating resource: " + errData.detail);
        return;
      }
      alert("Resource updated successfully!");
      setFieldsDef(editedFields);
      setIsEditingResource(false);
    } catch (err: any) {
      alert("Failed to update resource: " + err.message);
    }
  };

  // Add a new field to the resource definition
  const addNewEditedField = () => {
    if (!newEditedField.name || !newEditedField.type) {
      alert("Please specify a name and a type for the new field.");
      return;
    }
    setEditedFields([...editedFields, newEditedField]);
    setNewEditedField({ name: "", type: "" });
  };

  if (!resource) {
    return <div>Loading resource page...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Resource: {resource}</h1>

      {/* ===================== ITEM LIST ===================== */}
      <h2>Existing Items</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            {fieldsDef.map((f) => (
              <th key={f.name}>{f.name}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isEditingThisRow = editingItemId === item.id;

            return (
              <tr key={item.id}>
                <td>{item.id}</td>
                {fieldsDef.map((f) => {
                  if (isEditingThisRow) {
                    // If it's a foreign key, show a <select> if we have referenceData
                    if (f.foreign_key) {
                      const [tableName] = f.foreign_key.split(".");
                      const list = referenceData[tableName] || [];
                      return (
                        <td key={f.name}>
                          <select
                            value={String(editItemData[f.name] || "")}
                            onChange={(e) =>
                              setEditItemData({
                                ...editItemData,
                                [f.name]: e.target.value,
                              })
                            }
                          >
                            <option value="">(None)</option>
                            {list.map((refItem) => (
                              <option key={refItem.id} value={refItem.id}>
                                {refItem.title || refItem.name || refItem.id}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    } else {
                      // Normal field
                      return (
                        <td key={f.name}>
                          <input
                            type="text"
                            value={String(editItemData[f.name] || "")}
                            onChange={(e) =>
                              setEditItemData({
                                ...editItemData,
                                [f.name]: e.target.value,
                              })
                            }
                          />
                        </td>
                      );
                    }
                  } else {
                    // Not editing this row
                    return <td key={f.name}>{String(item[f.name])}</td>;
                  }
                })}
                <td>
                  {isEditingThisRow ? (
                    <>
                      <button onClick={() => saveItemChanges(item.id)}>Save</button>
                      <button onClick={cancelEditItem} style={{ marginLeft: "5px" }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditItem(item)}>Edit</button>
                      <button onClick={() => deleteItem(item.id)} style={{ marginLeft: "5px" }}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ===================== CREATE NEW ITEM ===================== */}
      <h2>Create New {resource}</h2>
      {fieldsDef.map((f) => {
        // If it's a foreign key, show a <select>
        if (f.foreign_key) {
          const [tableName] = f.foreign_key.split(".");
          const list = referenceData[tableName] || [];
          return (
            <div key={f.name} style={{ marginBottom: "8px" }}>
              <label>
                {f.name} (FK to {f.foreign_key}):
                <select
                  value={newItem[f.name] || ""}
                  onChange={(e) => setNewItem({ ...newItem, [f.name]: e.target.value })}
                  style={{ marginLeft: "10px" }}
                >
                  <option value="">(None)</option>
                  {list.map((refItem) => (
                    <option key={refItem.id} value={refItem.id}>
                      {refItem.title || refItem.name || refItem.id}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        } else {
          // Normal text input
          return (
            <div key={f.name} style={{ marginBottom: "8px" }}>
              <label>
                {f.name} ({f.type}):
                <input
                  type="text"
                  value={newItem[f.name] || ""}
                  onChange={(e) => setNewItem({ ...newItem, [f.name]: e.target.value })}
                  style={{ marginLeft: "10px" }}
                />
              </label>
            </div>
          );
        }
      })}
      <button onClick={createItem}>Create</button>

      {/* ===================== EDIT RESOURCE FIELDS ===================== */}
      <h2>Edit Resource Fields</h2>
      <button onClick={() => setIsEditingResource(!isEditingResource)}>
        {isEditingResource ? "Cancel Editing" : "Edit Resource"}
      </button>

      {isEditingResource && (
        <div style={{ marginTop: 10 }}>
          {editedFields.map((field, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <label style={{ display: "block" }}>
                Field Name:
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => {
                    const updated = [...editedFields];
                    updated[index].name = e.target.value;
                    setEditedFields(updated);
                  }}
                  style={{ marginLeft: "5px" }}
                />
              </label>
              <label style={{ display: "block" }}>
                Field Type:
                <input
                  type="text"
                  value={field.type}
                  onChange={(e) => {
                    const updated = [...editedFields];
                    updated[index].type = e.target.value;
                    setEditedFields(updated);
                  }}
                  style={{ marginLeft: "5px" }}
                />
              </label>
              <label style={{ display: "block" }}>
                Default Value:
                <input
                  type="text"
                  value={field.default || ""}
                  onChange={(e) => {
                    const updated = [...editedFields];
                    updated[index].default = e.target.value;
                    setEditedFields(updated);
                  }}
                  style={{ marginLeft: "5px" }}
                />
              </label>
              <label style={{ display: "block" }}>
                Foreign Key:
                <input
                  type="text"
                  placeholder="e.g. post.id"
                  value={field.foreign_key || ""}
                  onChange={(e) => {
                    const updated = [...editedFields];
                    updated[index].foreign_key = e.target.value;
                    setEditedFields(updated);
                    // Also fetch reference data if user typed e.g. "post.id"
                    const [newTable] = e.target.value.split(".");
                    fetchReferenceData(newTable);
                  }}
                  style={{ marginLeft: "5px" }}
                />
              </label>
            </div>
          ))}

          {/* Add a brand new field */}
          <h3>Add a New Field</h3>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block" }}>
              Field Name:
              <input
                type="text"
                value={newEditedField.name}
                onChange={(e) => setNewEditedField({ ...newEditedField, name: e.target.value })}
                style={{ marginLeft: "5px" }}
              />
            </label>
            <label style={{ display: "block" }}>
              Field Type:
              <input
                type="text"
                value={newEditedField.type}
                onChange={(e) => setNewEditedField({ ...newEditedField, type: e.target.value })}
                style={{ marginLeft: "5px" }}
              />
            </label>
            <label style={{ display: "block" }}>
              Default Value:
              <input
                type="text"
                value={newEditedField.default || ""}
                onChange={(e) => setNewEditedField({ ...newEditedField, default: e.target.value })}
                style={{ marginLeft: "5px" }}
              />
            </label>
            <label style={{ display: "block" }}>
              Foreign Key:
              <input
                type="text"
                placeholder="e.g. post.id"
                value={newEditedField.foreign_key || ""}
                onChange={(e) => {
                  setNewEditedField({ ...newEditedField, foreign_key: e.target.value });
                  const [newTable] = e.target.value.split(".");
                  fetchReferenceData(newTable);
                }}
                style={{ marginLeft: "5px" }}
              />
            </label>
            <button onClick={addNewEditedField} style={{ marginTop: "5px" }}>
              Add Field
            </button>
          </div>

          <button onClick={updateResource} style={{ marginTop: "10px" }}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FieldDef {
  name: string;
  type: string; // e.g., "str", "bool", etc.
  default?: string;
}

interface ResourceItem {
  id: number;
  [key: string]: any;
}

export default function ResourcePage({ params }: { params: { resource: string } }) {
  const router = useRouter();
  const { resource } = params;

  const [fieldsDef, setFieldsDef] = useState<FieldDef[]>([]);
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [newItem, setNewItem] = useState<{ [key: string]: any }>({});

  // Editing resource structure (fields)
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [editedFields, setEditedFields] = useState<FieldDef[]>([]);
  const [newEditedField, setNewEditedField] = useState<FieldDef>({ name: "", type: "" });

  // Editing an individual item row
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editItemData, setEditItemData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (!resource) return;
    fetchResourceDef(resource);
    fetchItems(resource);
  }, [resource]);

  // --- FETCH RESOURCE DEFINITION ---
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
      setFieldsDef(data.fields);
      setEditedFields(data.fields); // Prepare for editing the resource structure
    } catch (err: any) {
      alert("Failed to fetch resource definition: " + err.message);
    }
  };

  // --- FETCH EXISTING ITEMS FOR THIS RESOURCE ---
  const fetchItems = async (resName: string) => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/${resName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error fetching items: " + errData.detail);
        return;
      }
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      alert("Failed to fetch items: " + err.message);
    }
  };

  // --- CREATE A NEW ITEM ---
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
      alert("Created new item successfully!");
      setNewItem({});
      fetchItems(resource);
    } catch (err: any) {
      alert("Failed to create item: " + err.message);
    }
  };

  // --- DELETE AN ITEM ---
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

  // ======================
  // EDIT RESOURCE STRUCTURE
  // ======================
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
      // Reflect changes in the displayed fields
      setFieldsDef(editedFields);
      setIsEditingResource(false);
    } catch (err: any) {
      alert("Failed to update resource: " + err.message);
    }
  };

  const addNewEditedField = () => {
    if (!newEditedField.name || !newEditedField.type) {
      alert("Please specify a name and a type for the new field.");
      return;
    }
    setEditedFields([...editedFields, newEditedField]);
    setNewEditedField({ name: "", type: "" });
  };

  // ======================
  // EDIT AN INDIVIDUAL ITEM
  // ======================

  // 1) Start editing a row
  const startEditItem = (item: ResourceItem) => {
    setEditingItemId(item.id);
    // Make a copy of item data for the form
    setEditItemData({ ...item });
  };

  // 2) Cancel editing
  const cancelEditItem = () => {
    setEditingItemId(null);
    setEditItemData({});
  };

  // 3) Save changes (PUT) to the backend
  const saveItemChanges = async (id: number) => {
    try {
      const token = localStorage.getItem("kaapi_token");
      const response = await fetch(`http://localhost:8000/${resource}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editItemData), // partial update or full update
      });
      if (!response.ok) {
        const errData = await response.json();
        alert("Error updating item: " + errData.detail);
        return;
      }
      alert("Item updated successfully!");
      setEditingItemId(null);
      setEditItemData({});
      fetchItems(resource); // Refresh the list
    } catch (err: any) {
      alert("Failed to update item: " + err.message);
    }
  };

  if (!resource) {
    return <div>Loading resource page...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Resource: {resource}</h1>

      {/* ========================================
          Existing Items Table
      ========================================= */}
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
                    // Show input field
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
                  } else {
                    // Show plain text
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

      {/* ========================================
          Create New Item Form
      ========================================= */}
      <h2>Create New {resource}</h2>
      {fieldsDef.map((f) => (
        <div key={f.name} style={{ marginBottom: "8px" }}>
          <label>
            {f.name} ({f.type}):
            <input
              type="text"
              value={newItem[f.name] || ""}
              onChange={(e) => setNewItem({ ...newItem, [f.name]: e.target.value })}
            />
          </label>
        </div>
      ))}
      <button onClick={createItem}>Create</button>

      {/* ========================================
          Edit Resource Fields
      ========================================= */}
      <h2>Edit Resource Fields</h2>
      <button onClick={() => setIsEditingResource(!isEditingResource)}>
        {isEditingResource ? "Cancel Editing" : "Edit Resource"}
      </button>

      {isEditingResource && (
        <div style={{ marginTop: 10 }}>
          {/* Existing fields to edit */}
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

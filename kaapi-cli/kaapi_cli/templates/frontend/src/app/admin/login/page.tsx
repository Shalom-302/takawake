"use client"
import React, { useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Login failed: " + data.detail);
        return;
      }
      const token = data.access_token;
      // For demonstration, store in local storage:
      localStorage.setItem("kaapi_token", token);
      alert("Login successful");
      // Redirect to /admin or wherever
      window.location.href = "/admin";
    } catch (err: any) {
      alert("Login error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Login</h1>
      <div>
        <label>Username:</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={doLogin}>Login</button>
    </div>
  );
}

// Page: frontend/admin/
"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Example: If the user has no token, redirect to an admin login page
    const token = localStorage.getItem("kaapi_token");
    if (!token) {
      alert("You must be logged in as an admin!");
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Kaapi Admin Dashboard</h1>
      <p>Welcome to the Admin area. Use the links below to manage your application:</p>
      <ul style={{ lineHeight: "1.8" }}>
        <li>
          <Link href="/admin/roles">
            Roles
          </Link>
        </li>
        <li>
          <Link href="/admin/resources">
            Resources
          </Link>
        </li>
        <li>
          <Link href="/admin/migrations">
            Migrations
          </Link>
        </li>
        <li>
          <Link href="/admin/plugins">
            Plugins
          </Link>
        </li>
        <li>
          <Link href="/admin/auth-providers">
            Auth Providers
          </Link>
        </li>
        <li>
          <Link href="/admin/advanced">
            Advanced Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}

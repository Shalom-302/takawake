"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";

// Each plugin's structure: { name: string; enabled: boolean; ... }
interface PluginInfo {
  name: string;
  enabled: boolean;
  // add other fields if needed
}

interface PluginsContextValue {
  plugins: PluginInfo[];          // the list of plugins
  loading: boolean;               // are we still fetching?
  error: string | null;           // any error
  refresh: () => Promise<void>;    // function to refetch plugin list
}

const PluginsContext = createContext<PluginsContextValue | undefined>(undefined);

export function PluginsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch plugins from /admin/plugins
  const fetchPlugins = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("kaapi_token");
      if (!token) {
        // You may choose to redirect or just set error
        // For example:
        router.push("/admin/login");
        return;
      }

      const res = await fetch("http://localhost:8000/admin/plugins", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch plugins");
      }
      const data: PluginInfo[] = await res.json();
      setPlugins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    fetchPlugins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose a refresh function
  const refresh = async () => {
    await fetchPlugins();
  };

  // Provide context value
  return (
    <PluginsContext.Provider value={{ plugins, loading, error, refresh }}>
      {children}
    </PluginsContext.Provider>
  );
}

// A convenience hook
export function usePlugins() {
  const context = useContext(PluginsContext);
  if (!context) {
    throw new Error("usePlugins must be used within a PluginsProvider");
  }
  return context;
}

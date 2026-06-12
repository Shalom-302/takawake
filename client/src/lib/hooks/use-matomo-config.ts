import { useState, useEffect } from "react";
import axios from "axios";

interface MatomoConfig {
    matomo_url: string;
    site_id: number;
    enabled: boolean;
    track_admin_users: boolean;
    heartbeat_timer: number;
    additional_settings?: Record<string, unknown>;
}

export function useMatomoConfig() {
    const [config, setConfig] = useState<MatomoConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/api/matomo/config");
                setConfig(response.data);
            } catch (err: unknown) {
                console.error("Error fetching Matomo configuration:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load Matomo configuration"
                );
                // Set fallback disabled config to prevent errors
                setConfig({
                    matomo_url: "",
                    site_id: 1,
                    enabled: false,
                    track_admin_users: false,
                    heartbeat_timer: 15,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    // Function to update configuration
    const updateConfig = async (newConfig: Partial<MatomoConfig>) => {
        try {
            setIsLoading(true);
            await axios.post("/api/matomo/config", {
                ...config,
                ...newConfig,
            });
            setConfig({
                ...config,
                ...newConfig,
            } as MatomoConfig);
            return true;
        } catch (err: unknown) {
            console.error("Error updating Matomo configuration:", err);
            setError(err instanceof Error ? err.message : "Failed to update Matomo configuration");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { config, isLoading, error, updateConfig };
}

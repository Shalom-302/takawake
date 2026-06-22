"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import authService from "../api/auth-service";

/**
 * Hook for handling OAuth callback URLs
 * Processes the callback code and redirects the user
 */
export function useAuthCallback() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        async function processCallback() {
            try {
                console.log("Processing OAuth callback");

                // Get code from query params
                const code = searchParams.get("code");
                if (!code) {
                    throw new Error("No authentication code provided");
                }
                console.log("Auth code received:", code);

                // Get state from query params
                const state = searchParams.get("state") || "state";
                console.log("State parameter:", state);

                // For Google OAuth, the provider is not in the URL
                // We have to determine it from the context or use a default
                // Idéalement, vous devriez stocker le provider dans localStorage au moment du clic
                const provider = localStorage.getItem("oauth_provider") || "google";
                console.log("Using provider:", provider);

                // Create the redirect URI that matches what was sent during initialization
                const redirectUri = `${window.location.origin}/auth/callback`;
                console.log("Redirect URI:", redirectUri);

                // Process the OAuth callback
                console.log("Calling backend with:", { provider, code, redirectUri, state });
                const response = await authService.processOAuthCallback(
                    provider,
                    code,
                    redirectUri,
                    state
                );
                console.log("Response from backend:", response);

                // Store token
                if (response.token && response.token.access_token) {
                    localStorage.setItem("auth_token", response.token.access_token);
                    if (response.token.refresh_token) {
                        localStorage.setItem("refresh_token", response.token.refresh_token);
                    }

                    // Store user info if available
                    if (response.user) {
                        localStorage.setItem("user", JSON.stringify(response.user));
                    }

                    toast.success("Authentication successful");
                    console.log("Authentication successful, redirecting to dashboard");

                    // Clear oauth_provider from localStorage
                    localStorage.removeItem("oauth_provider");

                    router.push("/dashboard");
                } else {
                    console.error("Invalid response format:", response);
                    throw new Error("No token received from server");
                }
            } catch (err: unknown) {
                console.error("OAuth callback error:", err);
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to process authentication";
                setError(errorMessage);
                toast.error(errorMessage || "Authentication failed");
            } finally {
                setLoading(false);
            }
        }

        processCallback();
    }, [router, searchParams]);

    return { loading, error };
}

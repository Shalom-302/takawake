import axios from "axios";

// API backend déployée (kaapi / Tekawake) :
//   - Base API    : https://veille-api.kortexai.dev/api   (toutes les routes)
//   - Swagger UI   : https://veille-api.kortexai.dev/docs
//   - OpenAPI JSON : https://veille-api.kortexai.dev/openapi.json
//   - Health       : https://veille-api.kortexai.dev/      → {"message":"Hello from Kaapi backend!"}
//
// L'URL effective vient de NEXT_PUBLIC_API_URL (inlinée au build Docker —
// cf. client/docker-compose.dokploy.yml). Fallback = backend local.

// Create a configurable axios instance
const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to attach authorization token if available
axiosClient.interceptors.request.use(
    config => {
        // Get token from localStorage in client-side context
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    error => Promise.reject(error)
);

export default axiosClient;

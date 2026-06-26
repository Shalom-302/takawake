import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Sortie autonome : .next/standalone embarque un server.js minimal +
    // uniquement les deps runtime → image Docker légère (cf. Dockerfile).
    // Activé UNIQUEMENT quand NEXT_OUTPUT_STANDALONE=true (cf. Dockerfile).
    // La copie standalone recrée des symlinks → EPERM sur Windows hors Mode
    // développeur. On la désactive donc par défaut pour les builds locaux.
    output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
    images: {
        domains: [
            "randomuser.me",
            "lh3.googleusercontent.com",
            "avatars.githubusercontent.com",
            "images.pexels.com",
            "images.unsplash.com",
            "kaanari.com",
            // Backend Tekawake — sert les images uploadées sous /api/uploads/.
            "veille-api.kortexai.dev",
        ],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "randomuser.me",
                pathname: "/api/portraits/**",
            },
        ],
    },
    // Disable static caching in development
    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === "development",
    },
    // Configuring headers to prevent caching
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value:
                            process.env.NODE_ENV === "development"
                                ? "no-store, no-cache, must-revalidate, proxy-revalidate"
                                : "public, max-age=3600, s-maxage=3600",
                    },
                    {
                        key: "Pragma",
                        value: process.env.NODE_ENV === "development" ? "no-cache" : "cache",
                    },
                    {
                        key: "Expires",
                        value: process.env.NODE_ENV === "development" ? "0" : "3600",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;

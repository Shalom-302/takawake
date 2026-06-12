import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Sortie autonome : .next/standalone embarque un server.js minimal +
    // uniquement les deps runtime → image Docker légère (cf. Dockerfile).
    output: "standalone",
    images: {
        domains: [
            "randomuser.me",
            "lh3.googleusercontent.com",
            "avatars.githubusercontent.com",
            "images.pexels.com",
            "images.unsplash.com",
            "kaanari.com",
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

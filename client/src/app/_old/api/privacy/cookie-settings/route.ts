/**
 * API route for getting cookie settings
 */
import { NextResponse } from "next/server";

export async function GET() {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
        const response = await fetch(`${BACKEND_URL}/privacy/cookie-settings`, {
            headers: {
                "Content-Type": "application/json",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error("Failed to fetch cookie settings");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching cookie settings:", error);
        return NextResponse.json({ error: "Failed to fetch cookie settings" }, { status: 500 });
    }
}

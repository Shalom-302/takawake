/**
 * API route for submitting cookie consent
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
        const data = await request.json();

        // Get user IP and user agent for consent tracking
        const ipAddress =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "127.0.0.1";

        const userAgent = request.headers.get("user-agent") || "Unknown";

        // Add required fields for backend
        const consentData = {
            ...data,
            consent_type: "cookie",
            ip_address: ipAddress,
            user_agent: userAgent,
            consent_details: {
                necessary: data.necessary,
                preferences: data.preferences,
                statistics: data.statistics,
                marketing: data.marketing,
            },
        };

        const response = await fetch(`${BACKEND_URL}/privacy/cookie-consent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(consentData),
        });

        if (!response.ok) {
            throw new Error("Failed to submit cookie consent");
        }

        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error submitting cookie consent:", error);
        return NextResponse.json({ error: "Failed to submit cookie consent" }, { status: 500 });
    }
}

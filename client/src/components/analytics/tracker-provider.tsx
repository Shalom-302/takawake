/**
 * Analytics Tracker Provider
 * Handles initialization of analytics tracking services and provides context for analytics data.
 */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import AnalyticsService, { SessionInfo } from "@/lib/services/analytics-service";
import { useSession } from "next-auth/react";
import { User } from "@/types/next-auth";

interface AnalyticsContextType {
    isTracking: boolean;
    sessionInfo: SessionInfo | null;
    enableTracking: () => Promise<void>;
    disableTracking: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    isTracking: false,
    sessionInfo: null,
    enableTracking: async () => {},
    disableTracking: async () => {},
});

export const useAnalytics = () => useContext(AnalyticsContext);

export function AnalyticsTrackerProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [isTracking, setIsTracking] = useState(false);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize analytics tracking when component mounts
    useEffect(() => {
        // Don't track in development mode unless explicitly enabled
        if (
            process.env.NODE_ENV === "development" &&
            !process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS
        ) {
            return;
        }

        // If user has opted out of tracking, don't initialize
        const hasOptedOut = localStorage.getItem("analytics-opt-out") === "true";
        if (hasOptedOut) {
            return;
        }

        if (!isInitialized) {
            initializeTracking();
            setIsInitialized(true);
        }

        // Clean up tracking when component unmounts
        return () => {
            if (isTracking) {
                AnalyticsService.endSession();
                setIsTracking(false);
                setSessionInfo(null);
            }
        };
    }, [session, isInitialized]);

    const initializeTracking = async () => {
        if (isTracking) return;

        try {
            // Get user ID from session if available
            // Utilisation du type User défini pour notre application
            const userId = session?.user ? (session.user as User).id?.toString() : undefined;
            const sessionInfo = await AnalyticsService.init(userId);

            if (sessionInfo) {
                setSessionInfo(sessionInfo);
                setIsTracking(true);
            }
        } catch (error) {
            console.error("Failed to initialize analytics tracking:", error);
        }
    };

    const enableTracking = async () => {
        localStorage.removeItem("analytics-opt-out");
        await initializeTracking();
    };

    const disableTracking = async () => {
        localStorage.setItem("analytics-opt-out", "true");

        if (isTracking) {
            await AnalyticsService.endSession();
            setIsTracking(false);
            setSessionInfo(null);
        }
    };

    return (
        <AnalyticsContext.Provider
            value={{
                isTracking,
                sessionInfo,
                enableTracking,
                disableTracking,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
}

export default AnalyticsTrackerProvider;

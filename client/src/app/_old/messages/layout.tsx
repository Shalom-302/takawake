"use client";

import { MessagingProvider } from "@/lib/contexts/messaging-context";
import { useEffect, useState } from "react";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    const [currentUserId, setCurrentUserId] = useState("");

    // Get current user information
    useEffect(() => {
        // In a real app, this would come from authentication or user context
        // For now, just set a dummy user ID
        setCurrentUserId("current-user-id");
    }, []);

    return (
        <MessagingProvider currentUserId={currentUserId}>
            <main className="flex flex-col h-screen bg-white">{children}</main>
        </MessagingProvider>
    );
}

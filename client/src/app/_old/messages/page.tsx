"use client";

import { MessagingProvider } from "@/lib/contexts/messaging-context";
import ConversationList from "@/components/messaging/conversation-list";
import ConversationView from "@/components/messaging/conversation-view";

export default function MessagesPage() {
    return (
        <MessagingProvider>
            <div className="flex flex-col md:flex-row h-screen max-h-screen bg-white">
                {/* Conversation Sidebar (visible on all screens on main messages page) */}
                <div className="md:w-1/3 lg:w-1/4 border-r flex flex-col">
                    <ConversationList />
                </div>

                {/* Welcome screen / placeholder */}
                <div className="flex-1 flex flex-col">
                    <ConversationView />
                </div>
            </div>
        </MessagingProvider>
    );
}

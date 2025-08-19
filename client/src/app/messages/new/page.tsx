"use client";

import ConversationList from "@/components/messaging/conversation-list";
import NewConversation from "@/components/messaging/new-conversation";

export default function NewConversationPage() {
    return (
        <div className="flex flex-col md:flex-row h-screen max-h-screen bg-white">
            {/* Conversation Sidebar (hidden on mobile when creating a new conversation) */}
            <div className="hidden md:flex md:w-1/3 lg:w-1/4 border-r flex-col">
                <ConversationList />
            </div>

            {/* Main Content - New Conversation Form */}
            <div className="flex-1 flex flex-col">
                <NewConversation />
            </div>
        </div>
    );
}

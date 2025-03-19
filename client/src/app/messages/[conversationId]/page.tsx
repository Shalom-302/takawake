'use client';

import { useEffect, useState } from 'react';
import ConversationView from '@/components/messaging/conversation-view';
import ConversationList from '@/components/messaging/conversation-list';

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const [currentUserId, setCurrentUserId] = useState('');
  const { conversationId } = params;

  // Get current user information
  useEffect(() => {
    // In a real app, this would come from authentication or user context
    setCurrentUserId('current-user-id');
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen bg-white">
      {/* Conversation Sidebar (hidden on mobile when viewing a conversation) */}
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 border-r flex-col">
        <ConversationList />
      </div>
      
      {/* Main Content - Conversation View */}
      <div className="flex-1 flex flex-col">
        <ConversationView currentUserId={currentUserId} />
      </div>
    </div>
  );
}

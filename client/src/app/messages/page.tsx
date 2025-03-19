'use client';

import { useEffect, useState } from 'react';
import { MessagingProvider } from '@/lib/contexts/messaging-context';
import ConversationList from '@/components/messaging/conversation-list';
import ConversationView from '@/components/messaging/conversation-view';

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user information
  useEffect(() => {
    // In a real app, this would come from authentication or user context
    // For now, just set a dummy user ID
    setCurrentUserId('current-user-id');
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <MessagingProvider currentUserId={currentUserId}>
      <div className="flex flex-col md:flex-row h-screen max-h-screen bg-white">
        {/* Conversation Sidebar (visible on all screens on main messages page) */}
        <div className="md:w-1/3 lg:w-1/4 border-r flex flex-col">
          <ConversationList />
        </div>
        
        {/* Welcome screen / placeholder */}
        <div className="flex-1 flex flex-col">
          <ConversationView currentUserId={currentUserId} />
        </div>
      </div>
    </MessagingProvider>
  );
}

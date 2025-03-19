import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { MessagingProvider } from '@/lib/contexts/messaging-context';
import ConversationList from '@/components/messaging/conversation-list';
import ConversationView from '@/components/messaging/conversation-view';
import NewConversation from '@/components/messaging/new-conversation';

export default function MessagingPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine the active view based on the route
  const isNewConversation = slug && slug[0] === 'new';
  const conversationId = !isNewConversation && slug ? slug[0] : null;
  
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
    <>
      <Head>
        <title>
          {isNewConversation
            ? 'New Conversation'
            : conversationId
            ? 'Conversation'
            : 'Messages'}
          {' | Kaapi'}
        </title>
      </Head>
      
      <MessagingProvider currentUserId={currentUserId}>
        <div className="flex flex-col md:flex-row h-screen max-h-screen bg-white">
          {/* Conversation Sidebar (hidden on mobile when viewing a conversation) */}
          <div 
            className={`md:w-1/3 lg:w-1/4 border-r md:flex flex-col ${
              conversationId || isNewConversation ? 'hidden' : 'flex'
            }`}
          >
            <ConversationList />
          </div>
          
          {/* Main Content */}
          <div 
            className={`flex-1 flex flex-col ${
              conversationId || isNewConversation ? 'flex' : 'hidden md:flex'
            }`}
          >
            {isNewConversation ? (
              <NewConversation />
            ) : (
              <ConversationView currentUserId={currentUserId} />
            )}
          </div>
        </div>
      </MessagingProvider>
    </>
  );
}

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMessaging } from '@/lib/contexts/messaging-context';
import ConversationHeader from './conversation-header';
import MessageList from './message-list';
import MessageInput from './message-input';

interface ConversationViewProps {
  currentUserId: string;
}

export default function ConversationView({ currentUserId }: ConversationViewProps) {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.conversationId as string || null;
  
  const { 
    activeConversation, 
    setActiveConversationId,
    markAsRead
  } = useMessaging();
  
  // Set active conversation based on URL parameter
  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
    
    return () => {
      // Clear active conversation when unmounting
      setActiveConversationId(null);
    };
  }, [conversationId, setActiveConversationId]);
  
  // Mark messages as read when conversation is viewed
  useEffect(() => {
    if (activeConversation) {
      markAsRead();
    }
  }, [activeConversation, markAsRead]);
  
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-center">
          <svg
            className="w-16 h-16 mb-4 text-gray-300 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 mb-6">
            Choose an existing conversation or start a new one
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            onClick={() => router.push('/messages/new')}
          >
            Start a new conversation
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full">
      <ConversationHeader currentUserId={currentUserId} />
      
      {!activeConversation ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <MessageList currentUserId={currentUserId} />
          <MessageInput />
        </>
      )}
    </div>
  );
}

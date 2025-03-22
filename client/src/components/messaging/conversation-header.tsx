import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMessaging } from '@/lib/contexts/messaging-context';
import { ConversationType } from '@/lib/types/messaging';
import { ConversationAvatar } from './conversation-avatar';

interface ConversationHeaderProps {
  currentUserId: string;
}

export default function ConversationHeader({ currentUserId }: ConversationHeaderProps) {
  const router = useRouter();
  const { activeConversation, isConnected } = useMessaging();
  const [showMenu, setShowMenu] = useState(false);
  
  if (!activeConversation) {
    return (
      <div className="p-3 border-b flex items-center">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
    );
  }
  
  // Get title for conversation (for direct chats, show the other participant's name)
  const getTitle = () => {
    if (activeConversation.title) return activeConversation.title;
    
    if (activeConversation.conversation_type === ConversationType.DIRECT) {
      const otherParticipant = activeConversation.participants.find(
        p => p.user_id !== currentUserId
      );
      
      if (otherParticipant) {
        return otherParticipant.first_name
          ? `${otherParticipant.first_name} ${otherParticipant.last_name || ''}`
          : otherParticipant.username || 'User';
      }
    }
    
    return 'Conversation';
  };
  

  // Get online status for direct chats
  const getOnlineStatus = () => {
    if (activeConversation.conversation_type !== ConversationType.DIRECT) {
      return null;
    }
    
    // This would typically come from a user presence system
    // For now, we just render a placeholder
    return true;
  };
  
  // Get participants count for group chats
  const getParticipantsInfo = () => {
    if (activeConversation.conversation_type === ConversationType.DIRECT) {
      return null;
    }
    
    const count = activeConversation.participants.length;
    return `${count} ${count === 1 ? 'member' : 'members'}`;
  };
  
  return (
    <div className="p-3 border-b flex items-center justify-between">
      <div className="flex items-center">
        <button
          className="md:hidden mr-2 text-gray-500"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        
        <div className="relative w-12 h-12 flex-shrink-0">
          <ConversationAvatar
            conversation={activeConversation}
            currentUserId={currentUserId}
          />
          {getOnlineStatus() && (
            <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
          )}
          </div>
      
        
        <div className="ml-3">
          <h2 className="font-semibold">{getTitle()}</h2>
          <div className="text-xs text-gray-500 flex items-center">
            {isConnected ? (
              <>
                {getOnlineStatus() && <span>Online</span>}
                {getParticipantsInfo() && <span>{getParticipantsInfo()}</span>}
              </>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                Reconnecting...
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Conversation menu"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setShowMenu(false);
                  // Implementation for search in conversation
                }}
              >
                Search in conversation
              </button>
              
              {activeConversation.conversation_type === ConversationType.GROUP && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => {
                    setShowMenu(false);
                    // Implementation for group info
                  }}
                >
                  Group info
                </button>
              )}
              
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setShowMenu(false);
                  // Implementation for muting conversation
                }}
              >
                Mute notifications
              </button>
              
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setShowMenu(false);
                  if (window.confirm('Are you sure you want to delete this conversation?')) {
                    // Implementation for deleting conversation
                    router.push('/messages');
                  }
                }}
              >
                Delete conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

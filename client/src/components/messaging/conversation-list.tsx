import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessaging } from '@/lib/contexts/messaging-context';
import { ConversationType, Conversation } from '@/lib/types/messaging';

// Function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === now.toDateString()) {
    return format(date, 'HH:mm', { locale: fr });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Hier';
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return format(date, 'EEEE', { locale: fr });
  } else {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  }
};

// Function to generate conversation title
const getConversationTitle = (conversation: Conversation, currentUserId: string) => {
  if (conversation.title) return conversation.title;
  
  if (conversation.conversationType === ConversationType.DIRECT) {
    // For direct conversations, display the other user's name
    const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
    if (otherParticipant) {
      return otherParticipant.firstName 
        ? `${otherParticipant.firstName} ${otherParticipant.lastName || ''}`
        : otherParticipant.username || 'Utilisateur';
    }
  }
  
  return 'Conversation sans titre';
};

// Function to generate avatar URL
const getAvatarUrl = (conversation: Conversation, currentUserId: string) => {
  if (conversation.avatarUrl) return conversation.avatarUrl;
  
  if (conversation.conversationType === ConversationType.DIRECT) {
    const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
    return otherParticipant?.profilePicture || '/images/default-avatar.png';
  }
  
  return '/images/default-group.png';
};

export default function ConversationList() {
  const router = useRouter();
  const { conversations, loadingConversations, activeConversation } = useMessaging();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulate current user ID - replace with real value from your authentication system
  const currentUserId = 'current-user-id';
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const title = getConversationTitle(conversation, currentUserId).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });
  
  // Sort conversations by last message date
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return dateB - dateA;
  });
  
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-2 top-3 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchQuery ? "Aucune conversation ne correspond à votre recherche" : "Aucune conversation"}
          </div>
        ) : (
          <ul>
            {sortedConversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              const hasUnread = (conversation.unreadCount || 0) > 0;
              
              return (
                <li key={conversation.id}>
                  <Link 
                    href={`/messages/${conversation.id}`}
                    className={`flex items-center p-3 hover:bg-gray-100 ${isActive ? 'bg-blue-50' : ''}`}
                  >
                    <div className="relative">
                      <img 
                        src={getAvatarUrl(conversation, currentUserId)}
                        alt="Avatar" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.conversationType === ConversationType.GROUP && (
                        <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium truncate ${hasUnread ? 'font-bold' : ''}`}>
                          {getConversationTitle(conversation, currentUserId)}
                        </h3>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-sm text-gray-600 truncate ${hasUnread ? 'font-semibold text-gray-800' : ''}`}>
                          {conversation.lastMessage?.content || "Pas de messages"}
                        </p>
                        
                        {hasUnread && (
                          <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <div className="p-3 border-t">
        <button
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
          onClick={() => router.push('/messages/new')}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New conversation
        </button>
      </div>
    </div>
  );
}

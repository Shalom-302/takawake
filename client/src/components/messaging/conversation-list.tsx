import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessaging } from '@/lib/contexts/messaging-context';
import { ConversationType, Conversation } from '@/lib/types/messaging';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/contexts/auth-context';
import { ConversationAvatar } from './conversation-avatar';

// Function to format date
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Si c'est aujourd'hui, afficher l'heure seulement
  if (date.toDateString() === now.toDateString()) {
    return format(date, 'HH:mm', { locale: fr });
  }
  
  // Si c'est hier, afficher "Hier"
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hier';
  }
  
  // Si c'est cette année, afficher le jour et le mois
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'd MMM', { locale: fr });
  }
  
  // Sinon, afficher la date complète
  return format(date, 'd MMM yyyy', { locale: fr });
};

// Function to generate conversation title
const getConversationTitle = (conversation: Conversation, currentUserId: string) => {
  if (conversation.title) return conversation.title;
  if (conversation.conversation_type === ConversationType.DIRECT) {
    // For direct conversations, display the other user's name
    const otherParticipant = conversation.participants.find(p => p.user_id !== currentUserId);
    if (otherParticipant) {
      return otherParticipant.first_name 
        ? `${otherParticipant.first_name} ${otherParticipant.last_name || ''}`
        : otherParticipant.username || 'User';
    }
  }
  
  return 'Untitled conversation';
};

export default function ConversationList() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { conversations, loadingConversations, activeConversation, refreshConversations } = useMessaging();
  const [searchQuery, setSearchQuery] = useState('');
  const previousConversationsRef = useRef<Conversation[]>([]);
  
  // Simulate current user ID - replace with real value from your authentication system
  const currentUserId = user?.id;
  
  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    console.log('Filtering conversations with query:', searchQuery);
    return Array.isArray(conversations) ? [...conversations].filter(conversation => {
      const title = getConversationTitle(conversation, currentUserId!).toLowerCase();
      return title.includes(searchQuery.toLowerCase());
    }) : [];
  }, [conversations, searchQuery, currentUserId]);
  
  
  // Sort conversations by last message date
  const sortedConversations = useMemo(() => {
    console.log('Sorting conversations by last message date');
    if (!filteredConversations.length) return [];
    
    const sorted = [...filteredConversations].sort((a, b) => {
      // Ensure we have proper dates to compare
      const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      
      console.log(`Comparing: ${a.id} (${a.last_message_at}) vs ${b.id} (${b.last_message_at})`);
      return dateB - dateA;
    });
    
    console.log('Sorted order: ', sorted.map(c => ({ 
      id: c.id, 
      last_message: c.last_message?.content?.substring(0, 15), 
      date: c.last_message_at,
      timestamp: c.last_message_at ? new Date(c.last_message_at).getTime() : 0
    })));
    
    return sorted;
  }, [filteredConversations]);

  // Add effect to log when conversations change
  useEffect(() => {
    if (JSON.stringify(conversations) !== JSON.stringify(previousConversationsRef.current)) {
      console.log('Conversations have changed in ConversationList:', conversations);
      if (conversations.length > 0) {
        console.log('First conversation:', {
          id: conversations[0].id,
          last_message: conversations[0].last_message?.content,
          last_message_at: conversations[0].last_message_at,
          unread_count: conversations[0].unread_count
        });
      }
      previousConversationsRef.current = [...conversations];
    }
  }, [conversations]);

  // Force periodical refresh of conversations
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Periodically refreshing conversations");
      refreshConversations();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [refreshConversations]);

  

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a conversation..."
            className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
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
              const hasUnread = (conversation.unread_count || 0) > 0;
              console.log("Conversation:", conversation);
              return (
                <li key={conversation.id}>
                  <Link 
                    href={`/messages/${conversation.id}`}
                    className={`flex items-center p-3 hover:bg-gray-100 ${isActive ? 'bg-blue-50' : ''}`}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <ConversationAvatar
                        conversation={conversation}
                        currentUserId={currentUserId}
                      />
                      {conversation.conversation_type === ConversationType.GROUP && (
                        <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium truncate ${hasUnread ? 'font-bold' : ''}`}>
                          {getConversationTitle(conversation, currentUserId!)}
                        </h3>
                        {conversation.last_message_at && (
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.last_message_at)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-sm text-gray-600 truncate ${hasUnread ? 'font-semibold text-gray-800' : ''}`}>
                          {conversation.last_message?.content || "Pas de messages"}
                        </p>
                        
                        {hasUnread && (
                          <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {conversation.unread_count}
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
        <Button
          className="w-full"
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
        </Button>
      </div>
    </div>
  );
}

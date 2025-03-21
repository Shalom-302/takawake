import React, { useRef, useEffect } from 'react';
import { useMessaging } from '@/lib/contexts/messaging-context';
import MessageItem from './message-item';
import { Message } from '@/lib/types/messaging';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageListProps {
  currentUserId: string;
}

export default function MessageList({ currentUserId }: MessageListProps) {
  const { 
    messages, 
    loadingMessages, 
    loadMoreMessages, 
    hasMoreMessages,
    typingUsers,
    activeConversation
  } = useMessaging();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Only auto-scroll if the user was already at the bottom or if it's a new message
    if (messages.length > 0 && messages.length !== prevMessagesLengthRef.current) {
      // Check if it's a new message at the end (sent or received)
      const isNewMessage = messages.length > prevMessagesLengthRef.current;
      
      // Get scroll position
      const container = messageListRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        // Scroll to bottom if user was already there or if it's a new message
        if (isAtBottom || isNewMessage) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages]);
  
  // Handle load more messages when scrolling to top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    
    // When user scrolls near the top, load more messages
    if (scrollTop < 50 && hasMoreMessages && !loadingMessages) {
      loadMoreMessages();
    }
  };
  
  // Get sender info from participant data
  const getSenderInfo = (senderId: string) => {
    if (!activeConversation) return undefined;
    
    const participant = activeConversation.participants.find(p => p.userId === senderId);
    if (!participant) return undefined;
    
    return {
      profilePicture: participant.profilePicture,
      firstName: participant.firstName,
      lastName: participant.lastName
    };
  };
  
  // Prepare messages for rendering
  const prepareMessages = () => {
    if (!messages.length) return [];
    
    // Structure pour stocker les messages groupés par date
    const messagesWithDates: {
      type: 'message' | 'date';
      message?: Message;
      date?: string;
      isCurrentUser?: boolean;
      showAvatar?: boolean;
      senderInfo?: {
        profilePicture?: string;
        firstName?: string;
        lastName?: string;
      };
      id: string;
    }[] = [];
    
    let prevSenderId: string | null = null;
    let prevMessageDate: string | null = null;
    
    console.log("Messages avant tri:", messages)
      
    // Tri chronologique des messages (du plus ancien au plus récent)
    const sortedMessages = [...messages].sort((a, b) => {
      // Si l'un des messages n'a pas de date, mettre les temporaires à la fin
      if (!a.created_at && b.created_at) return 1;
      if (a.created_at && !b.created_at) return -1;
      
      // Cas des messages temporaires (ajoutés par l'utilisateur)
      if (a.id.startsWith('temp-') && !b.id.startsWith('temp-')) return 1;
      if (!a.id.startsWith('temp-') && b.id.startsWith('temp-')) return -1;
      
      // Si les deux sont des messages temporaires, les trier par ID temp (qui contient un timestamp)
      if (a.id.startsWith('temp-') && b.id.startsWith('temp-')) {
        const aTimestamp = parseInt(a.id.split('-')[1]) || 0;
        const bTimestamp = parseInt(b.id.split('-')[1]) || 0;
        return aTimestamp - bTimestamp;
      }
      
      // Enfin, tri normal par date de création
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateA - dateB;
    });
    
    console.log("Messages triés:", sortedMessages.map(m => ({
      id: m.id,
      createdAt: m.createdAt,
      content: m.content?.substring(0, 15) + '...',
      isTemp: m.id.startsWith('temp-')
    })));
    
    sortedMessages.forEach((message) => {
      // Identifier les messages temporaires et de l'utilisateur courant
      const isTemp = message.id.startsWith('temp-');
      const isCurrentUser = message.senderId === currentUserId || isTemp;
      
      // Déterminer s'il faut afficher l'avatar
      const showAvatar = message.senderId !== prevSenderId;
      
      // Vérifier s'il s'agit d'un nouveau jour
      const messageDate = message.createdAt ? format(new Date(message.createdAt), 'yyyy-MM-dd') : '';
      const isNewDay = messageDate !== prevMessageDate && message.createdAt;
      
      // Ajouter un séparateur de date si nécessaire
      if (isNewDay && message.createdAt) {
        messagesWithDates.push({
          type: 'date',
          date: format(new Date(message.createdAt), 'EEEE d MMMM', { locale: fr }),
          id: `date-${message.id}`
        });
        prevMessageDate = messageDate;
      }
      
      // Ajouter le message
      messagesWithDates.push({
        type: 'message',
        message,
        isCurrentUser,
        showAvatar,
        senderInfo: getSenderInfo(message.senderId),
        id: message.id
      });
      
      prevSenderId = message.senderId;
    });
    
    return messagesWithDates;
  };
  
  // Rendu de tous les éléments (messages et séparateurs de date)
  const renderMessageItems = () => {
    const items = prepareMessages();
    
    return items.map((item) => {
      if (item.type === 'date') {
        return (
          <div key={item.id} className="flex justify-center my-4">
            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
              {item.date}
            </div>
          </div>
        );
      } else if (item.message) {
        return (
          <MessageItem
            key={item.id}
            message={item.message}
            isCurrentUser={item.isCurrentUser || false}
            showAvatar={item.showAvatar || false}
            senderInfo={item.senderInfo}
          />
        );
      }
      return null;
    });
  };
  
  // Render typing indicators
  const renderTypingIndicators = () => {
    if (!typingUsers.length || !activeConversation) return null;
    
    // Get participant names
    const typingNames = typingUsers.map(userId => {
      const participant = activeConversation.participants.find(p => p.userId === userId);
      return participant?.firstName || participant?.username || 'Someone';
    });
    
    // Display appropriate message based on how many users are typing
    let typingText = '';
    if (typingNames.length === 1) {
      typingText = `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      typingText = `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      typingText = 'Several people are typing...';
    }
    
    return (
      <div className="flex items-center text-gray-500 text-sm p-2 animate-pulse">
        <div className="flex space-x-1 mr-2">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>{typingText}</span>
      </div>
    );
  };
  
  // Le composant de la liste de messages
  return (
    <div className="flex flex-col h-full">
      {/* Zone de chargement et messages */}
      <div 
        ref={messageListRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        onScroll={handleScroll}
      >
        {/* Indicateur de chargement en haut pour charger plus de messages */}
        {loadingMessages && hasMoreMessages && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Message d'état si aucun message */}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>Aucun message dans cette conversation</p>
            <p className="text-sm">Commencez à écrire pour envoyer votre premier message</p>
          </div>
        )}
        
        {/* Liste des messages dans un div avec flexbox inversé pour avoir les plus récents en bas */}
        <div className="flex flex-col">
          {renderMessageItems()}
          {renderTypingIndicators()}
          <div ref={messagesEndRef} /> {/* Élément de référence pour le défilement automatique */}
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Conversation, Message, MessageType } from '../types/messaging';
import { 
  useConversations, 
  useMessages, 
  useSendMessage, 
  useUpdateMessage,
  useMarkAsRead,
  useTypingIndicator,
  useWebSocketConnection,
  useCreateConversation
} from '../services/messaging-service';

interface MessagingContextType {
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loadingConversations: boolean;
  // Messages
  messages: Message[];
  loadingMessages: boolean;
  loadMoreMessages: () => void;
  hasMoreMessages: boolean;
  // Actions
  sendMessage: (content: string, messageType?: MessageType) => Promise<Message>;
  updateMessage: (messageId: string, content: string) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  // Typing
  setTyping: (isTyping: boolean) => void;
  typingUsers: string[];
  // State
  setActiveConversationId: (id: string | null) => void;
  refreshConversations: () => void;
  isConnected: boolean;
  createConversation: (data: { 
    participantIds: string[]; 
    title?: string; 
    isGroup: boolean 
  }) => Promise<Conversation>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { conversations, isLoading: loadingConversations, refreshConversations } = useConversations();
  const { messages, isLoading: loadingMessages, loadMore, isReachingEnd } = useMessages(activeConversationId || '');
  const { sendMessage: apiSendMessage, isLoading: sendingMessage } = useSendMessage(activeConversationId || '');
  const { updateMessage: apiUpdateMessage } = useUpdateMessage(activeConversationId || '');
  const { markAsRead } = useMarkAsRead(activeConversationId || '');
  const { sendTypingIndicator } = useTypingIndicator(activeConversationId || '');
  const { isConnected, typingUsers, sendWSMessage } = useWebSocketConnection(activeConversationId || '');
  const { createConversation: apiCreateConversation } = useCreateConversation();

  // Find active conversation by ID
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find(conv => conv.id === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  // Extract conversation ID from URL if it's a conversation page
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname) {
      // Format attendu : /messages/[conversationId]
      const match = pathname.match(/\/messages\/([^\/]+)/);
      const conversationId = match ? match[1] : null;
      
      if (conversationId) {
        setActiveConversationId(conversationId);
      }
    }
  }, [pathname]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      markAsRead();
    }
  }, [activeConversationId, markAsRead]);

  // Send a message
  const sendMessage = useCallback(async (
    content: string, 
    messageType: MessageType = MessageType.TEXT
  ): Promise<Message> => {
    if (!activeConversationId) {
      throw new Error('Aucune conversation active pour envoyer le message');
    }
    
    try {
      const message = await apiSendMessage({ 
        content, 
        messageType 
      });
      
      if (!message) {
        throw new Error('Échec de l\'envoi du message - réponse vide');
      }
      
      return message as Message; // Retourne le message typé
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error; // Re-lance l'erreur pour permettre au composant de la gérer
    }
  }, [activeConversationId, apiSendMessage]);

  // Update a message
  const updateMessage = useCallback(async (
    messageId: string, 
    content: string
  ): Promise<Message> => {
    if (!activeConversationId) {
      throw new Error('Aucune conversation active pour mettre à jour le message');
    }
    
    try {
      const updatedMessage = await apiUpdateMessage(messageId, { content });
      
      if (!updatedMessage) {
        throw new Error('Échec de la mise à jour du message - réponse vide');
      }
      
      return updatedMessage as Message; // Retourne le message mis à jour typé
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      throw error; // Re-lance l'erreur pour permettre au composant de la gérer
    }
  }, [activeConversationId, apiUpdateMessage]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!activeConversationId) return;
    
    try {
      await apiUpdateMessage(messageId, { isDeleted: true });
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  }, [activeConversationId, apiUpdateMessage]);

  // Handle typing indicators
  const setTyping = useCallback((isTyping: boolean) => {
    if (!activeConversationId) return;
    
    try {
      sendTypingIndicator(isTyping);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'indicateur de frappe:', error);
    }
  }, [activeConversationId, sendTypingIndicator]);

  // Create a new conversation
  const createConversation = useCallback(async (data: { 
    participantIds: string[]; 
    title?: string; 
    isGroup: boolean 
  }): Promise<Conversation> => {
    try {
      return await apiCreateConversation(data);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }, [apiCreateConversation]);

  const value = {
    // Conversations
    conversations,
    activeConversation,
    loadingConversations,
    // Messages
    messages,
    loadingMessages,
    loadMoreMessages: loadMore,
    hasMoreMessages: !isReachingEnd,
    // Actions
    sendMessage,
    updateMessage,
    deleteMessage,
    markAsRead,
    // Typing
    setTyping,
    typingUsers,
    // State
    setActiveConversationId,
    refreshConversations,
    isConnected,
    createConversation
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used inside a MessagingProvider');
  }
  return context;
}

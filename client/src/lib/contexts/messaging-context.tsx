"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Conversation, 
  Message, 
  MessageType,
  MessageStatusType,
  WebSocketMessageType
} from '../types/messaging';
import { WebSocketClient } from '../utils/websocket-client';
import * as messagingAPI from '../api/messaging-service';
import { useAuth } from './auth-context';

// Messaging context type
interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  typingUsers: string[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  setActiveConversationId: (id: string | null) => void;
  loadMoreMessages: ({limit, before}?: {limit?: number, before?: string}) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  markAsRead: (conversationId?: string) => Promise<void>;
  refreshConversations: () => void;
  isConnected: boolean;
  createConversation: (data: { participantIds: string[]; title?: string; isGroup: boolean }) => Promise<Conversation>;
  websocketStatus: string;
  error: string | null;
  updateVisibleMessagesStatus: () => void;
}

// Create the context
const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Provider of messaging
function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]); // Confirmation que l'état conversations est bien initialisé comme un tableau vide
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Reference for WebSocket connection
  const wsClientRef = useRef<WebSocketClient | null>(null);
  
  // Reference for last received message
  const lastReceivedMessageRef = useRef<{ id: string; conversationId: string; timestamp: number } | null>(null);
  
  // Get authentication context
  const auth = useAuth();
  const { user, isAuthenticated } = auth;
  
  // Function to sort messages (defined before usage)
  const sortMessages = useCallback((messages: Message[]): Message[] => {
    return [...messages].sort((a, b) => {
      // If one of the messages doesn't have a date, put it at the end
      if (!a.created_at && b.created_at) return 1;
      if (a.created_at && !b.created_at) return -1;
      
      // Handle temp messages (added by the user)
      if (a.id.startsWith('temp-') && !b.id.startsWith('temp-')) return 1;
      if (!a.id.startsWith('temp-') && b.id.startsWith('temp-')) return -1;
      
      // If both are temp messages, sort by the temp ID (which contains a timestamp)
      if (a.id.startsWith('temp-') && b.id.startsWith('temp-')) {
        const aTimestamp = parseInt(a.id.split('-')[1]) || 0;
        const bTimestamp = parseInt(b.id.split('-')[1]) || 0;
        return aTimestamp - bTimestamp;
      }
      
      // Otherwise, sort by created_at date
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, []);
  
  // Find active conversation
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    // Check that conversations is an array before using find
    if (!Array.isArray(conversations)) {
      console.warn('Conversations is not an array:', conversations);
      return null;
    }
    return conversations.find(conv => conv.id === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  // Get conversation ID from URL
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    
    const match = pathname.match(/\/messages\/([^/]+)/);
    if (match && match[1]) {
      setActiveConversationId(match[1]);
    } else {
      setActiveConversationId(null);
    }
  }, [pathname]);

  // Method to load conversations
  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingConversations(true);
      const data = await messagingAPI.getConversations();
      console.log('Received conversations data:', data);
      
      // Check that data is an array
      if (data) {
        if (Array.isArray(data?.conversations)) {
          setConversations(data?.conversations);
        } else {
          console.error('API returned non-array conversations data:', data?.conversations);
          // Initialize with an empty array in case of error
          setConversations([]);
        }
      } else {
        // Initialize with an empty array if no data
        setConversations([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      // Initialize with an empty array in case of error
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  // Load conversations on startup and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshConversations();
    }
  }, [isAuthenticated, refreshConversations]);

  // Method to load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingMessages(true);
      const data = await messagingAPI.getMessages(conversationId);
      if (data) {
        // Sort messages by date
        const sortedMessages = sortMessages(data);
        setMessages(sortedMessages);
        setHasMoreMessages(data.length >= 20); // Assume more messages if maximum received
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [isAuthenticated, sortMessages]);

  // Load messages when the active conversation changes
  useEffect(() => {
    if (activeConversationId && activeConversationId !== 'new') {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // Method to mark a conversation as read
  const markAsRead = useCallback(async (conversationId?: string): Promise<void> => {
    // If no ID is provided, use the active conversation ID
    const targetId = conversationId || activeConversationId;
    if (!targetId) return;
    
    try {
      console.log(`Marking conversation ${targetId} as read`);
      const success = await messagingAPI.markConversationAsRead(targetId);
      
      if (success) {
        // Update conversations to reset unread count
        setConversations(prev => prev.map(conv => 
          conv.id === targetId
            ? { ...conv, unread_count: 0 } 
            : conv
        ));
        console.log(`Conversation ${targetId} marked as read successfully`);
        
        // Additionally, update the status of visible messages to "read"
        // This handles the UI display of message status
        updateVisibleMessagesStatus();
      } else {
        console.warn(`Failed to mark conversation ${targetId} as read`);
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [activeConversationId]);

  // Method to update the status of visible messages to "read"
  const updateVisibleMessagesStatus = useCallback(() => {
    if (!activeConversationId || !user?.id) return;
    
    // Get all messages that are not from the current user and are not already "read"
    const messagesToUpdate = messages.filter(msg => 
      msg.sender_id !== user.id && 
      msg.status !== MessageStatusType.READ
    );
    
    if (messagesToUpdate.length === 0) {
      console.log('No messages need status update to "read"');
      return;
    }
    
    console.log(`Updating status of ${messagesToUpdate.length} messages to "read"`);
    
    // Update each message status both on the server and in the local state
    messagesToUpdate.forEach(async (msg) => {
      try {
        // Update on the server
        await messagingAPI.updateMessageStatus(msg.id, MessageStatusType.READ);
        
        // Update in the local state
        setMessages(prev => prev.map(m => 
          m.id === msg.id 
            ? { ...m, status: MessageStatusType.READ } 
            : m
        ));
        
        console.log(`Message ${msg.id} status updated to "read"`);
      } catch (error) {
        console.error(`Error updating message ${msg.id} status:`, error);
      }
    });
  }, [activeConversationId, messages, user?.id]);

  // WebSocket connection handler
  const connectToWebSocket = useCallback(async (conversationId: string) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('auth_token') || 'mock-token'; 
      console.log('Using auth token for WebSocket:', token.substring(0, 10) + '...');
      
      // Close any existing WebSocket connection
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
      
      // Create a new WebSocket connection
      const wsClient = new WebSocketClient(conversationId, token, {
        debug: true, // Activate logs for development
        onOpen: () => {
          setWebsocketStatus('connected');
          setIsConnected(true);
          console.log(`WebSocket connected to conversation ${conversationId}`);
        },
        onMessage: (data) => {
          // Handle incoming messages based on their type
          if (data.type === WebSocketMessageType.MESSAGE) {
            // Extract message data
            const messageData = data.data as Record<string, unknown>;
            const messageId = messageData.id as string;
            const messageConversationId = messageData.conversation_id as string;
            const messageSenderId = messageData.sender_id as string;
            
            // Check if the message is from us
            const isSelfMessage = messageSenderId === user?.id;
            
            console.log(`New message received - ID: ${messageId}, ConversationID: ${messageConversationId}, SenderID: ${messageSenderId}, isSelf: ${isSelfMessage}, activeConvID: ${activeConversationId}`);
            
            // Add the message to the local conversation if it's the active conversation
            if (messageConversationId === activeConversationId) {
              console.log(`Message added to active conversation ${activeConversationId}`);
              setMessages(prev => {
                const exists = prev.some(m => m.id === messageId);
                if (exists) return prev;
                
                // If it's our own message, it should have the DELIVERED status
                if (isSelfMessage) {
                  return [...prev, {...messageData, status: MessageStatusType.DELIVERED} as unknown as Message];
                } else {
                  return [...prev, messageData as unknown as Message];
                }
              });
            }
            
            // Update the list of conversations with the new message
            setConversations(prev => {
              return prev.map(conv => {
                if (conv.id === messageConversationId) {
                  const isActive = messageConversationId === activeConversationId;
                  // If it's a message from someone else and the conversation is not active,
                  // increment the unread_count
                  const newUnreadCount = (!isSelfMessage && !isActive) 
                    ? (conv.unread_count || 0) + 1
                    : conv.unread_count || 0;
                  
                  console.log(`Updating conversation ${conv.id}: unread_count = ${newUnreadCount} (was ${conv.unread_count || 0}), isActive=${isActive}, isSelf=${isSelfMessage}`);
                  
                  return {
                    ...conv,
                    unread_count: newUnreadCount,
                    last_message: messageData as unknown as Message,
                    last_message_at: new Date().toISOString()
                  };
                }
                return conv;
              });
            });
            
            // Store the last received message to be processed by the effect that handles marking as read
            if (!isSelfMessage && messageConversationId === activeConversationId) {
              // Use a reference object to avoid capture-by-value issues
              lastReceivedMessageRef.current = {
                id: messageId,
                conversationId: messageConversationId,
                timestamp: Date.now()
              };
            }
          } else if (data.type === WebSocketMessageType.TYPING) {
            // Update typing indicators
            setTypingUsers(prev => {
              const typingData = data.data as Record<string, unknown>;
              const userId = typingData.user_id as string;
              const isTyping = typingData.is_typing as boolean;
              
              if (isTyping && !prev.includes(userId)) {
                return [...prev, userId];
              } else if (!isTyping && prev.includes(userId)) {
                return prev.filter(id => id !== userId);
              }
              return prev;
            });
          } else if (data.type === WebSocketMessageType.READ_RECEIPT) {
            // Update message status
            setMessages(prev => {
              const receiptData = data.data as Record<string, unknown>;
              const messageId = receiptData.message_id as string;
              return prev.map(msg => {
                if (msg.id === messageId) {
                  return {
                    ...msg,
                    status: MessageStatusType.READ
                  };
                }
                return msg;
              });
            });
          }
        },
        onClose: () => {
          setWebsocketStatus('disconnected');
          setIsConnected(false);
          console.log(`WebSocket disconnected from conversation ${conversationId}`);
        },
        onError: (event) => {
          setWebsocketStatus('error');
          setIsConnected(false);
          console.error('WebSocket error:', event);
          setError('Erreur de connexion WebSocket');
        },
        onReconnect: (attempt) => {
          setWebsocketStatus('connecting');
          console.log(`Tentative de reconnexion WebSocket #${attempt}`);
        }
      });
      
      // Store the WebSocket client reference
      wsClientRef.current = wsClient;
      
      // Establish the connection
      await wsClient.connect();
      
      return wsClient;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setError(`Unable to connect to WebSocket: ${error instanceof Error ? error.message : String(error)}`);
      setWebsocketStatus('error');
    }
  }, [isAuthenticated, user, activeConversationId]);

  // Establish WebSocket connection when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      connectToWebSocket(activeConversationId);
    }
  }, [activeConversationId, connectToWebSocket]);

  // Method to send a message
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!activeConversationId) {
      throw new Error('No active conversation to send message to');
    }
    
    try {
      // Generate a temporary ID for the message
      const tempId = `temp-${Date.now()}`;
      
      // Create a local message object that matches the Message interface
      const newMessage: Message = {
        id: tempId,
        conversation_id: activeConversationId,
        sender_id: user?.id || '',
        message_type: MessageType.TEXT,
        content,
        is_encrypted: false,
        is_edited: false,
        is_deleted: false,
        is_forwarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: MessageStatusType.SENT
      };
      
      // Add to local state - preserving chronological order
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        return sortMessages(updatedMessages);
      });
      
      // Send via REST API
      const sentMessage = await messagingAPI.sendMessage(activeConversationId, content);
      
      // Update local ID with server ID and status
      setMessages(prev => prev.map(msg => 
        msg.id === tempId
          ? { ...sentMessage, status: MessageStatusType.SENT }
          : msg
      ));
      
      // Explicitly update message status on the server
      await messagingAPI.updateMessageStatus(sentMessage.id, MessageStatusType.SENT);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add an error message
      const errorMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversationId,
        sender_id: user?.id || '',
        message_type: MessageType.TEXT,
        content,
        is_encrypted: false,
        is_edited: false,
        is_deleted: false,
        is_forwarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: MessageStatusType.FAILED
      };
      
      // Add to local state - preserving chronological order
      setMessages(prev => {
        const updatedMessages = [...prev, errorMessage];
        return sortMessages(updatedMessages);
      });
    }
  }, [activeConversationId, user, sortMessages]);

  // Load more messages (for infinite scrolling)
  const loadMoreMessages = useCallback(async ({limit = 20, before}: {limit?: number, before?: string} = {}) => {
    if (!activeConversationId || !hasMoreMessages || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      
      // Find the oldest message for pagination
      const oldestMessage = messages.reduce((oldest, current) => {
        if (!oldest.created_at) return current;
        if (!current.created_at) return oldest;
        return new Date(oldest.created_at) < new Date(current.created_at) ? oldest : current;
      }, messages[0]);
      
      const oldestId = before || oldestMessage?.id;
      if (!oldestId) {
        setHasMoreMessages(false);
        return;
      }
      
      const olderMessages = await messagingAPI.getMessages(activeConversationId, {
        limit,
        before: oldestId
      });
      
      if (!olderMessages || olderMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        // Sort messages by date
        const sortedMessages = sortMessages([...messages, ...olderMessages]);
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeConversationId, messages, hasMoreMessages, isLoadingMore, sortMessages]);

  // Method to create a new conversation
  const createConversation = useCallback(async (data: { participantIds: string[]; title?: string; isGroup: boolean }): Promise<Conversation> => {
    try {
      const newConversation = await messagingAPI.createConversation(data);
      // Add the new conversation to the state
      setConversations(prev => [newConversation, ...prev]);
      
      // Set as active conversation
      setActiveConversationId(newConversation.id);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, []);

  // Method to send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean): void => {
    if (!activeConversationId || !wsClientRef.current) return;
    
    wsClientRef.current.sendTypingIndicator(isTyping);
  }, [activeConversationId]);

  // Context value
  const contextValue: MessagingContextType = {
    conversations,
    messages,
    activeConversationId,
    activeConversation,
    typingUsers,
    loadingConversations,
    loadingMessages,
    hasMoreMessages,
    setActiveConversationId,
    loadMoreMessages,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    refreshConversations,
    isConnected,
    createConversation,
    websocketStatus,
    error,
    updateVisibleMessagesStatus,
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
};

// Hook to use the messaging context
const useMessaging = (): MessagingContextType => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used inside a MessagingProvider');
  }
  return context;
};

// Export the provider and hook
export { MessagingProvider, useMessaging };
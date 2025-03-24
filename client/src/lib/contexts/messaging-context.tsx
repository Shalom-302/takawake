"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Conversation, 
  Message, 
  MessageType,
  MessageStatusType,
  WebSocketMessageType,
  WebSocketConnectionStatus
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
  typingUsers: {[conversationId: string]: {userId: string, username: string, timestamp: number}[]};
  userStatuses: {[userId: string]: {status: string, lastSeen: string}};
  loadingConversations: boolean;
  loadingMessages: boolean;
  hasMoreMessages: boolean;
  setActiveConversationId: (id: string | null) => void;
  loadMoreMessages: ({limit, before}?: {limit?: number, before?: string}) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendTypingIndicator: (conversationId: string) => void;
  markAsRead: (conversationId?: string) => Promise<void>;
  refreshConversations: () => void;
  isConnected: boolean;
  createConversation: (data: { participantIds: string[]; title?: string; isGroup: boolean }) => Promise<Conversation>;
  websocketStatus: WebSocketConnectionStatus;
  error: string | null;
  updateVisibleMessagesStatus: () => void;
  sendStatusUpdate: (status: 'online' | 'offline' | 'away') => void;
}

// Create the context
const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Provider of messaging
function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]); 
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{[conversationId: string]: {userId: string, username: string, timestamp: number}[]}>({});
  const typingTimeoutRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  const [isConnected, setIsConnected] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState<WebSocketConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userStatuses, setUserStatuses] = useState<{[userId: string]: {status: string, lastSeen: string}}>({});
  
  // Reference for WebSocket connection
  const wsClientRef = useRef<WebSocketClient | null>(null);
  
  // Reference for last received message
  const lastReceivedMessageRef = useRef<{ id: string; conversationId: string; timestamp: number } | null>(null);
  
  // Reference for temporary user ID received from WebSocket server
  const tempUserIdRef = useRef<string | null>(null);
  
  // Reference for global view of messages
  const globalViewRef = useRef<HTMLDivElement | null>(null);
  
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
      
      // Vérifier la structure des données
      if (data) {
        if (Array.isArray(data)) {
          // Si data est déjà un tableau de conversations
          setConversations(data);
        } else if (data && typeof data === 'object' && 'conversations' in data && Array.isArray(data.conversations)) {
          // Si data est un objet avec une propriété conversations qui est un tableau
          setConversations(data.conversations);
        } else {
          console.error('API returned invalid format for conversations:', data);
          setConversations([]);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated, setConversations]);

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
  }, [isAuthenticated, sortMessages, setMessages]);

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
    if (!activeConversationId || !isAuthenticated) return;
    
    // Get all messages that are not from the current user and are not already "read"
    const unreadMessageIds = messages
      .filter(msg => !msg.is_read && msg.sender_id !== user?.id)
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      // Mark messages as read via API
      fetch(`/api/conversations/${activeConversationId}/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message_ids: unreadMessageIds }),
      })
      .then(() => {
        // Mise à jour locale des messages
        setMessages(prev => 
          prev.map(msg => 
            unreadMessageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
          )
        );
        
        // Send read receipts via WebSocket for each message
        if (wsClientRef.current && wsClientRef.current.isConnected && wsClientRef.current.isConnected()) {
          // For each unread message, send a read receipt
          unreadMessageIds.forEach(messageId => {
            // Find the message to get the sender ID
            const message = messages.find(msg => msg.id === messageId);
            if (message) {
              console.log(`Sending read receipt for message ${messageId} to sender ${message.sender_id}`);
              wsClientRef.current?.sendMessage({
                type: WebSocketMessageType.READ_RECEIPT,
                data: {
                  message_id: messageId,
                  conversation_id: activeConversationId,
                  reader_id: user?.id,
                  reader_name: user?.username || "User",
                  timestamp: new Date().toISOString()
                }
              });
            }
          });
        }
      })
      .catch(err => console.error('Error marking messages as read:', err));
    }
  }, [activeConversationId, isAuthenticated, messages, user?.id, user?.username]);

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
          console.log(`⭐ onMessage called - data: ${JSON.stringify(data)}`);
          console.log(`Message type: '${data.type}', expected type: '${WebSocketMessageType.MESSAGE}'`);

          // Debug - log all data properties
          console.log('WebSocketMessage data keys:', Object.keys(data));
          console.log('WebSocketMessage data.data:', data.data);

          // Handle incoming messages based on their type
          // Support both enum and string comparison for message type
          if (data.type === WebSocketMessageType.CONNECTION_ESTABLISHED) {
            console.log('WebSocket connection established', data);
            // Stocker l'ID temporaire reçu du serveur
            if (data.data && typeof data.data.user_id === 'string') {
              tempUserIdRef.current = data.data.user_id;
              console.log(`Stored temporary user ID from WebSocket: ${tempUserIdRef.current}`);
            }
            return;
          }

          // Check if the message is of type message (using enum only)
          if (data.type === WebSocketMessageType.MESSAGE) {
            console.log('Message type detected correctly');
            // Extract message data - improve robustness with fallbacks
            const messageData = data.data as Record<string, unknown>;
            
            // Check message data integrity
            if (!messageData) {
              console.error('Message data is undefined or invalid');
              return;
            }
            
            // Add detailed logging for debugging
            console.log('Full message data received:', messageData);
            
            const messageId = messageData.id as string || messageData.message_id as string;
            const messageConversationId = messageData.conversation_id as string;
            const messageSenderId = messageData.sender_id as string || messageData.user_id as string;
            
            if (!messageId || !messageConversationId || !messageSenderId) {
              console.error('Message missing required fields:', { messageId, messageConversationId, messageSenderId });
              return;
            }
            
            // Check if the message is from us
            const isSelfMessage = 
              messageSenderId === user?.id || 
              (tempUserIdRef.current && messageSenderId === tempUserIdRef.current);
            
            console.log(`New message received - ID: ${messageId}, ConversationID: ${messageConversationId}, SenderID: ${messageSenderId}, isSelf: ${isSelfMessage}, activeConvID: ${activeConversationId}, tempUserId: ${tempUserIdRef.current}`);
            
            // If the message comes from us via WebSocket, ignore completely
            // because we've already processed it via the REST API response
            if (isSelfMessage) {
              console.log(`Ignoring WebSocket message from self (sender_id: ${messageSenderId})`);
              return;
            }
            
            // Add the message to the local conversation if it's the active conversation
            if (messageConversationId === activeConversationId) {
              console.log(`Message added to active conversation ${activeConversationId}`);
              setMessages(prev => {
                const exists = prev.some(m => m.id === messageId);
                if (exists) {
                  console.log(`Message ${messageId} already exists in the conversation, skipping`);
                  return prev;
                }
                
                console.log(`Adding new message ${messageId} to conversation ${messageConversationId}`);
                
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
            const typingData = data.data;
            const typingUserId = typingData.user_id as string;
            const typingUsername = typingData.username as string;
            const typingConversationId = typingData.conversation_id as string;
            
            // Don't show our own typing indicator
            if (typingUserId === user?.id || typingUserId === tempUserIdRef.current) {
              return;
            }
            
            console.log(`Typing indicator received from ${typingUsername} in conversation ${typingConversationId}`);
            
            // Update typing users state
            setTypingUsers(prev => {
              const conversationTypers = prev[typingConversationId] || [];
              
              // Check if user is already in typing list
              const existingIndex = conversationTypers.findIndex(u => u.userId === typingUserId);
              
              // Clear any existing timeout for this user
              if (typingTimeoutRef.current[`${typingConversationId}-${typingUserId}`]) {
                clearTimeout(typingTimeoutRef.current[`${typingConversationId}-${typingUserId}`]);
              }
              
              // Set timeout to remove typing indicator after 3 seconds
              typingTimeoutRef.current[`${typingConversationId}-${typingUserId}`] = setTimeout(() => {
                removeTypingUser(typingConversationId, typingUserId);
              }, 3000);
              
              // Create new typing users array
              let updatedTypers;
              
              if (existingIndex !== -1) {
                // Update existing entry
                updatedTypers = [...conversationTypers];
                updatedTypers[existingIndex] = {
                  userId: typingUserId,
                  username: typingUsername,
                  timestamp: Date.now()
                };
              } else {
                // Add new entry
                updatedTypers = [
                  ...conversationTypers,
                  {
                    userId: typingUserId,
                    username: typingUsername,
                    timestamp: Date.now()
                  }
                ];
              }
              
              return {
                ...prev,
                [typingConversationId]: updatedTypers
              };
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
          } else if (data.type === WebSocketMessageType.USER_PRESENCE) {
            // Handle user presence updates
            const statusData = data.data;
            const userId = statusData.user_id as string;
            const status = statusData.status as string;
            const timestamp = new Date().toISOString();
            
            console.log(`User status update received: ${userId} is now ${status}`);
            
            // Do not process our own status updates
            if (userId === user?.id || userId === tempUserIdRef.current) {
              return;
            }
            
            // Update user statuses
            setUserStatuses(prev => ({
              ...prev,
              [userId]: {
                status,
                lastSeen: timestamp
              }
            }));
            
            // If the user is in an active conversation, update their status
            setConversations(prev => 
              prev.map(conv => {
                // Check if the user is a participant of this conversation
                const isParticipant = conv.participants.some(p => p.user_id === userId);
                
                if (isParticipant) {
                  // Update the participant with the new status
                  return {
                    ...conv,
                    participants: conv.participants.map(p => 
                      p.user_id === userId 
                        ? { ...p, is_active: status === 'online' } 
                        : p
                    )
                  };
                }
                
                return conv;
              })
            );
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
          setError('WebSocket connection error');
        },
        onReconnect: (attempt) => {
          setWebsocketStatus('connecting');
          console.log(`WebSocket reconnection attempt #${attempt}`);
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
    if (activeConversationId && isAuthenticated) {
      connectToWebSocket(activeConversationId);
      
      // Send an "online" status update when the conversation is active
      if (wsClientRef.current && wsClientRef.current.isConnected()) {
        wsClientRef.current.sendStatusUpdate('online');
      }
    }
    
    return () => {
      // Send an "offline" status update when the user leaves
      if (wsClientRef.current && wsClientRef.current.isConnected()) {
        wsClientRef.current.sendStatusUpdate('offline');
      }
    };
  }, [activeConversationId, isAuthenticated, connectToWebSocket]);

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
  }, [setConversations, setActiveConversationId]);

  // Method to send typing indicator
  const sendTypingIndicator = useCallback((conversationId: string) => {
    if (!isConnected || !wsClientRef.current || !conversationId) return;
    
    wsClientRef.current.sendMessage({
      type: WebSocketMessageType.TYPING,
      data: {
        conversation_id: conversationId,
        user_id: user?.id || tempUserIdRef.current || 'unknown',
        username: user?.username || 'Utilisateur',
        timestamp: new Date().getTime()
      }
    });
    
    console.log(`Sent typing indicator for conversation ${conversationId}`);
  }, [isConnected, user, wsClientRef]);

  // Function to handle typing indicator expiration
  const removeTypingUser = useCallback((conversationId: string, userId: string) => {
    setTypingUsers(prev => {
      if (!prev[conversationId]) return prev;
      
      const updated = {
        ...prev,
        [conversationId]: prev[conversationId].filter(u => u.userId !== userId)
      };
      
      return updated;
    });
  }, [setTypingUsers]);

  // Function to send a status update
  const sendStatusUpdate = useCallback((status: 'online' | 'offline' | 'away') => {
    if (!isConnected || !wsClientRef.current) return;
    
    wsClientRef.current.sendStatusUpdate(status);
    console.log(`Sent status update: ${status}`);
  }, [isConnected, wsClientRef]);

  // Auto mark messages as read when conversation is viewed
  useEffect(() => {
    if (activeConversationId) {
      // Update visible messages status
      updateVisibleMessagesStatus();
    }
  }, [activeConversationId, updateVisibleMessagesStatus]);

  // Handle message notifications and updates
  useEffect(() => {
    if (!globalViewRef.current) return;
    
    // Stocker la référence actuelle dans une variable locale
    const currentViewRef = globalViewRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateVisibleMessagesStatus();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(currentViewRef);
    
    return () => {
      // Utiliser la référence stockée dans la variable locale
      observer.unobserve(currentViewRef);
    };
  }, [messages, updateVisibleMessagesStatus]);

  // Function to handle typing timeout
  useEffect(() => {
    const typingTimeouts: { [key: string]: NodeJS.Timeout } = {};
    
    // For each conversation with typing users, set a timeout to remove them
    Object.entries(typingUsers).forEach(([conversationId, users]) => {
      users.forEach((user) => {
        const timeoutKey = `${conversationId}-${user.userId}`;
        
        // Clear existing timeout if present
        if (typingTimeouts[timeoutKey]) {
          clearTimeout(typingTimeouts[timeoutKey]);
        }
        
        // Set new timeout - remove typing indicator after 5 seconds of inactivity
        typingTimeouts[timeoutKey] = setTimeout(() => {
          removeTypingUser(conversationId, user.userId);
        }, 5000);
      });
    });
    
    // Cleanup timeouts
    return () => {
      Object.values(typingTimeouts).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, [typingUsers, removeTypingUser]);

  // Mark conversation as read when viewing it
  useEffect(() => {
    if (!activeConversationId || !isAuthenticated) return;
    
    try {
      // Call API to mark conversation as read
      fetch(`/api/conversations/${activeConversationId}/read`, {
        method: 'POST',
      });
      
      // Update messages status
      updateVisibleMessagesStatus();
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [activeConversationId, isAuthenticated, updateVisibleMessagesStatus]);

  // Context value
  const contextValue: MessagingContextType = {
    conversations,
    messages,
    activeConversationId,
    activeConversation,
    typingUsers,
    userStatuses,
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
    sendStatusUpdate
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
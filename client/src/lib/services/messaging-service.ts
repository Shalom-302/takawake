import useSWR, { mutate } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Conversation,
  Message,
  MessageCreate,
  MessageUpdate,
  WebSocketMessage,
  WebSocketMessageType,
  ConversationType,
  ChatUser,
  MessageStatusType,
  MessageType
} from '../types/messaging';
import * as API from '../api/messaging-service';

// Clés pour les requêtes SWR
const KEYS = {
  conversations: '/conversations',
  conversation: (id: string) => `/conversations/${id}`,
  messages: (id: string) => `/conversations/${id}/messages`
};

/**
 * Common fetcher for SWR requests
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetcher = async (url: string) => {
  try {
    const response = await API.fetchAPI(url);
    return response;
  } catch (error) {
    console.error('Fetcher error:', error);
    throw error;
  }
};

/**
 * Hook to fetch user conversations
 */
export function useConversations() {
  const { data, error, isLoading, mutate: refreshConversations } = useSWR<Conversation[]>(
    KEYS.conversations, 
    () => API.fetchAPI(KEYS.conversations),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 secondes
    }
  );

  return {
    conversations: data || [],
    isLoading,
    isError: error,
    refreshConversations
  };
}

/**
 * Hook to fetch a specific conversation
 */
export function useConversation(conversationId: string) {
  const { data, error, isLoading, mutate: refreshConversation } = useSWR<Conversation>(
    conversationId ? KEYS.conversation(conversationId) : null,
    () => API.fetchAPI(KEYS.conversation(conversationId)),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000, // 5 secondes
    }
  );

  return {
    conversation: data,
    isLoading,
    isError: error,
    refreshConversation
  };
}

/**
 * Hook to create a new conversation
 */
export const useCreateConversation = () => {
  const createConversation = async (data: {
    participantIds: string[];
    title?: string;
    isGroup: boolean;
  }): Promise<Conversation> => {
    try {
      // In a real app, this would be an API call
      // For demo, we're mocking a new conversation
      const newConversation: Conversation = {
        id: `new-conversation-${Date.now()}`,
        conversationType: data.isGroup ? ConversationType.GROUP : ConversationType.DIRECT,
        title: data.title || '',
        createdBy: 'current-user-id', // Normalement ça viendrait du contexte d'authentification
        isEncrypted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: data.participantIds.map(id => ({
          userId: id,
          username: `user-${id}`,
          firstName: '',
          lastName: '',
          joinedAt: new Date().toISOString(),
          role: 'member',
          isActive: true
        })),
        unreadCount: 0
      };
      
      // In a real app, trigger a revalidation of the conversations list
      // mutate('/conversations');
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  return { createConversation };
};

/**
 * Hook to load messages with infinite pagination
 */
export const useMessages = (conversationId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const initialLimit = 20;
  
  const getKey = useCallback((pageIndex: number, previousPageData: Message[] | null) => {
    // Si pas de conversationId, ne pas faire de requête
    if (!conversationId) return null;
    
    // Reached the end
    if (previousPageData && !previousPageData.length) return null;
    
    // First page, we don't have previousPageData
    if (pageIndex === 0) {
      return [`/conversations/${conversationId}/messages`, { limit: initialLimit }];
    }
    
    // Add the before cursor to get the next page
    const beforeId = previousPageData![previousPageData!.length - 1].id;
    return [`/conversations/${conversationId}/messages`, { limit: initialLimit, before: beforeId }];
  }, [conversationId, initialLimit]);

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate: mutateMessages
  } = useSWRInfinite<Message[]>(
    getKey,
    async ([url, params]: [string, { limit?: number, before?: string }]) => {
      // Dans un vrai app, nous ferions appel à l'API
      if (params.before) {
        const queryString = new URLSearchParams({
          limit: params.limit?.toString() || initialLimit.toString(),
          before: params.before
        }).toString();
        return API.fetchAPI<Message[]>(`${url}?${queryString}`);
      }
      
      const queryString = new URLSearchParams({
        limit: params.limit?.toString() || initialLimit.toString()
      }).toString();
      return API.fetchAPI<Message[]>(`${url}?${queryString}`);
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onSuccess: () => {
        // Masquer l'indicateur de chargement initial après le premier chargement réussi
        setLoadingInitial(false);
      }
    }
  );

  // Memoized messages array from all pages
  const messages = useMemo(() => {
    if (!data) return [];
    // Flatten the pages and sort by createdAt (newest messages at the end)
    return data.flat().sort((a, b) => {
      // Si les dates ne sont pas disponibles, utiliser l'ID comme fallback
      if (!a.createdAt || !b.createdAt) {
        return a.id.localeCompare(b.id);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [data]);
  
  // Check if we've reached the end of the messages
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < initialLimit);

  // WebSocket connection setup - dans un vrai app
  useEffect(() => {
    if (!conversationId) return;
    
    // Simuler une connexion websocket établie
    const connectWebSocket = () => {
      console.log(`Connecting to WebSocket for conversation: ${conversationId}`);
      setIsConnected(true);
    };
    
    // Simuler des tentatives de reconnexion en cas de déconnexion
    const setupReconnection = () => {
      const reconnectInterval = setInterval(() => {
        if (!isConnected) {
          console.log('Attempting to reconnect to WebSocket...');
          connectWebSocket();
        }
      }, 5000);
      
      return () => clearInterval(reconnectInterval);
    };
    
    // Simuler une déconnexion aléatoire pour tester la résilience
    const simulateRandomDisconnect = () => {
      const disconnectInterval = setInterval(() => {
        if (Math.random() > 0.95) {
          console.log('Simulating WebSocket disconnection');
          setIsConnected(false);
        }
      }, 30000);
      
      return () => clearInterval(disconnectInterval);
    };
    
    // Simuler des typeurs aléatoires
    const simulateTyping = () => {
      const typingInterval = setInterval(() => {
        const shouldShowTyping = Math.random() > 0.7;
        if (shouldShowTyping) {
          setTypingUsers(['user-123']);
          setTimeout(() => setTypingUsers([]), 3000);
        }
      }, 5000);
      
      return () => clearInterval(typingInterval);
    };
    
    // Établir la connexion initiale
    connectWebSocket();
    
    // Configurer les simulations
    const cleanupReconnection = setupReconnection();
    const cleanupDisconnect = simulateRandomDisconnect();
    const cleanupTyping = simulateTyping();
    
    return () => {
      cleanupReconnection();
      cleanupDisconnect();
      cleanupTyping();
      setIsConnected(false);
      setTypingUsers([]);
    };
  }, [conversationId, isConnected]);

  // Add a new message to the collection (e.g. from WebSocket)
  const addMessage = useCallback((newMessage: Message) => {
    if (!data) return;
    
    // Check if the message already exists
    const messageExists = messages.some(msg => msg.id === newMessage.id);
    if (messageExists) return;
    
    mutateMessages(prevData => {
      if (!prevData || prevData.length === 0) return [[newMessage]];
      
      // Add the message to the beginning of the first array
      const updatedFirstPage = [...prevData[0], newMessage];
      return [updatedFirstPage, ...prevData.slice(1)];
    }, false);
  }, [data, messages, mutateMessages]);
  
  // Update an existing message
  const updateMessage = useCallback((updatedMessage: Message) => {
    if (!data) return;
    
    mutateMessages(prevData => {
      if (!prevData) return prevData;
      
      return prevData.map(pageData => 
        pageData.map(message => message.id === updatedMessage.id ? updatedMessage : message)
      );
    }, false);
  }, [data, mutateMessages]);

  return {
    messages,
    isLoading: isLoading || loadingInitial,
    isInitialLoading: loadingInitial,
    isValidating,
    isReachingEnd,
    loadMore: () => setSize(size + 1),
    refreshMessages: () => mutateMessages(),
    addMessage,
    updateMessage,
    hasMore: !isReachingEnd,
    typingUsers,
    isConnected,
    error
  };
};

/**
 * Hook to send a message
 */
export function useSendMessage(conversationId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const sendMessage = useCallback(async (data: Omit<MessageCreate, 'conversationId'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const messageData: MessageCreate = {
        ...data,
        conversationId
      };
      
      const newMessage = await API.fetchAPI(API.API_ROUTES.MESSAGE(conversationId, ''), {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
      
      // Update the messages and conversations cache
      mutate(KEYS.messages(conversationId));
      mutate(KEYS.conversations);
      mutate(KEYS.conversation(conversationId));
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'envoi du message'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return {
    sendMessage,
    isLoading,
    error
  };
}

/**
 * Hook to update a message
 */
export function useUpdateMessage(conversationId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateMessage = useCallback(async (messageId: string, data: MessageUpdate) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedMessage = await API.fetchAPI(API.API_ROUTES.MESSAGE(conversationId, messageId), {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      
      // Update the messages cache
      mutate(KEYS.messages(conversationId));
      
      return updatedMessage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error updating message'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return {
    updateMessage,
    isLoading,
    error
  };
}

/**
 * Hook to handle conversation read status
 */
export function useMarkAsRead(conversationId: string) {
  const markAsRead = useCallback(async () => {
    try {
      await API.fetchAPI(API.API_ROUTES.CONVERSATION(conversationId), {
        method: 'PATCH',
        body: JSON.stringify({ read: true })
      });
      
      // Update the cache
      mutate(KEYS.conversations);
      mutate(KEYS.conversation(conversationId));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [conversationId]);

  return { markAsRead };
}

/**
 * Hook to mark multiple messages as read
 */
export function useMarkMessagesAsRead(conversationId: string) {
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    try {
      await API.fetchAPI(`/messaging/conversations/${conversationId}/messages/read`, {
        method: 'POST',
        body: JSON.stringify({ message_ids: messageIds })
      });
      
      // Update the cache
      mutate(KEYS.conversations);
      mutate(KEYS.conversation(conversationId));
      mutate(KEYS.messages(conversationId));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [conversationId]);

  return { markMessagesAsRead };
}

/**
 * Hook to handle typing notifications
 */
export function useTypingIndicator(conversationId: string) {
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    try {
      await API.fetchAPI(API.API_ROUTES.CONVERSATION(conversationId), {
        method: 'PATCH',
        body: JSON.stringify({ typing: isTyping })
      });
    } catch (error) {
      console.error('Error sending typing notification:', error);
    }
  }, [conversationId]);

  return { sendTypingIndicator };
}

/**
 * Hook to handle WebSocket connection and real-time messages
 */
export function useWebSocketConnection(conversationId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socket = useRef<WebSocket | null>(null);
  const { addMessage, updateMessage } = useMessages(conversationId);
  const { refreshConversations } = useConversations();
  
  // Function to connect to WebSocket
  const connect = useCallback(() => {
    if (!conversationId || socket.current) return;
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }
    
    // Construct WebSocket URL with token for authentication
    const wsUrl = `${API.API_ROUTES.WEBSOCKET(conversationId)}?token=${token}`;
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      socket.current = null;
      
      // Try to reconnect after a delay
      setTimeout(() => {
        connect();
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };
    
    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case WebSocketMessageType.MESSAGE:
            // Received new message
            addMessage(message.data as unknown as Message);
            refreshConversations();
            break;
            
          case WebSocketMessageType.TYPING:
            // Update typing indicators
            const typingData = message.data as { userId: string; isTyping: boolean };
            const { userId, isTyping } = typingData;
            setTypingUsers(prev => {
              if (isTyping && !prev.includes(userId)) {
                return [...prev, userId];
              } else if (!isTyping && prev.includes(userId)) {
                return prev.filter(id => id !== userId);
              }
              return prev;
            });
            break;
            
          case WebSocketMessageType.READ_RECEIPT:
            // Received a read receipt
            const receiptData = message.data as { id: string; status: MessageStatusType };
            // Update message status - nous devons créer un objet Message complet car c'est ce que updateMessage attend
            updateMessage({
              id: receiptData.id,
              status: receiptData.status,
              conversationId: conversationId,
              senderId: '',  // valeurs obligatoires pour satisfaire le type Message
              messageType: MessageType.TEXT,
              isEncrypted: false,
              isEdited: false,
              isDeleted: false,
              isForwarded: false,
              createdAt: '',
              updatedAt: ''
            } as unknown as Message);
            break;
            
          case WebSocketMessageType.USER_PRESENCE:
            // User presence update
            // No specific action for now
            break;
            
          default:
            console.warn('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message WebSocket:', error);
      }
    };
    
    socket.current = ws;
    
  }, [conversationId, addMessage, refreshConversations, updateMessage]);
  
  // Function to send messages via WebSocket
  const sendWSMessage = useCallback((type: WebSocketMessageType, data: Record<string, unknown>) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }
    
    const message: WebSocketMessage = {
      type,
      data
    };
    
    socket.current.send(JSON.stringify(message));
    return true;
  }, []);
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    connect();
    
    // Clean up WebSocket connection when component unmounts
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, [connect]);
  
  return {
    isConnected,
    typingUsers,
    sendWSMessage
  };
}

/**
 * Hook to search for users to chat with
 */
export function useSearchChatUsers(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  // Debounce query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Only fetch if we have a query
  const shouldFetch = debouncedQuery.length >= 1;
  const { data, error, isLoading } = useSWR<ChatUser[]>(
    shouldFetch ? ['searchUsers', debouncedQuery] : null,
    async () => {
      console.log('Fetching users with query:', debouncedQuery);
      try {
        const result = await API.searchUsers(debouncedQuery) as ChatUser[];
        console.log('Search users result:', result);
        return result;
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // 5 seconds
    }
  );
  
  useEffect(() => {
    if (error) {
      console.error('Error in useSearchChatUsers:', error);
    }
  }, [error]);
  
  // Assurez-vous que users est toujours un tableau, même si data est null ou undefined
  const users = Array.isArray(data) ? data : [];
  
  return {
    users,
    isLoading,
    error,
    setQuery,
    query
  };
}

/**
 * Hook pour supprimer un message
 */
export function useDeleteMessage() {
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Le messageId est utilisé dans l'appel à API.deleteMessage ci-dessous
      await API.deleteMessage(messageId);
      
      // Mise à jour du cache SWR pour refléter la suppression
      mutate(
        (key) => Array.isArray(key) && key[0] === `/conversations/${messageId}/messages`
      );
      
      return true;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }, []);
  
  return { deleteMessage };
}

/**
 * Fonction pour envoyer une demande à l'API
 * @param endpoint Le point de terminaison API
 * @param options Les options de la requête fetch
 */
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };
  
  try {
    const response = await fetch(`${baseURL}${endpoint}`, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Définition des routes API pour les messages
export const API_ROUTES = {
  CONVERSATIONS: '/conversations',
  CONVERSATION: (id: string) => `/conversations/${id}`,
  MESSAGES: (conversationId: string) => `/conversations/${conversationId}/messages`,
  MESSAGE: (conversationId: string, messageId: string) => 
    `/conversations/${conversationId}/messages/${messageId}`,
  WEBSOCKET: (conversationId: string) => `/ws/${conversationId}`
};

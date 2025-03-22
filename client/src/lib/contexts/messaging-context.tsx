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

// Type du contexte de messagerie
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
  markAsRead: (conversationId: string) => Promise<void>;
  refreshConversations: () => void;
  isConnected: boolean;
  createConversation: (data: { participantIds: string[]; title?: string; isGroup: boolean }) => Promise<Conversation>;
  websocketStatus: string;
  error: string | null;
}

// Créer le contexte
const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Provider de messagerie
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
  
  // Référence pour la connexion WebSocket
  const wsClientRef = useRef<WebSocketClient | null>(null);
  
  // Récupérer le contexte d'authentification
  const auth = useAuth();
  const { user, isAuthenticated } = auth;
  
  // Trouver la conversation active
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    // Vérifier que conversations est un tableau avant d'utiliser find
    if (!Array.isArray(conversations)) {
      console.warn('Conversations is not an array:', conversations);
      return null;
    }
    return conversations.find(conv => conv.id === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  // Obtenir l'ID de conversation à partir de l'URL
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

  // Méthode pour charger les conversations
  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingConversations(true);
      const data = await messagingAPI.getConversations();
      console.log('Received conversations data:', data);
      
      // Vérifier que data est bien un tableau
      if (data) {
        if (Array.isArray(data?.conversations)) {
          setConversations(data?.conversations);
        } else {
          console.error('API returned non-array conversations data:', data?.conversations);
          // Initialiser avec un tableau vide en cas d'erreur
          setConversations([]);
        }
      } else {
        // Initialiser avec un tableau vide si pas de données
        setConversations([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      // Initialiser avec un tableau vide en cas d'erreur
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  // Charger les conversations au démarrage et quand l'utilisateur change
  useEffect(() => {
    if (isAuthenticated) {
      refreshConversations();
    }
  }, [isAuthenticated, refreshConversations]);

  // Méthode pour charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingMessages(true);
      const data = await messagingAPI.getMessages(conversationId);
      if (data) {
        // Trier les messages par date
        const sortedMessages = sortMessages(data);
        setMessages(sortedMessages);
        setHasMoreMessages(data.length >= 20); // Supposer qu'il y a plus si on a reçu le maximum
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [isAuthenticated]);

  // Charger les messages quand la conversation active change
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // Gestionnaire de connexion WebSocket
  const connectToWebSocket = useCallback(async (conversationId: string) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // On obtient le token d'accès d'une autre façon
      // Dans un système réel, cela devrait être disponible dans une propriété de l'état d'authentification
      const token = localStorage.getItem('access_token') || 'mock-token'; 
      
      // Fermer toute connexion WebSocket existante
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
      
      // Créer une nouvelle connexion WebSocket
      const wsClient = new WebSocketClient(conversationId, token, {
        debug: true, // Activer les logs pour le développement
        onOpen: () => {
          setWebsocketStatus('connected');
          setIsConnected(true);
          console.log(`WebSocket connected to conversation ${conversationId}`);
        },
        onMessage: (data) => {
          // Traiter les messages entrants en fonction de leur type
          if (data.type === WebSocketMessageType.MESSAGE) {
            // Ajouter le message à la conversation locale
            setMessages(prev => {
              const messageData = data.data as Record<string, unknown>;
              const messageId = messageData.id as string;
              const exists = prev.some(m => m.id === messageId);
              if (exists) return prev;
              return [...prev, messageData as unknown as Message];
            });
          } else if (data.type === WebSocketMessageType.TYPING) {
            // Mettre à jour l'indicateur de frappe
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
            // Mettre à jour le statut de lecture des messages
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
      
      // Stocker la référence au client WebSocket
      wsClientRef.current = wsClient;
      
      // Établir la connexion
      await wsClient.connect();
      
      return wsClient;
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      setError(`Impossible de se connecter au WebSocket: ${error instanceof Error ? error.message : String(error)}`);
      setWebsocketStatus('error');
    }
  }, [isAuthenticated, user]);

  // Établir la connexion WebSocket quand la conversation active change
  useEffect(() => {
    if (activeConversationId) {
      connectToWebSocket(activeConversationId);
    }
  }, [activeConversationId, connectToWebSocket]);

  // Méthode pour envoyer un message
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!activeConversationId) {
      throw new Error('No active conversation');
    }

    try {
      // Générer un ID temporaire pour le message
      const tempId = `temp-${Date.now()}`;
      
      // Créer un objet message local qui correspond à l'interface Message
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
      
      // Ajouter à l'état local - en préservant l'ordre chronologique
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        return sortMessages(updatedMessages);
      });
      
      // Envoyer via l'API REST
      await messagingAPI.sendMessage(activeConversationId, content);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Ajouter un message d'erreur
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
      
      // Ajouter à l'état local - en préservant l'ordre chronologique
      setMessages(prev => {
        const updatedMessages = [...prev, errorMessage];
        return sortMessages(updatedMessages);
      });
    }
  }, [activeConversationId, user]);

  // Load more messages (for infinite scrolling)
  const loadMoreMessages = useCallback(async ({limit = 20, before}: {limit?: number, before?: string} = {}) => {
    if (!activeConversationId || !hasMoreMessages || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      
      // Trouver le message le plus ancien pour la pagination
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
        // Trier les messages par date
        const sortedMessages = sortMessages([...messages, ...olderMessages]);
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeConversationId, messages, hasMoreMessages, isLoadingMore]);

  // Méthode pour créer une nouvelle conversation
  const createConversation = useCallback(async (data: { participantIds: string[]; title?: string; isGroup: boolean }): Promise<Conversation> => {
    try {
      const newConversation = await messagingAPI.createConversation(data);
      
      console.log("hehehehe", newConversation)
      // Ajouter la nouvelle conversation à l'état
      setConversations(prev => [newConversation, ...prev]);
      
      // Définir comme conversation active
      setActiveConversationId(newConversation.id);
      
      return newConversation;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }, []);

  // Note: Les fonctions updateMessage et deleteMessage sont supprimées car non utilisées actuellement  

  // Méthode pour marquer comme lu
  const markAsRead = useCallback(async (conversationId: string): Promise<void> => {
    if (!conversationId) return;
    
    try {
      await messagingAPI.markConversationAsRead(conversationId);
      
      // Mettre à jour les conversations pour réinitialiser le compteur de non lus
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 } 
          : conv
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }, []);

  // Méthode pour envoyer l'indicateur de frappe
  const sendTypingIndicator = useCallback((isTyping: boolean): void => {
    if (!activeConversationId || !wsClientRef.current) return;
    
    wsClientRef.current.sendTypingIndicator(isTyping);
  }, [activeConversationId]);

  // Fonction pour trier les messages par date
  const sortMessages = (messages: Message[]): Message[] => {
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
  };

  // Valeur du contexte
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
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
};

// Hook pour utiliser le contexte de messagerie
const useMessaging = (): MessagingContextType => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used inside a MessagingProvider');
  }
  return context;
};

// Exporter le provider et le hook
export { MessagingProvider, useMessaging };
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
  loadMoreMessages: () => Promise<void>;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  // Référence pour la connexion WebSocket
  const wsClientRef = useRef<WebSocketClient | null>(null);
  
  // Récupérer le contexte d'authentification
  const auth = useAuth();
  const { user, isAuthenticated } = auth;
  
  // Trouver la conversation active
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
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
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
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
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!isAuthenticated || !conversationId) return;
    
    try {
      setLoadingMessages(true);
      const data = await messagingAPI.getMessages(conversationId);
      if (data) {
        setMessages(data);
        setHasMoreMessages(data.length >= 20); // Supposer qu'il y a plus si on a reçu le maximum
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
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
      // Envoyer via l'API REST
      await messagingAPI.sendMessage(activeConversationId, content);
      
      // Créer un objet message local qui correspond à l'interface Message
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: 'current-user',
        messageType: MessageType.TEXT,
        content,
        isEncrypted: false,
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: MessageStatusType.SENT
      };
      
      // Ajouter à l'état local
      setMessages(prev => [...prev, newMessage]);
      
      // Envoyer aussi via WebSocket pour une mise à jour en temps réel
      if (wsClientRef.current?.isConnected()) {
        wsClientRef.current.sendTextMessage(content);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Créer un message d'erreur local
      const errorMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: 'current-user',
        messageType: MessageType.TEXT,
        content,
        isEncrypted: false,
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: MessageStatusType.FAILED
      };
      
      // Ajouter à l'état local
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [activeConversationId]);

  // Méthode pour charger plus de messages (pagination)
  const loadMoreMessages = useCallback(async (): Promise<void> => {
    if (!activeConversationId || loadingMessages || !hasMoreMessages) {
      return;
    }
    
    try {
      setLoadingMessages(true);
      
      // Nous utilisons un offset numérique pour la pagination
      const offset = messages.length;
      const olderMessages = await messagingAPI.getMessages(
        activeConversationId, 
        offset
      );
      
      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        setMessages(prev => [...prev, ...olderMessages]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setError(`Erreur lors du chargement des messages: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConversationId, loadingMessages, hasMoreMessages, messages]);

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
          ? { ...conv, unreadCount: 0 } 
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
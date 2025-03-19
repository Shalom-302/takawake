// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axiosClient from './axios-client';
import {
  Conversation,
  Message,
  MessageCreate,
  MessageStatusType,
  MessageUpdate,
  MessageSearchRequest
} from '../types/messaging';

// Points d'accès de l'API
export const API_ROUTES = {
  CONVERSATIONS: '/messaging/conversations',
  CONVERSATION: (id: string) => `/messaging/conversations/${id}`,
  MESSAGES: (conversationId: string) => `/messaging/conversations/${conversationId}/messages`,
  MESSAGE: (conversationId: string, messageId: string) => 
    `/messaging/conversations/${conversationId}/messages/${messageId}`,
  WEBSOCKET: (conversationId: string) => 
    `${process.env.NEXT_PUBLIC_WS_URL || (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host}/messaging/ws/${conversationId}`
};

/**
 * Fonction générique pour interagir avec l'API
 */
export async function fetchAPI<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  const url = baseURL + endpoint;
  
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };
  
  try {
    // En mode développement, peut simuler des données
    if (process.env.NODE_ENV === 'development') {
      // Simule un délai pour l'API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Retourne des données fictives selon l'endpoint
      if (endpoint.includes('/conversations') && !endpoint.includes('/messages')) {
        return [] as unknown as T;
      }
      
      if (endpoint.includes('/messages')) {
        return [] as unknown as T;
      }
      
      return {} as T;
    }
    
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Recovers conversations from logged-in user
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await fetchAPI<Conversation[]>(API_ROUTES.CONVERSATIONS);
  return response;
}

/**
 * Retrieves a specific conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  const response = await fetchAPI<Conversation>(API_ROUTES.CONVERSATION(conversationId));
  return response;
}

/**
 * Creates a new conversation
 */
export async function createConversation(data: {
  participantIds: string[];
  title?: string;
  isGroup?: boolean;
}): Promise<Conversation> {
  const response = await fetchAPI<Conversation>(API_ROUTES.CONVERSATIONS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response;
}

/**
 * Gets the messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  params?: { limit?: number; before?: string }
): Promise<Message[]> {
  const endpoint = `${API_ROUTES.CONVERSATIONS}/${conversationId}/messages`;
  const queryParams = new URLSearchParams();
  
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params?.before) {
    queryParams.append('before', params.before);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  const response = await fetchAPI<Message[]>(url);
  return response;
}

/**
 * Sends a new message
 */
export async function sendMessage(messageData: MessageCreate): Promise<Message> {
  const endpoint = `/messaging/conversations/${messageData.conversationId}/messages`;
  const response = await fetchAPI<Message>(endpoint, {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
  return response;
}

/**
 * Updates an existing message
 */
export async function updateMessage(messageId: string, updateData: MessageUpdate): Promise<Message> {
  const endpoint = `/messaging/messages/${messageId}`;
  const response = await fetchAPI<Message>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return response;
}

/**
 * Deletes a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const endpoint = `/messaging/messages/${messageId}`;
  await fetchAPI<void>(endpoint, {
    method: 'DELETE',
  });
}

/**
 * Updates the status of a message (read, delivered, etc.)
 */
export async function updateMessageStatus(
  messageId: string,
  status: MessageStatusType
): Promise<void> {
  await fetchAPI<void>(`${API_ROUTES.MESSAGES}/status`, {
    method: 'POST',
    body: JSON.stringify({ messageId, status }),
  });
}

/**
 * Sends a typing notification
 */
export async function sendTypingNotification(
  conversationId: string,
  isTyping: boolean
): Promise<void> {
  await fetchAPI<void>(`${API_ROUTES.CONVERSATIONS}/${conversationId}/typing`, {
    method: 'POST',
    body: JSON.stringify({ isTyping }),
  });
}

/**
 * Searches for messages
 */
export async function searchMessages(searchRequest: MessageSearchRequest): Promise<Message[]> {
  const endpoint = `/messaging/messages/search`;
  const response = await fetchAPI<Message[]>(endpoint, {
    method: 'POST',
    body: JSON.stringify(searchRequest),
  });
  return response;
}

/**
 * Marks all messages of a conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  await fetchAPI<void>(`${API_ROUTES.CONVERSATIONS}/${conversationId}/read`, {
    method: 'POST',
  });
}

/**
 * Uploads a file attachment
 */
export async function uploadAttachment(
  messageId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const endpoint = `/messaging/messages/${messageId}/attachments`;
  const response = await fetchAPI<string>(endpoint, {
    method: 'POST',
    body: formData,
  });
  
  return response;
}

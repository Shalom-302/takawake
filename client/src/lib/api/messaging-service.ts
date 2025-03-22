// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axiosClient from './axios-client';
import { 
  Message, 
  MessageStatusType, 
  // MessageCreate supprimé car non utilisé
  MessageUpdate,
  MessageSearchRequest,
  Conversation,
  ChatUser
} from '../types/messaging';


// API endpoints
export const API_ROUTES = {
  CONVERSATIONS: '/messaging/conversations',
  CONVERSATION: (id: string) => `/messaging/conversations/${id}`,
  DIRECT_CONVERSATION: '/messaging/conversations/direct',
  GROUP_CONVERSATION: '/messaging/conversations/group',
  MESSAGES: '/messaging/messages',
  MESSAGES_BULK: '/messaging/messages/bulk',
  MESSAGE: (conversationId: string, messageId: string) => 
    `/messaging/conversations/${conversationId}/messages/${messageId}`,
  MESSAGING: '/messaging',
  WEBSOCKET: (conversationId: string) => 
    `${process.env.NEXT_PUBLIC_WS_URL || (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host}/messaging/ws/${conversationId}`
};

/**
 * Fonction générique pour interagir avec l'API
 */
export async function fetchAPI<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Utiliser une URL par défaut appropriée si NEXT_PUBLIC_API_URL n'est pas défini
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 
                 (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:8000');
  
  console.log('Using API base URL:', baseURL);
  const url = baseURL + endpoint;
  
  // Create a standard headers object
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  // Add authentication token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    console.log(`API request to ${endpoint} - Auth token:`, token ? 'Token present' : 'No token found');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn(`No authentication token found for request to ${endpoint}`);
    }
  }
  
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers,
    ...options,
  };
  
  try {
    
    console.log(`Making real API request to ${url}`, defaultOptions);
    const response = await fetch(url, defaultOptions);
    console.log(`API response status for ${endpoint}:`, response.status);
    
    if (!response.ok) {
      // Amélioré pour extraire le message d'erreur du backend
      const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
      const errorMessage = errorData.detail || `Erreur ${response.status}: ${response.statusText}`;
      console.error(`API error for ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    // For empty responses, return empty object
    if (response.status === 204) {
      return {} as T;
    }
    
    // Parse JSON response
    const data = await response.json();
    console.log(`API response data for ${endpoint}:`, data);
    return data as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Recovers conversations from logged-in user
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await fetchAPI<Conversation[]>(API_ROUTES.CONVERSATIONS);
  console.log('===Conversations:', response);
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
  // Debug: Check authentication token
  const token = localStorage.getItem('auth_token');
  console.log('Current auth token:', token);
  console.log('Create conversation data:', data);
  
  try {
    if (data.isGroup) {
      // Format for group conversation
      const groupData = {
        participant_ids: data.participantIds,
        title: data.title || '',
        description: '',
        conversation_type: 'group'
      };
      
      console.log('Sending group conversation data:', groupData);
      const response = await fetchAPI<Conversation>(API_ROUTES.GROUP_CONVERSATION, {
        method: 'POST',
        body: JSON.stringify(groupData),
      });
      console.log('Group conversation created:', response);
      return response;
    } else {
      // Format for direct conversation
      if (data.participantIds.length !== 1) {
        throw new Error('A direct conversation must have exactly one recipient');
      }
      
      // Utiliser la structure correcte attendue par le backend (recipient_id au lieu de participant_ids)
      const directData = {
        recipient_id: data.participantIds[0],
        initial_message: data.title, // Optional, used as first message if specified
        conversation_type: 'direct'
      };
      
      console.log('Sending direct conversation data:', directData);
      console.log('Sending to endpoint:', API_ROUTES.DIRECT_CONVERSATION);
      const response = await fetchAPI<Conversation>(API_ROUTES.DIRECT_CONVERSATION, {
        method: 'POST',
        body: JSON.stringify(directData),
      });
      console.log('Direct conversation created:', response);
      return response;
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Gets the messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  params?: { limit?: number; before?: string }
): Promise<Message[]> {
  // Use the correct endpoint format for the backend
  const requestBody = {
    conversation_id: conversationId,
    limit: params?.limit || 50,
    before_message_id: params?.before || null
  };
  
  console.log('Fetching messages with request:', requestBody);
  
  const response = await fetchAPI<Message[]>(API_ROUTES.MESSAGES_BULK, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
  
  return response;
}

/**
 * Sends a new message
 */
export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  // Créer l'objet message
  const messageData = {
    conversation_id: conversationId,
    content: content,
    message_type: "text"
  };
  
  console.log('Sending message with data:', messageData);
  
  // Utiliser fetchAPI avec JSON standard, adapté au nouveau format du backend
  const response = await fetchAPI<Message>(API_ROUTES.MESSAGES, {
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

/**
 * Rechercher des utilisateurs pour le chat
 */
export async function searchUsers(query: string): Promise<ChatUser[]> {
  try {
    // Log the search request
    console.log('Searching users with query:', query);
    
    // Make the API call - Fix the correct endpoint path
    return fetchAPI<ChatUser[]>(`/messaging/users/search?query=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Ajouter un membre à une conversation de groupe
 */
export async function addConversationMember(conversationId: string, userId: string): Promise<Conversation> {
  try {
    // Log the add member request
    console.log('Adding member to conversation:', { conversationId, userId });
    
    // Get token manually to verify it exists
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No authentication token found. User might not be logged in.');
      throw new Error('Authentication required');
    }
    
    // Make the API call with explicit authentication header
    return fetchAPI<Conversation>(
      `${API_ROUTES.MESSAGING}/conversations/${conversationId}/members`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );
  } catch (error) {
    console.error('Error adding member to conversation:', error);
    throw error;
  }
}

/**
 * Supprimer un membre d'une conversation de groupe
 */
export async function removeConversationMember(conversationId: string, userId: string): Promise<Conversation> {
  try {
    // Log the remove member request
    console.log('Removing member from conversation:', { conversationId, userId });
    
    // Make the API call
    return fetchAPI<Conversation>(
      `/messaging/conversations/${conversationId}/members/${userId}`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
}

/**
 * Supprimer une conversation
 */
export async function deleteConversation(conversationId: string): Promise<{ message: string; status: string }> {
  try {
    console.log('Deleting conversation:', conversationId);
    
    // Make the API call to delete the conversation
    return fetchAPI<{ message: string; status: string }>(
      API_ROUTES.CONVERSATION(conversationId),
      {
        method: 'DELETE',
      }
    );
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

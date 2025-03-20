/**
 * Types pour le système de messagerie en temps réel
 */

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  CONTACT = 'contact',
  SYSTEM = 'system'
}

export enum MessageStatusType {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  BROADCAST = 'broadcast'
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  isImage: boolean;
  thumbnailPath?: string;
  createdAt: string;
}

export interface MessageReaction {
  id: string;
  userId: string;
  reaction: string;
  createdAt: string;
}

export interface MessageReceipt {
  id: string;
  userId: string;
  status: MessageStatusType;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;
  content?: string;
  messageMetadata?: Record<string, unknown>;
  isEncrypted: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: MessageAttachment[];
  receipts?: MessageReceipt[];
  reactions?: MessageReaction[];
  status?: MessageStatusType;
}

export interface ConversationParticipant {
  userId: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string;
}

export interface Conversation {
  id: string;
  conversationType: ConversationType;
  title?: string;
  avatarUrl?: string;
  createdBy: string;
  isEncrypted: boolean;
  conversationMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  lastMessage?: Message;
  participants: ConversationParticipant[];
  unreadCount?: number;
}

export interface UserConversationSettings {
  id: string;
  userId: string;
  conversationId: string;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  customName?: string;
  themeColor?: string;
  notificationLevel: string;
  lastReadMessageId?: string;
  role: string;
}

export interface ChatUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

// Types pour les requêtes WebSocket
export enum WebSocketMessageType {
  MESSAGE = 'message',
  TYPING = 'typing',
  READ_RECEIPT = 'read_receipt',
  USER_PRESENCE = 'user_presence',
  PING = 'ping',
  PONG = 'pong',
  ERROR = 'error'
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: Record<string, unknown>;
}

// Types pour la création et mise à jour de messages
export interface MessageCreate {
  conversationId: string;
  messageType: MessageType;
  content?: string;
  messageMetadata?: Record<string, unknown>;
}

export interface MessageUpdate {
  content?: string;
  isDeleted?: boolean;
  messageMetadata?: Record<string, unknown>;
}

// Types pour la recherche
export interface MessageSearchRequest {
  conversationId: string;
  query?: string;
  messageTypes?: MessageType[];
  startDate?: string;
  endDate?: string;
  senderId?: string;
  limit?: number;
  offset?: number;
}
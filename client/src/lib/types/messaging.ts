/**
 * Types pour le système de messagerie en temps réel
 */

export enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    AUDIO = "audio",
    VIDEO = "video",
    LOCATION = "location",
    CONTACT = "contact",
    SYSTEM = "system",
}

export enum MessageStatusType {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed",
}

export enum ConversationType {
    DIRECT = "direct",
    GROUP = "group",
    BROADCAST = "broadcast",
}

export interface MessageAttachment {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_path: string;
    is_image: boolean;
    thumbnail_path?: string;
    created_at: string;
}

export interface MessageReaction {
    id: string;
    user_id: string;
    reaction: string;
    created_at: string;
}

export interface MessageReceipt {
    id: string;
    user_id: string;
    status: MessageStatusType;
    created_at: string;
}

// Interface pour les métadonnées d'un participant supprimé
export interface OtherParticipantInfo {
    user_id: string;
    name?: string;
    profile_picture?: string;
    last_seen?: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    message_type: MessageType;
    content?: string;
    message_metadata?: Record<string, unknown>;
    is_encrypted: boolean;
    is_edited: boolean;
    is_deleted: boolean;
    is_forwarded: boolean;
    is_read?: boolean;
    created_at: string;
    updated_at: string;
    attachments?: MessageAttachment[];
    receipts?: MessageReceipt[];
    reactions?: MessageReaction[];
    status?: MessageStatusType;
}

export interface ConversationParticipant {
    user_id: string;
    role: string;
    joined_at: string;
    is_active: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_picture?: string;
}

export interface Conversation {
    id: string;
    conversation_type: ConversationType;
    title?: string;
    avatar_url?: string;
    created_by: string;
    is_encrypted: boolean;
    conversation_metadata?: {
        otherParticipantInfo?: OtherParticipantInfo;
        [key: string]: unknown;
    };
    created_at: string;
    updated_at: string;
    last_message_at?: string;
    last_message?: Message;
    participants: ConversationParticipant[];
    unread_count?: number;
}

export interface UserConversationSettings {
    id: string;
    user_id: string;
    conversation_id: string;
    is_muted: boolean;
    is_pinned: boolean;
    is_archived: boolean;
    custom_name?: string;
    theme_color?: string;
    notification_level: string;
    last_read_message_id?: string;
    role: string;
}

export interface ChatUser {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    is_online?: boolean;
    last_seen?: string;
}

// Types pour les requêtes WebSocket
export enum WebSocketMessageType {
    MESSAGE = "message",
    TYPING = "typing",
    READ_RECEIPT = "read_receipt",
    USER_PRESENCE = "user_presence",
    CONNECTION_ESTABLISHED = "connection_established",
    CONVERSATION_UPDATE = "conversation_update",
    PING = "ping",
    PONG = "pong",
    ERROR = "error",
}

export interface WebSocketMessage {
    type: WebSocketMessageType;
    data: Record<string, unknown>;
}

// Type de statut de connexion WebSocket
export type WebSocketConnectionStatus =
    | "connecting"
    | "connected"
    | "disconnected"
    | "reconnecting"
    | "error";

// Types pour la création et mise à jour de messages
export interface MessageCreate {
    conversation_id: string;
    message_type: MessageType;
    content?: string;
    message_metadata?: Record<string, unknown>;
}

export interface MessageUpdate {
    content?: string;
    is_deleted?: boolean;
    message_metadata?: Record<string, unknown>;
}

// Types pour la recherche
export interface MessageSearchRequest {
    conversation_id: string;
    query?: string;
    message_types?: MessageType[];
    start_date?: string;
    end_date?: string;
    sender_id?: string;
    limit?: number;
    offset?: number;
}

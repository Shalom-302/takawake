"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { usePathname } from "next/navigation";
import {
    Message,
    Conversation,
    MessageType,
    MessageStatusType,
    WebSocketMessageType,
    WebSocketMessage,
    WebSocketConnectionStatus,
} from "../types/messaging";
import { WebSocketClient } from "../utils/websocket-client";
import * as messagingAPI from "../api/messaging-service";
import { useAuth } from "./auth-context";

// Messaging context type
interface MessagingContextType {
    conversations: Conversation[];
    messages: Message[];
    activeConversationId: string | null;
    activeConversation: Conversation | null;
    typingUsers: {
        [conversationId: string]: { userId: string; username: string; timestamp: number }[];
    };
    userStatuses: { [userId: string]: { status: string; lastSeen: string } };
    loadingConversations: boolean;
    loadingMessages: boolean;
    hasMoreMessages: boolean;
    setActiveConversationId: (id: string | null) => void;
    loadMoreMessages: ({ limit, before }?: { limit?: number; before?: string }) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    sendTypingIndicator: (conversationId: string) => void;
    markAsRead: (conversationId?: string) => Promise<void>;
    refreshConversations: () => void;
    isConnected: boolean;
    createConversation: (data: {
        participantIds: string[];
        title?: string;
        isGroup: boolean;
    }) => Promise<Conversation>;
    websocketStatus: WebSocketConnectionStatus;
    error: string | null;
    updateVisibleMessagesStatus: (messageIds: string[]) => void;
    sendStatusUpdate: (status: "online" | "offline" | "away") => void;
    globalWebsocketStatus: "connecting" | "connected" | "disconnected" | "error";
    isGlobalConnected: boolean;
}

// Create the context
const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Provider of messaging
function MessagingProvider({ children }: { children: ReactNode }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
    const [typingUsers, setTypingUsers] = useState<
        Record<string, { userId: string; username: string; timestamp: number }[]>
    >({});
    const [userStatuses, setUserStatuses] = useState<
        Record<string, { status: string; lastSeen: string }>
    >({});
    const [websocketStatus, setWebsocketStatus] = useState<
        "connecting" | "connected" | "disconnected" | "error"
    >("disconnected");
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [globalWebsocketStatus, setGlobalWebsocketStatus] = useState<
        "connecting" | "connected" | "disconnected" | "error"
    >("disconnected");
    const [isGlobalConnected, setIsGlobalConnected] = useState<boolean>(false);

    // WebSocket references
    const wsClientRef = useRef<WebSocketClient | null>(null);
    const globalWsClientRef = useRef<WebSocketClient | null>(null);
    const tempUserIdRef = useRef<string | null>(null);
    const lastReceivedMessageRef = useRef<{
        id: string;
        conversationId: string;
        timestamp: number;
    } | null>(null);
    const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
    const globalViewRef = useRef<HTMLDivElement | null>(null);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get authentication context
    const auth = useAuth();
    const { user, isAuthenticated } = auth;

    // Récupérer le token d'accès depuis localStorage
    const getAccessToken = useCallback(() => {
        return localStorage.getItem("auth_token") || "";
    }, []);

    // Function to sort messages (defined before usage)
    const sortMessages = useCallback((messages: Message[]): Message[] => {
        return [...messages].sort((a, b) => {
            // If one of the messages doesn't have a date, put it at the end
            if (!a.created_at && b.created_at) return 1;
            if (a.created_at && !b.created_at) return -1;

            // Handle temp messages (added by the user)
            if (a.id.startsWith("temp-") && !b.id.startsWith("temp-")) return 1;
            if (!a.id.startsWith("temp-") && b.id.startsWith("temp-")) return -1;

            // If both are temp messages, sort by the temp ID (which contains a timestamp)
            if (a.id.startsWith("temp-") && b.id.startsWith("temp-")) {
                const aTimestamp = parseInt(a.id.split("-")[1]) || 0;
                const bTimestamp = parseInt(b.id.split("-")[1]) || 0;
                return aTimestamp - bTimestamp;
            }

            // Otherwise, sort by created_at date
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    }, []);

    // Method to remove a typing user from a conversation
    const removeTypingUser = useCallback((conversationId: string, userId: string) => {
        setTypingUsers(prev => {
            const conversationTypingUsers = prev[conversationId] || [];
            // Only update if user is actually in the typing list
            if (conversationTypingUsers.some(u => u.userId === userId)) {
                return {
                    ...prev,
                    [conversationId]: conversationTypingUsers.filter(u => u.userId !== userId),
                };
            }
            return prev;
        });
    }, []);

    // Find active conversation
    const activeConversation = useMemo(() => {
        if (!activeConversationId) return null;
        // Check that conversations is an array before using find
        if (!Array.isArray(conversations)) {
            console.warn("Conversations is not an array:", conversations);
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
            console.log("Received conversations data:", data);

            // Vérifier la structure des données
            if (data) {
                console.log("✅ Fetched fresh conversations data from API");
                if (
                    data &&
                    typeof data === "object" &&
                    "conversations" in data &&
                    Array.isArray(data.conversations)
                ) {
                    // Tri des conversations par date du dernier message
                    const sortedConversations = [...data.conversations].sort((a, b) => {
                        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                        return dateB - dateA;
                    });

                    console.log(
                        "✅ Sorted conversations by last_message_at:",
                        sortedConversations.map(c => ({
                            id: c.id,
                            last_message: c.last_message?.content?.substring(0, 15) || "No message",
                            last_message_at: c.last_message_at,
                            unread: c.unread_count,
                        }))
                    );

                    // Si data est un objet avec une propriété conversations qui est un tableau
                    setConversations([...sortedConversations]);
                } else {
                    console.error("API returned invalid format for conversations:", data);
                    setConversations([]);
                }
            } else {
                setConversations([]);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
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
    const loadMessages = useCallback(
        async (conversationId: string): Promise<void> => {
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
                console.error("Error loading messages:", error);
                setError("Failed to load messages");
            } finally {
                setLoadingMessages(false);
            }
        },
        [isAuthenticated, sortMessages, setMessages]
    );

    // Load messages when the active conversation changes
    useEffect(() => {
        if (activeConversationId && activeConversationId !== "new") {
            loadMessages(activeConversationId);
        } else {
            setMessages([]);
        }
    }, [activeConversationId, loadMessages]);

    // Function to update visible message status
    const updateVisibleMessagesStatus = useCallback(
        async (messageIds: string[]) => {
            if (!activeConversationId || messageIds.length === 0) return;

            const unreadMessageIds = messageIds.filter(id => {
                const msg = messages.find(m => m.id === id);
                return msg && !msg.is_read && msg.sender_id !== user?.id;
            });

            if (unreadMessageIds.length > 0) {
                console.log(
                    `Updating read status for ${unreadMessageIds.length} messages in conversation ${activeConversationId}`
                );

                try {
                    // Use the correct endpoint for marking messages as read
                    await messagingAPI.fetchAPI(`/messaging/messages/status`, {
                        method: "POST",
                        body: JSON.stringify({
                            message_ids: unreadMessageIds,
                            status: "read",
                        }),
                    });

                    // Update local messages
                    setMessages(prev =>
                        prev.map(msg =>
                            unreadMessageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
                        )
                    );

                    // Update unread count in conversations list
                    setConversations(prev =>
                        prev.map(conv =>
                            conv.id === activeConversationId ? { ...conv, unread_count: 0 } : conv
                        )
                    );

                    // Send read receipts via WebSocket for each message
                    if (
                        wsClientRef.current &&
                        wsClientRef.current.isConnected &&
                        wsClientRef.current.isConnected()
                    ) {
                        // For each unread message, send a read receipt
                        unreadMessageIds.forEach(messageId => {
                            // Find the message to get the sender ID
                            const message = messages.find(msg => msg.id === messageId);
                            if (message) {
                                console.log(
                                    `Sending read receipt for message ${messageId} to sender ${message.sender_id}`
                                );
                                wsClientRef.current?.sendMessage({
                                    type: WebSocketMessageType.READ_RECEIPT,
                                    data: {
                                        message_id: messageId,
                                        conversation_id: activeConversationId,
                                        reader_id: user?.id,
                                        reader_name: user?.username || "User",
                                        timestamp: new Date().toISOString(),
                                    },
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error marking messages as read:", error);
                }
            }
        },
        [activeConversationId, messages, user?.id, user?.username]
    );

    // Method to mark a conversation as read
    const markAsRead = useCallback(
        async (conversationId?: string): Promise<void> => {
            const targetId = conversationId || activeConversationId;
            if (!targetId) return;

            console.log(`Marking conversation ${targetId} as read`);

            try {
                // Use the correct endpoint to mark a conversation as read
                const response = await messagingAPI.fetchAPI(
                    `/messaging/conversations/${targetId}/read`,
                    {
                        method: "POST",
                    }
                );

                // Check if the response indicates success
                if (
                    response &&
                    typeof response === "object" &&
                    "success" in response &&
                    response.success
                ) {
                    console.log(
                        `Updated conversation list - conversation ${targetId} now has unread_count: 0`
                    );
                    setConversations(prev =>
                        prev.map(conv =>
                            conv.id === targetId ? { ...conv, unread_count: 0 } : conv
                        )
                    );

                    // Additionally, update the status of visible messages to "read"
                    // This handles the UI display of message status
                    if (targetId === activeConversationId) {
                        updateVisibleMessagesStatus(messages.map(msg => msg.id));
                    }
                } else {
                    console.warn(`Failed to mark conversation ${targetId} as read`);
                }
            } catch (error) {
                console.error("Error marking conversation as read:", error);
            }
        },
        [activeConversationId, messages, updateVisibleMessagesStatus]
    );

    // WebSocket connection handler
    const connectToWebSocket = useCallback(
        async (conversationId: string) => {
            if (!isAuthenticated || !user) return;

            try {
                // Get the auth token from localStorage
                const token = getAccessToken();
                console.log("Using auth token for WebSocket:", token.substring(0, 10) + "...");

                // Close any existing WebSocket connection
                if (wsClientRef.current) {
                    console.log("Closing existing WebSocket connection");
                    wsClientRef.current.disconnect();
                    wsClientRef.current = null;
                }

                // Set WebSocket status to connecting
                setWebsocketStatus("connecting");

                // Create WebSocket client
                wsClientRef.current = new WebSocketClient(conversationId, token, {
                    onOpen: () => {
                        console.log(
                            `WebSocket connection opened for conversation ${conversationId}`
                        );
                        setWebsocketStatus("connected");
                        setIsConnected(true);
                    },
                    onMessage: message => {
                        console.log("WebSocket message received:", message);

                        // Handle different message types
                        switch (message.type) {
                            case WebSocketMessageType.MESSAGE:
                                // Ensure data contains conversation_id
                                if (
                                    message.data &&
                                    typeof message.data === "object" &&
                                    "conversation_id" in message.data
                                ) {
                                    // Type assertion with proper check for required properties
                                    const safeData = message.data as Record<string, unknown>;
                                    if (
                                        typeof safeData.conversation_id === "string" &&
                                        (typeof safeData.sender_id === "string" ||
                                            typeof safeData.user_id === "string")
                                    ) {
                                        const messageData: WebSocketMessageData = {
                                            conversation_id: safeData.conversation_id,
                                            sender_id: (safeData.sender_id ||
                                                safeData.user_id) as string,
                                            content: (safeData.content as string) || "",
                                            // Add other required properties with defaults if needed
                                            id: (safeData.id ||
                                                safeData.message_id ||
                                                "") as string,
                                            created_at:
                                                (safeData.created_at as string) ||
                                                new Date().toISOString(),
                                            message_type:
                                                (safeData.message_type as string) || "text",
                                        };
                                        handleNewMessage(messageData);
                                    }
                                }
                                break;

                            case WebSocketMessageType.TYPING:
                                // Ensure data contains conversation_id
                                if (
                                    message.data &&
                                    typeof message.data === "object" &&
                                    "conversation_id" in message.data
                                ) {
                                    // Type assertion with proper check for required properties
                                    const safeData = message.data as Record<string, unknown>;
                                    if (
                                        typeof safeData.conversation_id === "string" &&
                                        (typeof safeData.user_id === "string" ||
                                            typeof safeData.sender_id === "string")
                                    ) {
                                        const typingData: WebSocketMessageData = {
                                            conversation_id: safeData.conversation_id,
                                            sender_id: (safeData.user_id ||
                                                safeData.sender_id) as string,
                                            // Add other required properties with defaults
                                            id: (safeData.id || "") as string,
                                            content: (safeData.content as string) || "",
                                            created_at:
                                                (safeData.created_at as string) ||
                                                new Date().toISOString(),
                                            message_type: "typing",
                                        };
                                        handleTypingIndicator(typingData);
                                    }
                                }
                                break;

                            case WebSocketMessageType.READ_RECEIPT:
                                // Ensure data contains conversation_id
                                if (
                                    message.data &&
                                    typeof message.data === "object" &&
                                    "conversation_id" in message.data
                                ) {
                                    // Type assertion with proper check for required properties
                                    const safeData = message.data as Record<string, unknown>;
                                    if (typeof safeData.conversation_id === "string") {
                                        const readData: WebSocketMessageData = {
                                            conversation_id: safeData.conversation_id,
                                            sender_id: (safeData.reader_id ||
                                                safeData.user_id ||
                                                safeData.sender_id ||
                                                "") as string,
                                            // Add other required properties with defaults
                                            id: (safeData.message_id ||
                                                safeData.id ||
                                                "") as string,
                                            content: "",
                                            created_at: new Date().toISOString(),
                                            message_type: "read_receipt",
                                            message_ids: Array.isArray(safeData.message_ids)
                                                ? (safeData.message_ids as string[])
                                                : safeData.message_id
                                                  ? [safeData.message_id as string]
                                                  : [],
                                        };
                                        handleReadReceipt(readData);
                                    }
                                }
                                break;
                            case WebSocketMessageType.CONVERSATION_UPDATE:
                                // Handle conversation update
                                if (
                                    message.data &&
                                    typeof message.data === "object" &&
                                    "conversation_id" in message.data
                                ) {
                                    const conversationData = message.data as {
                                        conversation_id: string;
                                        last_message?: {
                                            id: string;
                                            content: string;
                                            created_at: string;
                                        };
                                    };

                                    // Log the conversation update but don't refresh every time
                                    console.log(
                                        `Received conversation update for: ${conversationData.conversation_id}`
                                    );

                                    // Instead of refreshing all conversations every time,
                                    // update the specific conversation in the state
                                    setConversations(prevConversations => {
                                        // Check if we have this conversation in the state
                                        const existingIndex = prevConversations.findIndex(
                                            c => c.id === conversationData.conversation_id
                                        );

                                        // If the conversation doesn't exist, refresh all
                                        if (existingIndex === -1) {
                                            // Schedule a delayed refresh to avoid multiple calls
                                            setTimeout(() => {
                                                refreshConversationsDebounced();
                                            }, 300);
                                            return prevConversations;
                                        }

                                        // Otherwise, just update this conversation
                                        const updatedConversations = [...prevConversations];

                                        // If we have updates, apply them
                                        if (conversationData.last_message) {
                                            updatedConversations[existingIndex] = {
                                                ...updatedConversations[existingIndex],
                                                last_message:
                                                    conversationData.last_message as unknown as Message,
                                                last_message_at:
                                                    conversationData.last_message.created_at ||
                                                    new Date().toISOString(),
                                            };
                                        }

                                        // Sort conversations by last message date
                                        return sortConversationsByDate(updatedConversations);
                                    });
                                }
                                break;

                            default:
                                console.log("Unknown message type:", message.type);
                        }
                    },
                    onClose: () => {
                        console.log("WebSocket connection closed");
                        setWebsocketStatus("disconnected");
                        setIsConnected(false);
                    },
                    onError: error => {
                        console.error("WebSocket error:", error);
                        setWebsocketStatus("error");
                        setIsConnected(false);
                        setError("WebSocket connection error");
                    },
                    debug: true,
                });

                // Connect to WebSocket
                console.log(`Connecting to WebSocket for conversation ${conversationId}`);
                await wsClientRef.current.connect();
            } catch (error) {
                console.error("Error connecting to WebSocket:", error);
                setIsConnected(false);
                setError(
                    `Unable to connect to WebSocket: ${error instanceof Error ? error.message : String(error)}`
                );
                setWebsocketStatus("error");
            }
        },
        [isAuthenticated, user, getAccessToken]
    );

    // Establish WebSocket connection when active conversation changes
    useEffect(() => {
        if (activeConversationId && isAuthenticated) {
            connectToWebSocket(activeConversationId);

            // Send an "online" status update when the conversation is active
            if (wsClientRef.current && wsClientRef.current.isConnected()) {
                wsClientRef.current?.sendMessage({
                    type: WebSocketMessageType.USER_PRESENCE,
                    data: {
                        user_id: user?.id,
                        status: "online",
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        }

        return () => {
            // Send an "offline" status update when the user leaves
            if (wsClientRef.current && wsClientRef.current.isConnected()) {
                wsClientRef.current?.sendMessage({
                    type: WebSocketMessageType.USER_PRESENCE,
                    data: {
                        user_id: user?.id,
                        status: "offline",
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        };
    }, [activeConversationId, isAuthenticated, connectToWebSocket]);

    // Method to send a message
    const sendMessage = useCallback(
        async (content: string): Promise<void> => {
            if (!activeConversationId) {
                throw new Error("No active conversation to send message to");
            }

            try {
                // Generate a temporary ID for the message
                const tempId = `temp-${Date.now()}`;

                // Create a local message object that matches the Message interface
                const newMessage: Message = {
                    id: tempId,
                    conversation_id: activeConversationId,
                    sender_id: user?.id || "",
                    message_type: MessageType.TEXT,
                    content,
                    is_encrypted: false,
                    is_edited: false,
                    is_deleted: false,
                    is_forwarded: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    status: MessageStatusType.SENT,
                };

                // Add to local state - preserving chronological order
                setMessages(prev => {
                    const updatedMessages = [...prev, newMessage];
                    return sortMessages(updatedMessages);
                });

                // Update the conversation with the new message immediately
                const now = new Date().toISOString();
                setConversations(prevConversations => {
                    console.log(
                        "Updating conversations after sending message:",
                        activeConversationId
                    );

                    // Find the conversation to update
                    const conversationToUpdate = prevConversations.find(
                        c => c.id === activeConversationId
                    );
                    if (!conversationToUpdate) {
                        console.warn(
                            "Could not find conversation to update:",
                            activeConversationId
                        );
                        return prevConversations;
                    }

                    // Create updated conversation with the new message
                    const updatedConversation = {
                        ...conversationToUpdate,
                        last_message: newMessage,
                        last_message_at: now,
                    };

                    console.log(
                        "Updated conversation with new message:",
                        JSON.stringify({
                            id: updatedConversation.id,
                            last_message_content: updatedConversation.last_message?.content,
                            last_message_at: updatedConversation.last_message_at,
                        })
                    );

                    // Remove the conversation from the list and add it at the top
                    const otherConversations = prevConversations.filter(
                        c => c.id !== activeConversationId
                    );
                    return [updatedConversation, ...otherConversations];
                });

                // Send via REST API
                const sentMessage = await messagingAPI.sendMessage(activeConversationId, content);

                // NOTE: We're not using addProcessedMessageId here as it doesn't exist
                // Instead, we'll handle potential duplicates by updating the state correctly

                // Update local ID with server ID and status
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === tempId ? { ...sentMessage, status: MessageStatusType.SENT } : msg
                    )
                );

                // Update conversation with the confirmed server message
                setConversations(prevConversations => {
                    const updatedConversations = prevConversations.map(conv =>
                        conv.id === activeConversationId
                            ? {
                                  ...conv,
                                  last_message: sentMessage,
                                  last_message_at: sentMessage.created_at,
                              }
                            : conv
                    );

                    // Make sure the updated conversation is first in the list
                    const updatedConv = updatedConversations.find(
                        c => c.id === activeConversationId
                    );
                    if (updatedConv) {
                        const otherConvs = updatedConversations.filter(
                            c => c.id !== activeConversationId
                        );
                        return [updatedConv, ...otherConvs];
                    }

                    return updatedConversations;
                });

                // Explicitly update message status on the server
                await messagingAPI.updateMessageStatus(sentMessage.id, MessageStatusType.SENT);

                // Force refresh conversations to ensure everything is in sync
                setTimeout(() => {
                    refreshConversations();
                }, 500);
            } catch (error) {
                console.error("Error sending message:", error);

                // Add an error message
                const errorMessage: Message = {
                    id: `temp-${Date.now()}`,
                    conversation_id: activeConversationId,
                    sender_id: user?.id || "",
                    message_type: MessageType.TEXT,
                    content,
                    is_encrypted: false,
                    is_edited: false,
                    is_deleted: false,
                    is_forwarded: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    status: MessageStatusType.FAILED,
                };

                // Add to local state - preserving chronological order
                setMessages(prev => {
                    const updatedMessages = [...prev, errorMessage];
                    return sortMessages(updatedMessages);
                });
            }
        },
        [activeConversationId, user, sortMessages, refreshConversations]
    );

    // Load more messages (for infinite scrolling)
    const loadMoreMessages = useCallback(
        async ({ limit = 20, before }: { limit?: number; before?: string } = {}) => {
            if (!activeConversationId || !hasMoreMessages || isLoadingMore) return;

            try {
                setIsLoadingMore(true);

                // Find the oldest message for pagination
                const oldestMessage = messages.reduce((oldest, current) => {
                    if (!oldest.created_at) return current;
                    if (!current.created_at) return oldest;
                    return new Date(oldest.created_at) < new Date(current.created_at)
                        ? oldest
                        : current;
                }, messages[0]);

                const oldestId = before || oldestMessage?.id;
                if (!oldestId) {
                    setHasMoreMessages(false);
                    return;
                }

                const olderMessages = await messagingAPI.getMessages(activeConversationId, {
                    limit,
                    before: oldestId,
                });

                if (!olderMessages || olderMessages.length === 0) {
                    setHasMoreMessages(false);
                } else {
                    // Sort messages by date
                    const sortedMessages = sortMessages([...messages, ...olderMessages]);
                    setMessages(sortedMessages);
                }
            } catch (error) {
                console.error("Error loading more messages:", error);
            } finally {
                setIsLoadingMore(false);
            }
        },
        [activeConversationId, messages, hasMoreMessages, isLoadingMore, sortMessages]
    );

    // Method to create a new conversation
    const createConversation = useCallback(
        async (data: {
            participantIds: string[];
            title?: string;
            isGroup: boolean;
        }): Promise<Conversation> => {
            try {
                const newConversation = await messagingAPI.createConversation(data);
                // Add the new conversation to the state
                setConversations(prev => [newConversation, ...prev]);

                // Set as active conversation
                setActiveConversationId(newConversation.id);

                return newConversation;
            } catch (error) {
                console.error("Error creating conversation:", error);
                throw error;
            }
        },
        [setConversations, setActiveConversationId]
    );

    // Method to send typing indicator
    const sendTypingIndicator = useCallback(
        (conversationId: string) => {
            if (!isConnected || !wsClientRef.current || !conversationId) return;

            wsClientRef.current.sendMessage({
                type: WebSocketMessageType.TYPING,
                data: {
                    conversation_id: conversationId,
                    user_id: user?.id || tempUserIdRef.current || "unknown",
                    username: user?.username || "Utilisateur",
                    timestamp: new Date().getTime(),
                },
            });

            console.log(`Sent typing indicator for conversation ${conversationId}`);
        },
        [isConnected, user, wsClientRef]
    );

    // Typage pour les données de messages WebSocket
    interface WebSocketMessageData {
        id?: string;
        message_id?: string;
        conversation_id: string;
        sender_id?: string;
        user_id?: string;
        content?: string;
        username?: string;
        created_at?: string;
        status?: string;
        message_ids?: string[];
        reader_id?: string;
        timestamp?: string;
        reader_name?: string;
        message_type?: string;
    }

    function handleNewMessage(data: WebSocketMessageData) {
        const messageId = data.id || data.message_id || "";
        const messageConversationId = data.conversation_id;
        const messageSenderId = data.sender_id || data.user_id || "";

        if (!messageId || !messageConversationId || !messageSenderId) {
            console.error("Message missing required fields:", {
                messageId,
                messageConversationId,
                messageSenderId,
            });
            return;
        }

        // Check if the message is from us
        const isSelfMessage =
            messageSenderId === user?.id ||
            (tempUserIdRef.current && messageSenderId === tempUserIdRef.current);

        console.log(
            `New message received - ID: ${messageId}, ConversationID: ${messageConversationId}, SenderID: ${messageSenderId}, isSelf: ${isSelfMessage}, activeConvID: ${activeConversationId}, tempUserId: ${tempUserIdRef.current}`
        );

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
                    console.log(
                        `Message ${messageId} already exists in the conversation, skipping`
                    );
                    return prev;
                }

                console.log(
                    `Adding new message ${messageId} to conversation ${messageConversationId}`
                );

                // If it's our own message, it should have the DELIVERED status
                if (isSelfMessage) {
                    return [
                        ...prev,
                        { ...data, status: MessageStatusType.DELIVERED } as unknown as Message,
                    ];
                } else {
                    return [...prev, data as unknown as Message];
                }
            });
        }

        // Update the list of conversations with the new message
        setConversations(prevConversations => {
            console.log(
                "Updating conversations with new message, current state:",
                JSON.stringify(
                    prevConversations.map(c => ({ id: c.id, last_message_at: c.last_message_at }))
                )
            );
            const now = new Date().toISOString();

            // Create a completely new array to ensure React detects the change
            const updatedConversations = prevConversations.map(conv => {
                if (conv.id === messageConversationId) {
                    const isActive = messageConversationId === activeConversationId;
                    // If it's a message from someone else and the conversation is not active,
                    // increment the unread_count
                    const newUnreadCount =
                        !isSelfMessage && !isActive
                            ? (conv.unread_count || 0) + 1
                            : conv.unread_count || 0;

                    console.log(
                        `Updating conversation ${conv.id}: unread_count = ${newUnreadCount} (was ${conv.unread_count || 0}), isActive=${isActive}, isSelf=${isSelfMessage}`
                    );

                    // Create a new conversation object with updated properties
                    const updatedConv = {
                        ...conv,
                        unread_count: newUnreadCount,
                        last_message: data as unknown as Message,
                        last_message_at: now,
                    };

                    console.log(
                        "Updated conversation object:",
                        JSON.stringify({
                            id: updatedConv.id,
                            last_message_at: updatedConv.last_message_at,
                            unread_count: updatedConv.unread_count,
                        })
                    );

                    return updatedConv;
                }
                return conv;
            });

            // Move the updated conversation to the top of the list
            const conversationToMove = updatedConversations.find(
                c => c.id === messageConversationId
            );
            if (conversationToMove) {
                const filteredConversations = updatedConversations.filter(
                    c => c.id !== messageConversationId
                );
                return [conversationToMove, ...filteredConversations];
            }

            return updatedConversations;
        });

        // Store the last received message to be processed by the effect that handles marking as read
        if (!isSelfMessage && messageConversationId === activeConversationId) {
            lastReceivedMessageRef.current = {
                id: messageId,
                conversationId: messageConversationId,
                timestamp: Date.now(),
            };
        }
    }

    function handleTypingIndicator(data: WebSocketMessageData) {
        const typingUserId = data.user_id as string;
        const typingUsername = data.username as string;
        const typingConversationId = data.conversation_id;

        // Don't show our own typing indicator
        if (typingUserId === user?.id || typingUserId === tempUserIdRef.current) {
            return;
        }

        console.log(
            `Typing indicator received from ${typingUsername} in conversation ${typingConversationId}`
        );

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
                    timestamp: Date.now(),
                };
            } else {
                // Add new entry
                updatedTypers = [
                    ...conversationTypers,
                    {
                        userId: typingUserId,
                        username: typingUsername,
                        timestamp: Date.now(),
                    },
                ];
            }

            return {
                ...prev,
                [typingConversationId]: updatedTypers,
            };
        });
    }

    function handleReadReceipt(data: WebSocketMessageData) {
        // Handle read receipts
        const messageIds = data.message_ids || (data.message_id ? [data.message_id] : []);
        const conversationId = data.conversation_id;
        const readerId = data.reader_id || "";

        console.log(
            `Read receipt received for conversation ${conversationId} by user ${readerId}`,
            { messageIds }
        );

        // Update message status for all affected messages
        setMessages(prev => {
            return prev.map(msg => {
                if (messageIds.includes(msg.id) && msg.sender_id === user?.id) {
                    return {
                        ...msg,
                        status: MessageStatusType.READ,
                    };
                }
                return msg;
            });
        });

        // If the reader is the current user, update the conversation's unread count in the list
        if (readerId === user?.id || readerId === tempUserIdRef.current) {
            setConversations(prev => {
                return prev.map(conv => {
                    if (conv.id === conversationId) {
                        console.log(
                            `Updating conversation ${conv.id} unread_count to 0 (was ${conv.unread_count || 0}) due to read receipt`
                        );
                        return {
                            ...conv,
                            unread_count: 0,
                        };
                    }
                    return conv;
                });
            });
        }
    }

    // Function to send a status update
    const sendStatusUpdate = useCallback(
        (status: "online" | "offline" | "away") => {
            if (!isConnected || !wsClientRef.current) return;

            wsClientRef.current.sendStatusUpdate(status);
            console.log(`Sent status update: ${status}`);
        },
        [isConnected, wsClientRef]
    );

    // Handler for global WebSocket messages
    const handleGlobalWebSocketMessage = useCallback(
        (message: WebSocketMessage) => {
            console.log("Global WebSocket message received:", message);
            console.log("HUUUUUUUUUUUMMMMMMM", message.type);
            console.log("HUUUUUUUUUUUMMMMMMM---", WebSocketMessageType.CONVERSATION_UPDATE);
            console.log(
                "HUUUUUUUUUUUMMMMMMMS---",
                message.type === WebSocketMessageType.CONVERSATION_UPDATE
            );
            if (!message || !message.type) {
                console.error("Invalid message format received in global WebSocket:", message);
                return;
            }

            switch (message.type) {
                case WebSocketMessageType.MESSAGE:
                    // Handle new message notification
                    if (
                        message.data &&
                        typeof message.data === "object" &&
                        "conversation_id" in message.data
                    ) {
                        const conversationId = message.data.conversation_id as string;
                        const messageId = (message.data.id ||
                            message.data.message_id ||
                            "") as string;
                        const senderId = (message.data.sender_id ||
                            message.data.user_id ||
                            "") as string;

                        // Don't process messages from ourselves
                        if (senderId === user?.id || senderId === tempUserIdRef.current) {
                            return;
                        }

                        // Update conversation with new last message
                        setConversations(prev => {
                            return prev.map(conv => {
                                if (conv.id === conversationId) {
                                    // Only increment unread count if this isn't the active conversation
                                    // or if the tab isn't visible
                                    const shouldIncrementUnread =
                                        conv.id !== activeConversationId || !document.hasFocus();

                                    const createdAt =
                                        (message.data.created_at as string) ||
                                        new Date().toISOString();

                                    // Create properly-typed last_message
                                    const newMessage: Message = {
                                        id: messageId,
                                        conversation_id: conversationId,
                                        sender_id: senderId,
                                        content: message.data.content as string,
                                        created_at: createdAt,
                                        updated_at: createdAt,
                                        message_type: MessageType.TEXT,
                                        is_encrypted: false,
                                        is_edited: false,
                                        is_deleted: false,
                                        is_forwarded: false,
                                    };

                                    // If this is the active conversation, also add to messages
                                    if (conv.id === activeConversationId) {
                                        // Add message to messages list if not already there
                                        setMessages(prevMessages => {
                                            if (!prevMessages.some(m => m.id === messageId)) {
                                                return [...prevMessages, newMessage];
                                            }
                                            return prevMessages;
                                        });
                                    }

                                    return {
                                        ...conv,
                                        last_message: newMessage,
                                        last_message_at: createdAt,
                                        unread_count: shouldIncrementUnread
                                            ? (conv.unread_count || 0) + 1
                                            : conv.unread_count || 0,
                                    };
                                }
                                return conv;
                            });
                        });
                    }
                    break;

                case WebSocketMessageType.CONVERSATION_UPDATE:
                    // Handle conversation update
                    if (
                        message.data &&
                        typeof message.data === "object" &&
                        "conversation_id" in message.data
                    ) {
                        // Just refresh the conversation list instead of trying to update it manually
                        // This is more reliable and avoids type issues
                        console.log("HUUUUUUUUUUUMMMMMMM===");
                        refreshConversations().catch(error => {
                            console.error("Error refreshing conversations after update:", error);
                        });
                    }
                    break;

                case WebSocketMessageType.READ_RECEIPT:
                    // Handle read receipt
                    if (
                        message.data &&
                        typeof message.data === "object" &&
                        "conversation_id" in message.data
                    ) {
                        const conversationId = message.data.conversation_id as string;

                        // Update conversation's unread count
                        setConversations(prev => {
                            return prev.map(conv => {
                                if (conv.id === conversationId) {
                                    return {
                                        ...conv,
                                        unread_count: 0,
                                    };
                                }
                                return conv;
                            });
                        });
                    }
                    break;

                case "connection_established":
                    // Connection established - send user presence
                    console.log("WebSocket connection established, sending user presence");
                    if (wsClientRef.current) {
                        // Notify server that user is online
                        setTimeout(() => {
                            sendStatusUpdate("online");
                        }, 500);
                    }
                    break;

                default:
                    console.log("Unhandled global message type:", message.type);
            }
        },
        [
            user?.id,
            tempUserIdRef,
            activeConversationId,
            refreshConversations,
            sendStatusUpdate,
            setMessages,
        ]
    );

    // Global WebSocket connection for user-specific events
    const connectToGlobalWebSocket = useCallback(async () => {
        if (!isAuthenticated || !user) return;

        try {
            // Get the auth token from localStorage
            const token = getAccessToken();

            // Close any existing WebSocket connection
            if (globalWsClientRef.current) {
                console.log("Closing existing global WebSocket connection");
                globalWsClientRef.current.disconnect();
                globalWsClientRef.current = null;
            }

            // Set WebSocket status to connecting
            setGlobalWebsocketStatus("connecting");

            // Create WebSocket client for global notifications
            globalWsClientRef.current = new WebSocketClient(
                "global", // Use 'global' as identifier for user-specific global notifications
                token,
                {
                    onOpen: () => {
                        console.log("Global WebSocket connection opened");
                        setGlobalWebsocketStatus("connected");
                        setIsGlobalConnected(true);
                    },
                    onMessage: message => {
                        console.log("Global WebSocket message received:", message);
                        handleGlobalWebSocketMessage(message);
                    },
                    onClose: () => {
                        console.log("Global WebSocket connection closed");
                        setGlobalWebsocketStatus("disconnected");
                        setIsGlobalConnected(false);
                    },
                    onError: error => {
                        console.error("Global WebSocket connection error", error);
                        setGlobalWebsocketStatus("error");
                        setIsGlobalConnected(false);
                        setError("Global WebSocket connection error");
                    },
                    debug: true,
                },
                true // Set isGlobalConnection to true for global WebSocket
            );

            // Connect to WebSocket
            console.log("Connecting to global WebSocket");
            await globalWsClientRef.current.connect();
        } catch (error) {
            console.error("Error connecting to global WebSocket:", error);
            setIsGlobalConnected(false);
            setError(
                `Unable to connect to global WebSocket: ${error instanceof Error ? error.message : String(error)}`
            );
            setGlobalWebsocketStatus("error");
        }
    }, [isAuthenticated, user, getAccessToken, handleGlobalWebSocketMessage]);

    // Initialize global WebSocket connection on app startup
    useEffect(() => {
        if (isAuthenticated && user) {
            connectToGlobalWebSocket();
        }

        return () => {
            // Clean up global WebSocket connection on unmount
            if (globalWsClientRef.current) {
                globalWsClientRef.current.disconnect();
                globalWsClientRef.current = null;
            }
        };
    }, [isAuthenticated, user, connectToGlobalWebSocket]);

    // Auto mark messages as read when conversation is viewed
    useEffect(() => {
        if (activeConversationId) {
            // Update visible messages status
            updateVisibleMessagesStatus(messages.map(msg => msg.id));
        }
    }, [activeConversationId, isAuthenticated, updateVisibleMessagesStatus, markAsRead, messages]);

    // Handle message notifications and updates
    useEffect(() => {
        if (!globalViewRef.current) return;

        // Stocker la référence actuelle dans une variable locale
        const currentViewRef = globalViewRef.current;

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateVisibleMessagesStatus(messages.map(msg => msg.id));
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
            users.forEach(user => {
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
            Object.values(typingTimeouts).forEach(timeout => {
                clearTimeout(timeout);
            });
        };
    }, [typingUsers, removeTypingUser]);

    // Mark conversation as read when viewing it
    useEffect(() => {
        if (!activeConversationId || !isAuthenticated) return;

        try {
            markAsRead(activeConversationId).catch(error =>
                console.error("Error marking conversation as read:", error)
            );

            // Update messages status
            updateVisibleMessagesStatus(messages.map(msg => msg.id));
        } catch (error) {
            console.error("Error marking conversation as read:", error);
        }
    }, [activeConversationId, isAuthenticated, updateVisibleMessagesStatus, markAsRead, messages]);

    // Helper function to sort conversations by date
    const sortConversationsByDate = useCallback((convs: Conversation[]): Conversation[] => {
        return [...convs].sort((a, b) => {
            const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return dateB - dateA;
        });
    }, []);

    // Debounced version of refreshConversations
    const refreshConversationsDebounced = useCallback(() => {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        // Set a new timeout
        refreshTimeoutRef.current = setTimeout(() => {
            refreshConversations().catch(error => {
                console.error("Error during debounced refresh:", error);
            });
        }, 300);
    }, [refreshConversations]);

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
        sendStatusUpdate,
        globalWebsocketStatus,
        isGlobalConnected,
    };

    return <MessagingContext.Provider value={contextValue}>{children}</MessagingContext.Provider>;
}

// Hook to use the messaging context
const useMessaging = (): MessagingContextType => {
    const context = useContext(MessagingContext);
    if (context === undefined) {
        throw new Error("useMessaging must be used inside a MessagingProvider");
    }
    return context;
};

// Export the provider and hook
export { MessagingProvider, useMessaging };

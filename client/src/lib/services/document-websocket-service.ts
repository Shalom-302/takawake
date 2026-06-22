import { WebSocketClient, WebSocketMessage } from "@/lib/services";

// Document WebSocket message types
export enum DocumentWebSocketMessageType {
    DOCUMENT_UPDATE = "document_update",
    SIGNATURE_ADD = "signature_add",
    WORKFLOW_STATUS_CHANGE = "workflow_status_change",
    CERTIFICATE_REQUEST_STATUS = "certificate_request_status",
}

// Message interfaces
export interface DocumentUpdateMessage {
    document_id: string;
    updated_at: string;
    updated_by: string;
    changes: {
        field: string;
        value: unknown;
    }[];
}

export interface SignatureAddMessage {
    document_id: string;
    signature_id: string;
    signatory_id: string;
    signatory_email: string;
    signed_at: string;
    signature_type: string;
}

export interface WorkflowStatusChangeMessage {
    document_id: string;
    current_step: string;
    next_step: string | null;
    progress: number;
    pending_actions: string[];
}

export interface CertificateRequestStatusMessage {
    request_id: string;
    status: "pending" | "approved" | "rejected";
    certificate_info?: {
        subject: string;
        issuer: string;
        valid_from: string;
        valid_until: string;
    };
}

/**
 * DocumentWebSocketService: Handles real-time updates for document-related events
 *
 * Uses the WebSocketClient singleton for connection management and message deduplication.
 * Provides typed handlers for different document event types.
 */
export class DocumentWebSocketService {
    private static instance: DocumentWebSocketService;
    private websocketClient: WebSocketClient;
    private documentUpdateHandlers: ((message: DocumentUpdateMessage) => void)[] = [];
    private signatureAddHandlers: ((message: SignatureAddMessage) => void)[] = [];
    private workflowStatusHandlers: ((message: WorkflowStatusChangeMessage) => void)[] = [];
    private certificateRequestHandlers: ((message: CertificateRequestStatusMessage) => void)[] = [];
    private isConnected: boolean = false;
    private url: string | null = null;

    private constructor() {
        this.websocketClient = WebSocketClient.getInstance();
        this.initializeMessageHandlers();
    }

    public static getInstance(): DocumentWebSocketService {
        if (!DocumentWebSocketService.instance) {
            DocumentWebSocketService.instance = new DocumentWebSocketService();
        }
        return DocumentWebSocketService.instance;
    }

    /**
     * Connect to the document WebSocket service
     * @param url WebSocket server URL
     */
    public connect(url: string): void {
        if (this.isConnected && this.url === url) {
            console.log("DocumentWebSocketService: Already connected to this URL");
            return;
        }

        // Store the URL for reconnection purposes
        this.url = url;

        try {
            this.websocketClient.connect(url);
            this.isConnected = true;
            console.log("DocumentWebSocketService: Connected to", url);
        } catch (error) {
            console.error("DocumentWebSocketService: Connection error:", error);
            this.isConnected = false;
        }
    }

    /**
     * Disconnect from the document WebSocket service
     */
    public disconnect(): void {
        try {
            if (this.isConnected) {
                this.websocketClient.disconnect();
                console.log("DocumentWebSocketService: Disconnected");
            }
        } catch (error) {
            console.error("DocumentWebSocketService: Error during disconnect:", error);
        } finally {
            this.isConnected = false;
            this.url = null;
        }
    }

    /**
     * Check if the service is currently connected
     */
    public getConnectionStatus(): boolean {
        return this.websocketClient.isConnected();
    }

    /**
     * Initialize handlers for different message types
     */
    private initializeMessageHandlers() {
        this.websocketClient.addMessageHandler((message: WebSocketMessage) => {
            try {
                // Message is already parsed by WebSocketClient

                switch (message.type) {
                    case DocumentWebSocketMessageType.DOCUMENT_UPDATE:
                        this.handleDocumentUpdate(message.data as unknown as DocumentUpdateMessage);
                        break;
                    case DocumentWebSocketMessageType.SIGNATURE_ADD:
                        this.handleSignatureAdd(message.data as unknown as SignatureAddMessage);
                        break;
                    case DocumentWebSocketMessageType.WORKFLOW_STATUS_CHANGE:
                        this.handleWorkflowStatusChange(
                            message.data as unknown as WorkflowStatusChangeMessage
                        );
                        break;
                    case DocumentWebSocketMessageType.CERTIFICATE_REQUEST_STATUS:
                        this.handleCertificateRequestStatus(
                            message.data as unknown as CertificateRequestStatusMessage
                        );
                        break;
                    default:
                        console.log("DocumentWebSocketService: Unknown message type", message.type);
                }
            } catch (error) {
                console.error("DocumentWebSocketService: Error processing message:", error);
            }
        });
    }

    /**
     * Send a document-related message through the WebSocket
     * @param type The message type
     * @param data The message data
     * @returns True if message was sent successfully
     */
    public sendMessage<T extends Record<string, unknown>>(
        type: DocumentWebSocketMessageType,
        data: T
    ): boolean {
        if (!this.isConnected) {
            console.error("DocumentWebSocketService: Cannot send message, not connected");
            return false;
        }

        const message: WebSocketMessage = {
            id: this.generateMessageId(),
            type,
            data,
            timestamp: new Date().toISOString(),
        };

        return this.websocketClient.sendMessage(message);
    }

    /**
     * Generate a unique message ID
     */
    private generateMessageId(): string {
        return `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Message type handlers
    private handleDocumentUpdate(data: DocumentUpdateMessage) {
        this.documentUpdateHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error("DocumentWebSocketService: Error in document update handler:", error);
            }
        });
    }

    private handleSignatureAdd(data: SignatureAddMessage) {
        this.signatureAddHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error("DocumentWebSocketService: Error in signature add handler:", error);
            }
        });
    }

    private handleWorkflowStatusChange(data: WorkflowStatusChangeMessage) {
        this.workflowStatusHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error("DocumentWebSocketService: Error in workflow status handler:", error);
            }
        });
    }

    private handleCertificateRequestStatus(data: CertificateRequestStatusMessage) {
        this.certificateRequestHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(
                    "DocumentWebSocketService: Error in certificate request handler:",
                    error
                );
            }
        });
    }

    // Public methods to add/remove handlers
    public addDocumentUpdateHandler(handler: (message: DocumentUpdateMessage) => void) {
        this.documentUpdateHandlers.push(handler);
        return () => this.removeDocumentUpdateHandler(handler);
    }

    public removeDocumentUpdateHandler(handler: (message: DocumentUpdateMessage) => void) {
        this.documentUpdateHandlers = this.documentUpdateHandlers.filter(h => h !== handler);
    }

    public addSignatureAddHandler(handler: (message: SignatureAddMessage) => void) {
        this.signatureAddHandlers.push(handler);
        return () => this.removeSignatureAddHandler(handler);
    }

    public removeSignatureAddHandler(handler: (message: SignatureAddMessage) => void) {
        this.signatureAddHandlers = this.signatureAddHandlers.filter(h => h !== handler);
    }

    public addWorkflowStatusHandler(handler: (message: WorkflowStatusChangeMessage) => void) {
        this.workflowStatusHandlers.push(handler);
        return () => this.removeWorkflowStatusHandler(handler);
    }

    public removeWorkflowStatusHandler(handler: (message: WorkflowStatusChangeMessage) => void) {
        this.workflowStatusHandlers = this.workflowStatusHandlers.filter(h => h !== handler);
    }

    public addCertificateRequestHandler(
        handler: (message: CertificateRequestStatusMessage) => void
    ) {
        this.certificateRequestHandlers.push(handler);
        return () => this.removeCertificateRequestHandler(handler);
    }

    public removeCertificateRequestHandler(
        handler: (message: CertificateRequestStatusMessage) => void
    ) {
        this.certificateRequestHandlers = this.certificateRequestHandlers.filter(
            h => h !== handler
        );
    }
}

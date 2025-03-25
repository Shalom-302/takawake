import { WebSocketClient } from '@/lib/services/websocket-service';

// Types de messages WebSocket pour les documents
export enum DocumentWebSocketMessageType {
  DOCUMENT_UPDATE = 'document_update',
  SIGNATURE_ADD = 'signature_add',
  WORKFLOW_STATUS_CHANGE = 'workflow_status_change',
  CERTIFICATE_REQUEST_STATUS = 'certificate_request_status'
}

// Interfaces pour les messages
export interface DocumentUpdateMessage {
  document_id: string;
  updated_at: string;
  updated_by: string;
  changes: {
    field: string;
    value: any;
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
  status: 'pending' | 'approved' | 'rejected';
  certificate_info?: {
    subject: string;
    issuer: string;
    valid_from: string;
    valid_until: string;
  };
}

// Service de WebSocket pour les documents
export class DocumentWebSocketService {
  private static instance: DocumentWebSocketService;
  private websocketClient: WebSocketClient;
  private documentUpdateHandlers: ((message: DocumentUpdateMessage) => void)[] = [];
  private signatureAddHandlers: ((message: SignatureAddMessage) => void)[] = [];
  private workflowStatusHandlers: ((message: WorkflowStatusChangeMessage) => void)[] = [];
  private certificateRequestHandlers: ((message: CertificateRequestStatusMessage) => void)[] = [];

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

  private initializeMessageHandlers() {
    this.websocketClient.addMessageHandler((message) => {
      try {
        const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;
        
        switch(parsedMessage.type) {
          case DocumentWebSocketMessageType.DOCUMENT_UPDATE:
            this.handleDocumentUpdate(parsedMessage.data);
            break;
          case DocumentWebSocketMessageType.SIGNATURE_ADD:
            this.handleSignatureAdd(parsedMessage.data);
            break;
          case DocumentWebSocketMessageType.WORKFLOW_STATUS_CHANGE:
            this.handleWorkflowStatusChange(parsedMessage.data);
            break;
          case DocumentWebSocketMessageType.CERTIFICATE_REQUEST_STATUS:
            this.handleCertificateRequestStatus(parsedMessage.data);
            break;
        }
      } catch (error) {
        console.error('Error processing document WebSocket message:', error);
      }
    });
  }

  // Handlers pour chaque type de message
  private handleDocumentUpdate(data: DocumentUpdateMessage) {
    this.documentUpdateHandlers.forEach(handler => handler(data));
  }

  private handleSignatureAdd(data: SignatureAddMessage) {
    this.signatureAddHandlers.forEach(handler => handler(data));
  }

  private handleWorkflowStatusChange(data: WorkflowStatusChangeMessage) {
    this.workflowStatusHandlers.forEach(handler => handler(data));
  }

  private handleCertificateRequestStatus(data: CertificateRequestStatusMessage) {
    this.certificateRequestHandlers.forEach(handler => handler(data));
  }

  // Méthodes publiques pour ajouter/supprimer des handlers
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

  public addCertificateRequestHandler(handler: (message: CertificateRequestStatusMessage) => void) {
    this.certificateRequestHandlers.push(handler);
    return () => this.removeCertificateRequestHandler(handler);
  }

  public removeCertificateRequestHandler(handler: (message: CertificateRequestStatusMessage) => void) {
    this.certificateRequestHandlers = this.certificateRequestHandlers.filter(h => h !== handler);
  }
}

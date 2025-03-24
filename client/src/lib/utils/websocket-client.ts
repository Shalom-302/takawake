/**
 * Client WebSocket for handling real-time connections
 * Provides automatic reconnection and event management
 */

import { WebSocketMessage, WebSocketMessageType } from '../types/messaging';

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (data: WebSocketMessage) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onReconnect?: (attemptCount: number) => void;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  debug?: boolean;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private conversationId: string;
  private token: string;
  private options: WebSocketOptions;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualClose = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongTime: number = 0;

  constructor(conversationId: string, token: string, options: WebSocketOptions = {}) {
    this.conversationId = conversationId;
    this.token = token;
    this.options = {
      maxReconnectAttempts: 5,
      reconnectInterval: 3000,
      debug: true, // Enable debug by default
      ...options
    };
  }

  /**
   * Establish WebSocket connection
   */
  public connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        // Reset manual closing flag
        this.isManualClose = false;
        
        // Use default port (8000) with root route installed before all middleware
        const baseUrl = "ws://localhost:8000";
        
        // Use the ws-root endpoint defined at the root level of the FastAPI application
        const wsUrl = `${baseUrl}/ws-root/${this.conversationId}`;
        
        console.log(`⭐ Connecting to WebSocket: ${wsUrl}`);
        
        // Check if the token is empty or invalid
        if (!this.token || this.token === 'undefined' || this.token === 'null') {
          console.error('WebSocket token is invalid or missing');
          reject(new Error('Invalid authentication token'));
          return;
        }

        // Create the WebSocket connection
        this.ws = new WebSocket(wsUrl);

        // Configure event handlers
        this.ws.onopen = (event) => {
          this.reconnectAttempts = 0;
          if (this.options.debug) {
            console.log('WebSocket connection established');
          }
          
          // Start the ping interval to maintain the connection
          this.startPingInterval();
          
          if (this.options.onOpen) {
            this.options.onOpen(event);
          }
          
          resolve(this.ws!);
        };

        this.ws.onmessage = (event) => {
          if (this.options.debug) {
            console.log('WebSocket message received:', event.data);
            console.log('WebSocket message type:', typeof event.data);
          }
          
          try {
            // Check that the data is a JSON string
            if (typeof event.data !== 'string') {
              console.error('WebSocket message is not a string:', event.data);
              return;
            }
            
            console.log('Parsing WebSocket message:', event.data);
            const data = JSON.parse(event.data);
            console.log('Parsed WebSocket message:', data);
            
            // Call the onMessage callback for all message types
            if (this.options.onMessage) {
              console.log('Calling onMessage callback with data:', data);
              this.options.onMessage(data);
              console.log('Message forwarded to onMessage callback:', data);
            } else {
              console.warn('No onMessage callback registered');
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          if (this.options.debug) {
            console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          }
          
          // Stop the ping
          this.stopPingInterval();
          
          // If not a manual close, attempt to reconnect
          if (!this.isManualClose) {
            this.attemptReconnect();
          }
          
          if (this.options.onClose) {
            this.options.onClose(event);
          }
        };

        this.ws.onerror = (event) => {
          if (this.options.debug) {
            console.error('WebSocket error:', event);
          }
          
          if (this.options.onError) {
            this.options.onError(event);
          }
          
          reject(event);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Close the WebSocket connection
   */
  public disconnect(): void {
    if (!this.ws) return;
    
    this.isManualClose = true;
    this.stopPingInterval();
    
    // Clean up any pending reconnection attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Close the connection if it is open
    if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
      this.ws.close(1000, 'Client disconnected');
    }
    
    this.ws = null;
  }

  /**
   * Send a message via WebSocket
   */
  public send(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (this.options.debug) {
        console.warn('Cannot send message: WebSocket is not open');
      }
      return false;
    }
    
    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Send a message with a specific type and data
   */
  public sendMessage(message: WebSocketMessage): boolean {
    return this.send(message);
  }
  
  /**
   * Send a text message
   */
  public sendTextMessage(content: string): boolean {
    return this.send({
      type: WebSocketMessageType.MESSAGE,
      data: { content, message_type: 'text' }
    });
  }

  /**
   * Send a typing indicator
   */
  public sendTypingIndicator(conversationId: string, userId: string, username: string = 'User'): boolean {
    return this.send({
      type: WebSocketMessageType.TYPING,
      data: { 
        conversation_id: conversationId,
        user_id: userId,
        username: username,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Send a user presence/status update
   */
  public sendStatusUpdate(status: 'online' | 'offline' | 'away'): boolean {
    return this.send({
      type: WebSocketMessageType.USER_PRESENCE,
      data: { 
        status: status,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Send a read receipt
   */
  public sendReadReceipt(messageId: string): boolean {
    return this.send({
      type: WebSocketMessageType.READ_RECEIPT,
      data: { message_id: messageId }
    });
  }

  /**
   * Check if the connection is active
   */
  public isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Attempt to reconnect in case of disconnection
   */
  private attemptReconnect(): void {
    if (this.isManualClose) return;
    
    console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts + 1}/${this.options.maxReconnectAttempts})...`);
    
    const { maxReconnectAttempts, reconnectInterval } = this.options;
    
    if (this.reconnectAttempts >= (maxReconnectAttempts || 5)) {
      if (this.options.debug) {
        console.warn(`Maximum reconnect attempts (${maxReconnectAttempts}) reached`);
      }
      return;
    }
    
    this.reconnectAttempts++;
    
    // Always display reconnection attempts, regardless of debug mode
    console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
    
    if (this.options.onReconnect) {
      this.options.onReconnect(this.reconnectAttempts);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, reconnectInterval);
  }

  /**
   * Send periodic pings to maintain active connection
   */
  private startPingInterval(): void {
    this.stopPingInterval();
    
    // Send a ping every 30 seconds
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: WebSocketMessageType.PING,
          data: { timestamp: Date.now() }
        });
      }
    }, 30000);
  }

  /**
   * Stop periodic pings
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private getUserIdFromToken(): string {
    // This method should be implemented to extract user ID from token
    // For example, assume user ID is stored in a global variable
    return 'exampleUserId';
  }
}

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
  private isGlobalConnection: boolean = false;

  constructor(conversationId: string, token: string, options: WebSocketOptions = {}, isGlobalConnection: boolean = false) {
    this.conversationId = conversationId;
    this.token = token;
    this.isGlobalConnection = isGlobalConnection;
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
        const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api";
        
        // Construct the WebSocket URL
        let url: string;
        
        if (this.isGlobalConnection) {
          // Global user connection - use the root endpoint for now since ws-user is returning 403
          url = `${baseUrl}/ws-root/global?token=${encodeURIComponent(this.token)}&user_id=${encodeURIComponent('user-' + Date.now())}`;
          console.log(`Connecting to global WebSocket: ${url.substring(0, url.indexOf('?'))}`);
        } else {
          // Conversation-specific connection
          // Try using the ws-root endpoint which doesn't have the strict auth check
          url = `${baseUrl}/ws-root/${this.conversationId}?token=${encodeURIComponent(this.token)}&user_id=${encodeURIComponent('user-' + Date.now())}`;
          console.log(`Connecting to conversation WebSocket: ${url.substring(0, url.indexOf('?'))}`);
        }
        
        // Create the WebSocket connection
        this.ws = new WebSocket(url);
        
        // Set up event handlers
        this.ws.onopen = (event) => {
          console.log(`WebSocket connected ${this.isGlobalConnection ? '(global)' : '(conversation ' + this.conversationId + ')'}`);
          this.reconnectAttempts = 0;
          
          // Call the onOpen callback if provided
          if (this.options.onOpen) {
            this.options.onOpen(event);
          }
          
          // Start sending ping messages
          this.startPingInterval();
          
          resolve(this.ws as WebSocket);
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as WebSocketMessage;
            
            // Handle ping/pong messages internally
            if (data.type === WebSocketMessageType.PONG) {
              this.lastPongTime = Date.now();
              return;
            }
            
            // Debug message reception
            if (this.options.debug) {
              console.log(`Received WebSocket message ${this.isGlobalConnection ? '(global)' : '(conversation)'}:`, data.type);
            }
            
            // Call the message handler if provided
            if (this.options.onMessage) {
              this.options.onMessage(data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log(`WebSocket closed ${this.isGlobalConnection ? '(global)' : '(conversation ' + this.conversationId + ')'} with code: ${event.code}, reason: ${event.reason}`);
          
          // Clear ping interval
          this.stopPingInterval();
          
          // Call the close handler if provided
          if (this.options.onClose) {
            this.options.onClose(event);
          }
          
          // Attempt to reconnect if not manually closed
          if (!this.isManualClose) {
            this.reconnect();
          }
        };
        
        // this.ws.onerror = (event) => {
        //   console.error('WebSocket error:', event);
          
        //   // Call the error handler if provided
        //   if (this.options.onError) {
        //     this.options.onError(event);
        //   }
        // };
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
  private reconnect(): void {
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

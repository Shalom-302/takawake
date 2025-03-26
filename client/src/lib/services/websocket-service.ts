/**
 * WebSocketClient: A singleton client for WebSocket connections with message deduplication
 * 
 * Features:
 * - Connection management with automatic reconnection
 * - Message deduplication to prevent duplicate processing
 * - Support for message handlers with typed callbacks
 * - Proper cleanup and lifecycle management
 */

// Default WebSocket configuration
const DEFAULT_RECONNECT_INTERVAL = 3000; // 3 seconds
const DEFAULT_MESSAGE_CACHE_SIZE = 100;  // Store the last 100 processed message IDs

export interface WebSocketMessage {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export class WebSocketClient {
  private static instance: WebSocketClient;
  private socket: WebSocket | null = null;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private reconnectInterval: number;
  private connectionUrl: string | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionActive: boolean = false;
  
  // Message deduplication cache
  private processedMessageIds: Set<string> = new Set();
  private maxCacheSize: number;

  private constructor(reconnectInterval = DEFAULT_RECONNECT_INTERVAL, maxCacheSize = DEFAULT_MESSAGE_CACHE_SIZE) {
    this.reconnectInterval = reconnectInterval;
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Get the singleton instance of WebSocketClient
   */
  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  /**
   * Connect to a WebSocket server
   * @param url The WebSocket server URL
   */
  public connect(url: string): void {
    if (this.socket && this.connectionActive) {
      console.log('WebSocket: Already connected, ignoring connect call');
      return;
    }

    this.connectionUrl = url;
    
    try {
      this.socket = new WebSocket(url);
      this.setupSocketHandlers();
    } catch (error) {
      console.error('WebSocket: Error creating connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.connectionUrl = null;
    this.connectionActive = false;

    if (!this.socket) return;

    try {
      this.socket.close();
    } catch (error) {
      console.error('WebSocket: Error during disconnect:', error);
    } finally {
      this.socket = null;
    }
  }

  /**
   * Add a message handler that will be called for each received message
   * @param handler The handler function to be called
   * @returns A function to remove this handler
   */
  public addMessageHandler(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => this.removeMessageHandler(handler);
  }

  /**
   * Remove a message handler
   * @param handler The handler function to remove
   */
  public removeMessageHandler(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  /**
   * Send a message through the WebSocket connection
   * @param message The message to send
   * @returns True if the message was sent, false otherwise
   */
  public sendMessage(message: WebSocketMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket: Cannot send message, socket not open');
      return false;
    }

    try {
      // If the message has an ID, we mark it as processed to avoid 
      // processing it again when it comes back via the WebSocket
      if (message.id) {
        this.addProcessedMessageId(message.id);
      }

      const messageStr = JSON.stringify(message);
      this.socket.send(messageStr);
      console.log('WebSocket: Message sent successfully');
      return true;
    } catch (error) {
      console.error('WebSocket: Error sending message:', error);
      return false;
    }
  }

  /**
   * Check if the WebSocket connection is currently active
   * @returns True if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN && this.connectionActive;
  }

  /**
   * Add a message ID to the processed messages cache to avoid duplicate processing
   * @param messageId The unique ID of the message
   */
  public addProcessedMessageId(messageId: string): void {
    this.processedMessageIds.add(messageId);
    
    // Maintain cache size by removing oldest entries
    if (this.processedMessageIds.size > this.maxCacheSize) {
      const iterator = this.processedMessageIds.values();
      const firstValue = iterator.next().value;
      if (firstValue) {
        this.processedMessageIds.delete(firstValue);
      }
    }
  }

  /**
   * Check if a message ID has been processed already
   * @param messageId The unique ID of the message to check
   * @returns True if the message has been processed, false otherwise
   */
  public hasProcessedMessage(messageId: string): boolean {
    return this.processedMessageIds.has(messageId);
  }

  /**
   * Clear the processed messages cache
   */
  public clearProcessedMessageIds(): void {
    this.processedMessageIds.clear();
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket: Connection established');
      this.connectionActive = true;
      
      // Clear any pending reconnect attempts
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        let message: WebSocketMessage;
        
        if (typeof event.data === 'string') {
          message = JSON.parse(event.data) as WebSocketMessage;
        } else {
          console.error('WebSocket: Received non-string message data:', event.data);
          return;
        }

        // Deduplication: Only process messages we haven't seen before
        if (message.id && this.hasProcessedMessage(message.id)) {
          console.log(`WebSocket: Skipping duplicate message with ID: ${message.id}`);
          return;
        }
        
        // Mark this message as processed
        if (message.id) {
          this.addProcessedMessageId(message.id);
        }

        console.log('WebSocket: Message received:', message);
        
        // Call all registered handlers
        this.messageHandlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('WebSocket: Error in message handler:', error);
          }
        });
      } catch (error) {
        console.error('WebSocket: Error parsing message:', error);
      }
    };

    this.socket.onclose = (event) => {
      this.connectionActive = false;
      console.log(`WebSocket: Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      
      // Attempt to reconnect if we have a connection URL
      if (this.connectionUrl) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket: Error:', error);
      this.connectionActive = false;
    };
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (!this.connectionUrl) return;

    console.log(`WebSocket: Scheduling reconnect in ${this.reconnectInterval}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log('WebSocket: Attempting to reconnect...');
      if (this.connectionUrl !== null) {
        this.connect(this.connectionUrl);
      }
    }, this.reconnectInterval);
  }
}

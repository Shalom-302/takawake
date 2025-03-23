/**
 * Client WebSocket pour la gestion des connexions en temps réel
 * Fournit des fonctionnalités de reconnexion automatique et de gestion d'événements
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
      debug: true, // Activer le debug par défaut
      ...options
    };
  }

  /**
   * Établir la connexion WebSocket
   */
  public connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        // Réinitialiser le flag de fermeture manuelle
        this.isManualClose = false;
        
        // Utiliser le port par défaut (8000) avec la route racine qui est installée avant tout middleware
        const baseUrl = "ws://localhost:8000";
        
        // Utiliser l'endpoint ws-root qui est défini au niveau racine de l'application FastAPI
        const wsUrl = `${baseUrl}/ws-root/${this.conversationId}`;
        
        // Toujours afficher l'URL pour le débogage pendant le développement
        console.log(`Connecting to WebSocket: ${wsUrl}`);
        console.log(`Using token: ${this.token.substring(0, 10)}...`);
        
        // Vérifier si le token est vide ou invalide
        if (!this.token || this.token === 'undefined' || this.token === 'null') {
          console.error('WebSocket token is invalid or missing');
          reject(new Error('Invalid authentication token'));
          return;
        }

        // Créer la connexion WebSocket
        this.ws = new WebSocket(wsUrl);

        // Configurer les gestionnaires d'événements
        this.ws.onopen = (event) => {
          this.reconnectAttempts = 0;
          if (this.options.debug) {
            console.log('WebSocket connection established');
          }
          
          // Démarrer le ping pour maintenir la connexion active
          this.startPingInterval();
          
          if (this.options.onOpen) {
            this.options.onOpen(event);
          }
          
          resolve(this.ws!);
        };

        this.ws.onmessage = (event) => {
          if (this.options.debug) {
            console.log('WebSocket message received:', event.data);
          }
          
          try {
            const data = JSON.parse(event.data);
            
            // Traitement spécifique pour les nouveaux messages
            if (data.type === 'new_message' && data.data) {
              console.log('New message received from WebSocket:', data.data);
              
              // Déclencher une mise à jour de l'interface
              // L'événement sera capturé par les composants pour actualiser les listes de messages
              const customEvent = new CustomEvent('kaapi:new-message', { 
                detail: { 
                  message: data.data,
                  conversationId: this.conversationId 
                } 
              });
              window.dispatchEvent(customEvent);
            }
            
            // Traitement spécifique pour les indicateurs de frappe
            if (data.type === 'typing_indicator' && data.data) {
              console.log('Typing indicator received:', data.data);
              
              // Déclencher une mise à jour de l'interface pour les indicateurs de frappe
              const typingEvent = new CustomEvent('kaapi:typing-indicator', { 
                detail: data.data 
              });
              window.dispatchEvent(typingEvent);
            }
            
            // Appel du gestionnaire général fourni par l'utilisateur
            if (this.options.onMessage) {
              this.options.onMessage(data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          if (this.options.debug) {
            console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          }
          
          // Arrêter le ping
          this.stopPingInterval();
          
          // Si ce n'est pas une fermeture manuelle, tenter une reconnexion
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
   * Fermer la connexion WebSocket
   */
  public disconnect(): void {
    if (!this.ws) return;
    
    this.isManualClose = true;
    this.stopPingInterval();
    
    // Nettoyer toute tentative de reconnexion en attente
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Fermer proprement la connexion si elle est ouverte
    if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
      this.ws.close(1000, 'Client disconnected');
    }
    
    this.ws = null;
  }

  /**
   * Envoyer un message via WebSocket
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
   * Envoyer un message texte
   */
  public sendTextMessage(content: string): boolean {
    return this.send({
      type: WebSocketMessageType.MESSAGE,
      data: { content, message_type: 'text' }
    });
  }

  /**
   * Envoyer une notification de frappe
   */
  public sendTypingIndicator(isTyping: boolean): boolean {
    return this.send({
      type: WebSocketMessageType.TYPING,
      data: { is_typing: isTyping }
    });
  }

  /**
   * Envoyer un accusé de lecture
   */
  public sendReadReceipt(messageId: string): boolean {
    return this.send({
      type: WebSocketMessageType.READ_RECEIPT,
      data: { message_id: messageId }
    });
  }

  /**
   * Vérifier si la connexion est active
   */
  public isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Tenter une reconnexion en cas de déconnexion
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
    
    // Toujours afficher les tentatives de reconnexion, indépendamment du mode debug
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
   * Envoyer des pings périodiques pour maintenir la connexion active
   */
  private startPingInterval(): void {
    this.stopPingInterval();
    
    // Envoyer un ping toutes les 30 secondes
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
   * Arrêter les pings périodiques
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private getUserIdFromToken(): string {
    // Cette méthode devrait être implémentée pour extraire l'ID utilisateur du token
    // Pour l'exemple, on suppose que l'ID utilisateur est stocké dans une variable globale
    return 'exampleUserId';
  }
}

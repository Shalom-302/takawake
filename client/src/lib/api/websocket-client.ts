/**
 * Client WebSocket pour la messagerie en temps réel
 * 
 * Ce client gère :
 * - La connexion/déconnexion au WebSocket
 * - La reconnexion automatique en cas de déconnexion
 * - Les callbacks pour les événements (ouverture, message, erreur, etc.)
 * - L'envoi de messages avec formatage approprié
 */

// Fonction pour construire l'URL WebSocket à partir de l'URL API
function getWebSocketUrl(conversationId: string, token?: string): string {
  // Récupérer l'URL de base depuis les variables d'environnement ou utiliser une valeur par défaut
  let baseURL = process.env.NEXT_PUBLIC_WS_URL || '';
  
  // Si aucune URL WebSocket n'est spécifiée, dériver de l'URL API
  if (!baseURL && process.env.NEXT_PUBLIC_API_URL) {
    // Convertir de HTTP à WS ou de HTTPS à WSS
    baseURL = process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws');
  }
  
  // Fallback sur localhost si aucune URL n'est configurée
  if (!baseURL) {
    baseURL = 'ws://localhost:8000';
  }
  
  console.log(`Using WebSocket base URL: ${baseURL}`);
  
  // Construire l'URL complète
  const url = `${baseURL}/messaging/ws/${conversationId}`;
  
  // Ajouter le token comme paramètre de requête s'il est fourni
  if (token) {
    return `${url}?token=${encodeURIComponent(token)}`;
  }
  
  return url;
}

// Types d'événements
export enum WebSocketMessageType {
  MESSAGE = 'message',
  TYPING = 'typing',
  READ_RECEIPT = 'read',
  SYSTEM = 'system',
  ERROR = 'error',
  PONG = 'pong'
}

interface WebSocketOptions {
  debug?: boolean;
  reconnectIntervalMs?: number;
  reconnectAttempts?: number;
  onOpen?: () => void;
  onMessage?: (data: Record<string, unknown>) => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  onReconnect?: (attempt: number) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectInterval: number;
  private reconnectAttempts: number;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentAttempt: number = 0;
  private debug: boolean;
  private isConnecting: boolean = false;
  private forceClosed: boolean = false;

  private url: string;
  private token: string;
  private options: WebSocketOptions;

  constructor(conversationId: string, token: string, options: WebSocketOptions = {}) {
    this.url = getWebSocketUrl(conversationId, token);
    this.token = token;
    this.options = options;
    this.debug = options.debug || false;
    this.reconnectInterval = options.reconnectIntervalMs || 2000;
    this.reconnectAttempts = options.reconnectAttempts || 10;
  }

  /**
   * Vérifie si le client est connecté
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Établit la connexion WebSocket
   */
  public async connect(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      this.log('WebSocket déjà connecté ou en cours de connexion');
      return;
    }
    
    if (this.isConnecting) {
      this.log('Connexion WebSocket déjà en cours');
      return;
    }
    
    // Réinitialiser l'état de fermeture forcée lors d'une nouvelle tentative de connexion
    this.forceClosed = false;
    this.isConnecting = true;
    
    return new Promise<void>((resolve, reject) => {
      try {
        this.log(`Connexion WebSocket à ${this.url}`);
        
        // Création du WebSocket avec gestion des timeouts
        this.ws = new WebSocket(this.url);
        
        // Définir un timeout pour la connexion
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.log('Timeout de connexion WebSocket');
            this.ws.close();
            this.isConnecting = false;
            reject(new Error('Timeout de connexion WebSocket'));
          }
        }, 10000); // 10 secondes de timeout
        
        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          this.log('WebSocket connecté');
          this.isConnecting = false;
          this.currentAttempt = 0;
          
          // Nous n'envoyons plus le token ici car il est déjà dans l'URL
          // this.sendAuthToken();
          
          // Appeler le callback onOpen si défini
          if (this.options.onOpen) {
            this.options.onOpen();
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as Record<string, unknown>;
            this.log('Message reçu:', data);
            
            // Appeler le callback onMessage si défini
            if (this.options.onMessage) {
              this.options.onMessage(data);
            }
          } catch (error) {
            this.log('Erreur de parsing JSON:', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout); // S'assurer que le timeout est nettoyé
          this.log(`WebSocket fermé avec code: ${event.code}, raison: ${event.reason || 'Non spécifiée'}`);
          this.isConnecting = false;
          
          // Informations de débogage supplémentaires sur les codes de fermeture
          let closeReason = "Fermeture normale";
          if (event.code === 1000) {
            closeReason = "Fermeture normale";
          } else if (event.code === 1001) {
            closeReason = "Partie en allant vers une autre page";
          } else if (event.code === 1006) {
            closeReason = "Fermeture anormale (possiblement problème réseau)";
          } else if (event.code === 1008) {
            closeReason = "Violation de politique (authentification invalide)";
          } else if (event.code === 1011) {
            closeReason = "Erreur interne du serveur";
          } else if (event.code === 1012) {
            closeReason = "Redémarrage du serveur";
          }
          
          this.log(`Détail de la fermeture: ${closeReason}`);
          
          // Appeler le callback onClose si défini
          if (this.options.onClose) {
            this.options.onClose();
          }
          
          // Si c'est une fermeture pour violation de politique (problème d'authentification)
          // ne pas tenter de se reconnecter automatiquement
          if (event.code === 1008) {
            this.log("Reconnexion désactivée: problème d'authentification");
            this.forceClosed = true;
            return;
          }
          
          // Tenter de se reconnecter si ce n'est pas une fermeture forcée
          if (!this.forceClosed) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (event) => {
          this.log('Erreur WebSocket:', event);
          this.isConnecting = false;
          
          // Appeler le callback onError si défini
          if (this.options.onError) {
            this.options.onError(event);
          }
          
          reject(new Error('Erreur de connexion WebSocket'));
        };
      } catch (error) {
        this.isConnecting = false;
        this.log('Erreur lors de la création WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Envoie le token d'authentification au serveur
   */
  private sendAuthToken(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: this.token
      }));
      this.log('Token d\'authentification envoyé');
    }
  }

  /**
   * Envoie un message texte au serveur
   */
  public sendTextMessage(content: string, messageType: string = 'text'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('Impossible d\'envoyer le message: WebSocket non connecté');
      return;
    }

    const message = {
      type: WebSocketMessageType.MESSAGE,
      data: {
        content,
        message_type: messageType
      }
    };

    this.ws.send(JSON.stringify(message));
    this.log('Message envoyé:', message);
  }

  /**
   * Envoie un événement de frappe (typing)
   */
  public sendTypingEvent(isTyping: boolean): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: WebSocketMessageType.TYPING,
      data: { is_typing: isTyping }
    };

    this.ws.send(JSON.stringify(message));
    this.log('Événement typing envoyé:', isTyping);
  }

  /**
   * Programme une tentative de reconnexion
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Si la fermeture était forcée, ne pas tenter de reconnexion
    if (this.forceClosed) {
      this.log('Reconnexion annulée : déconnexion forcée');
      return;
    }

    if (this.currentAttempt >= this.reconnectAttempts) {
      this.log(`Abandon après ${this.currentAttempt} tentatives de reconnexion`);
      return;
    }

    this.currentAttempt++;
    
    // Appeler le callback onReconnect si défini
    if (this.options.onReconnect) {
      this.options.onReconnect(this.currentAttempt);
    }

    // Calculer le délai croissant pour éviter de saturer le serveur (backoff exponentiel)
    const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.currentAttempt - 1), 30000);
    
    this.log(`Tentative de reconnexion #${this.currentAttempt} dans ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.log(`Tentative de reconnexion #${this.currentAttempt}...`);
      this.connect().catch(error => {
        this.log(`Échec de la reconnexion #${this.currentAttempt}:`, error);
        // Programmer immédiatement la prochaine tentative
        this.scheduleReconnect();
      });
    }, delay);
  }

  /**
   * Ferme la connexion WebSocket
   */
  public disconnect(): void {
    this.forceClosed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.log('WebSocket déconnecté');
  }

  /**
   * Fonction utilitaire pour les logs de débogage
   */
  private log(message: string, ...data: unknown[]): void {
    if (this.debug) {
      console.log(`[WebSocketClient] ${message}`, ...data);
    }
  }
}

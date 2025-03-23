"""
WebSocket server module for simple_kaapi
This module provides a separate FastAPI application specifically for WebSocket connections
without any security middleware that might interfere with WebSocket handshakes.
"""

import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any, List

# Configurer le logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ws_server")

# Créer une application FastAPI dédiée aux WebSockets
app = FastAPI(title="Kaapi WebSocket Server")

# Configuration CORS - accepte toutes les origines en développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, limitez aux origines spécifiques
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple classe de gestionnaire de connexions WebSocket
class ConnectionManager:
    def __init__(self):
        # Structure: {conversation_id: {user_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, conversation_id: str, user_id: str = "anonymous"):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = {}
        self.active_connections[conversation_id][user_id] = websocket
        logger.info(f"User {user_id} connected to conversation {conversation_id}")
        
    def disconnect(self, conversation_id: str, user_id: str = "anonymous"):
        if conversation_id in self.active_connections:
            if user_id in self.active_connections[conversation_id]:
                del self.active_connections[conversation_id][user_id]
                logger.info(f"User {user_id} disconnected from conversation {conversation_id}")
            
            # Supprimer la conversation si elle est vide
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]
                
    async def broadcast_to_conversation(self, message: Dict[str, Any], conversation_id: str, exclude_user: str = None):
        if conversation_id in self.active_connections:
            for user_id, connection in self.active_connections[conversation_id].items():
                if exclude_user and user_id == exclude_user:
                    continue
                await connection.send_json(message)


# Créer le gestionnaire de connexions
manager = ConnectionManager()

# Route WebSocket de test - aucune authentification requise
@app.websocket("/ws-test")
async def websocket_test(websocket: WebSocket):
    await websocket.accept()
    try:
        # Envoyer un message de bienvenue
        await websocket.send_json({"status": "connected", "message": "Test connection successful"})
        
        # Boucle d'echo simple
        while True:
            data = await websocket.receive_text()
            # Echo du message reçu
            await websocket.send_json({"echo": data})
    except WebSocketDisconnect:
        logger.info("Client disconnected from test WebSocket")

# Route WebSocket principale avec ID de conversation
@app.websocket("/ws/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    conversation_id: str, 
    token: Optional[str] = Query(None),
    user_id: Optional[str] = Query("anonymous")
):
    """
    Endpoint WebSocket simple sans authentification pour le développement
    Accepte toutes les connexions et fournit un service d'écho
    """
    # Log pour le debug
    logger.info(f"WebSocket connection attempt to conversation {conversation_id}")
    if token:
        logger.info(f"Token provided: {token[:10]}...")
    
    # Accepter la connexion sans vérification
    await manager.connect(websocket, conversation_id, user_id)
    
    try:
        # Envoyer un message de confirmation
        await websocket.send_json({
            "type": "connection_established",
            "data": {
                "conversation_id": conversation_id,
                "user_id": user_id
            }
        })
        
        # Boucle principale pour recevoir les messages
        while True:
            # Attendre les messages
            data = await websocket.receive_json()
            
            # Loguer le message reçu
            logger.info(f"Message from user {user_id} in conversation {conversation_id}: {data}")
            
            # Déterminer le type de message
            message_type = data.get("type", "text")
            
            # Traiter le message selon son type
            if message_type == "text":
                # Créer un message structuré pour le broadcast
                message_to_broadcast = {
                    "type": "message",
                    "data": {
                        "id": data.get("id", "unknown"),
                        "sender_id": user_id,
                        "conversation_id": conversation_id,
                        "content": data.get("content", ""),
                        "timestamp": data.get("timestamp", ""),
                    }
                }
                
                # Diffuser à tous les participants de la conversation (sauf l'expéditeur)
                await manager.broadcast_to_conversation(
                    message_to_broadcast, 
                    conversation_id,
                    exclude_user=None  # Optionnel: exclure l'expéditeur avec user_id
                )
                
                # Confirmer la réception à l'expéditeur
                await websocket.send_json({
                    "type": "message_received",
                    "data": {
                        "message_id": data.get("id", "unknown")
                    }
                })
            
            elif message_type == "typing":
                # Diffuser l'indication de frappe
                await manager.broadcast_to_conversation(
                    {
                        "type": "typing",
                        "data": {
                            "user_id": user_id,
                            "is_typing": data.get("is_typing", False)
                        }
                    },
                    conversation_id,
                    exclude_user=user_id
                )
    
    except WebSocketDisconnect:
        # Gérer la déconnexion
        manager.disconnect(conversation_id, user_id)
        
        # Informer les autres utilisateurs de la déconnexion
        await manager.broadcast_to_conversation(
            {
                "type": "user_offline",
                "data": {
                    "user_id": user_id
                }
            },
            conversation_id
        )
    
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {str(e)}")
        manager.disconnect(conversation_id, user_id)


if __name__ == "__main__":
    import uvicorn
    # Lancer le serveur sur le port 8001 pour éviter les conflits avec l'API principale
    uvicorn.run("ws_server:app", host="0.0.0.0", port=8001, reload=True)

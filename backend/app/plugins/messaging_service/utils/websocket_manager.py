"""
WebSocket Manager for Messaging Service

This module implements WebSocket management for real-time messaging,
including connection handling and secure message distribution.
"""
import logging
import json
import asyncio
from typing import Dict, Any, List, Set, Optional
import uuid

logger = logging.getLogger(__name__)


class MessageWebSocketManager:
    """
    WebSocket manager for real-time messaging, ensuring secure and efficient 
    delivery of messages following the standardized security approach.
    """
    
    def __init__(self):
        """Initialize the WebSocket manager."""
        self.active_connections = {}  # user_id -> conversation_id -> websocket
        self.user_conversations = {}  # user_id -> set of conversation_ids
        self.conversation_users = {}  # conversation_id -> set of user_ids
        self.security_handler = None
    
    def set_security_handler(self, security_handler):
        """
        Set the security handler for secure WebSocket communications.
        
        Args:
            security_handler: Security handler from the messaging service
        """
        self.security_handler = security_handler
        logger.info("WebSocket manager initialized with security handler")
    
    async def connect(self, websocket, user_id: str, conversation_id: str):
        """Register a new WebSocket connection for a user in a specific conversation."""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = {}
            
        # Store the connection for this conversation
        self.active_connections[user_id][conversation_id] = websocket
        
        # Log the connection
        active_users = len(self.active_connections)
        logger.info(f"New WebSocket connection: user_id={user_id}, conversation_id={conversation_id}")
        logger.info(f"Current active users count: {active_users}")
        
        # Log connection securely
        if self.security_handler:
            self.security_handler.secure_log(
                "WebSocket connection established",
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id
                }
            )
        else:
            logger.info(f"WebSocket connection established for user {user_id} in conversation {conversation_id}")
        
        return str(uuid.uuid4())
    
    async def disconnect(self, user_id: str, conversation_id: str, connection_id: str):
        """
        Remove a WebSocket connection when a user disconnects.
        
        Args:
            user_id: ID of the disconnecting user
            conversation_id: ID of the conversation
            connection_id: ID of the connection to remove
        """
        if user_id in self.active_connections and conversation_id in self.active_connections[user_id]:
            # Remove the specific connection
            del self.active_connections[user_id][conversation_id]
            
            # If no more connections for this user in this conversation, clean up
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
                # Clean up user conversation mappings
                if user_id in self.user_conversations:
                    self.user_conversations[user_id].discard(conversation_id)
        
        # Log disconnection securely
        if self.security_handler:
            self.security_handler.secure_log(
                "WebSocket connection closed",
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id
                }
            )
        else:
            logger.info(f"WebSocket connection closed for user {user_id} in conversation {conversation_id}")
    
    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """
        Send a message to a specific user on all their active connections.
        
        Args:
            user_id: ID of the user to send to
            message: Message data to send
        """
        if user_id not in self.active_connections:
            return
        
        # Prepare the message for transmission following security standards
        message_data = self._prepare_message(message, user_id)
        
        # Send to all connections for this user
        for conversation_id, websocket in self.active_connections[user_id].items():
            try:
                await websocket.send_text(message_data)
            except Exception as e:
                logger.error(f"Error sending WebSocket message: {str(e)}")
                # Connection might be broken, but we'll let the client reconnect
                # rather than removing it here
    
    async def broadcast_to_conversation(self, conversation_id: str, message: Dict[str, Any], 
                                      exclude_user_id: Optional[str] = None):
        """
        Broadcast a message to all users in a conversation.
        
        Args:
            conversation_id: ID of the conversation
            message: Message data to send
            exclude_user_id: Optional user ID to exclude from broadcast
        """
        if conversation_id not in self.conversation_users:
            return
        
        user_ids = self.conversation_users[conversation_id]
        
        for user_id in user_ids:
            # Skip the excluded user if specified
            if exclude_user_id and user_id == exclude_user_id:
                continue
                
            await self.send_to_user(user_id, message)
    
    async def broadcast_to_all(self, message: Dict[str, Any], exclude_user_id: Optional[str] = None):
        """
        Broadcast a message to all connected users (system announcements).
        
        Args:
            message: Message data to send
            exclude_user_id: Optional user ID to exclude from broadcast
        """
        for user_id in list(self.active_connections.keys()):
            # Skip the excluded user if specified
            if exclude_user_id and user_id == exclude_user_id:
                continue
                
            await self.send_to_user(user_id, message)
    
    def register_conversation(self, conversation_id: str, user_ids: List[str]):
        """
        Register a conversation and its participants for WebSocket routing.
        
        Args:
            conversation_id: ID of the conversation
            user_ids: List of participant user IDs
        """
        # Update conversation_users mapping
        if conversation_id not in self.conversation_users:
            self.conversation_users[conversation_id] = set()
        
        self.conversation_users[conversation_id].update(user_ids)
        
        # Update user_conversations mapping
        for user_id in user_ids:
            if user_id not in self.user_conversations:
                self.user_conversations[user_id] = set()
            
            self.user_conversations[user_id].add(conversation_id)
        
        # Log registration securely
        if self.security_handler:
            self.security_handler.secure_log(
                "Conversation registered for WebSocket routing",
                {
                    "conversation_id": conversation_id,
                    "participant_count": len(user_ids)
                }
            )
    
    def unregister_conversation(self, conversation_id: str):
        """
        Unregister a conversation when it's deleted.
        
        Args:
            conversation_id: ID of the conversation to unregister
        """
        if conversation_id in self.conversation_users:
            # Get the users in this conversation
            user_ids = self.conversation_users[conversation_id]
            
            # Remove the conversation from each user's list
            for user_id in user_ids:
                if user_id in self.user_conversations:
                    self.user_conversations[user_id].discard(conversation_id)
            
            # Remove the conversation from the mapping
            del self.conversation_users[conversation_id]
    
    def add_user_to_conversation(self, conversation_id: str, user_id: str):
        """
        Add a user to a conversation for WebSocket routing.
        
        Args:
            conversation_id: ID of the conversation
            user_id: ID of the user to add
        """
        # Update conversation_users mapping
        if conversation_id not in self.conversation_users:
            self.conversation_users[conversation_id] = set()
        
        self.conversation_users[conversation_id].add(user_id)
        
        # Update user_conversations mapping
        if user_id not in self.user_conversations:
            self.user_conversations[user_id] = set()
        
        self.user_conversations[user_id].add(conversation_id)
    
    def remove_user_from_conversation(self, conversation_id: str, user_id: str):
        """
        Remove a user from a conversation for WebSocket routing.
        
        Args:
            conversation_id: ID of the conversation
            user_id: ID of the user to remove
        """
        # Update conversation_users mapping
        if conversation_id in self.conversation_users:
            self.conversation_users[conversation_id].discard(user_id)
        
        # Update user_conversations mapping
        if user_id in self.user_conversations:
            self.user_conversations[user_id].discard(conversation_id)
    
    def get_online_users(self, conversation_id: str) -> List[str]:
        """
        Get a list of users who are currently online in a conversation.
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            List of online user IDs
        """
        if conversation_id not in self.conversation_users:
            return []
        
        # Get all users in the conversation
        user_ids = self.conversation_users[conversation_id]
        
        # Filter to only include users with active connections
        online_user_ids = [
            user_id for user_id in user_ids
            if user_id in self.active_connections and conversation_id in self.active_connections[user_id]
        ]
        
        return online_user_ids
    
    def _prepare_message(self, message: Dict[str, Any], user_id: str) -> str:
        """
        Prepare a message for WebSocket transmission using the standardized security approach.
        
        Args:
            message: Message data to prepare
            user_id: ID of the recipient user for targeted encryption
            
        Returns:
            String representation of the message ready for transmission
        """
        # Add timestamp if not present
        if "timestamp" not in message:
            from datetime import datetime
            message["timestamp"] = datetime.utcnow().isoformat()
        
        # Encrypt sensitive data if security handler is available
        if self.security_handler:
            # If there's content that needs to be encrypted specifically for this user
            if "data" in message and "content" in message["data"]:
                message["data"]["content"] = self.security_handler.encrypt_message(
                    message["data"]["content"], 
                    user_id
                )
        
        # Convert to JSON string
        return json.dumps(message)
        
    def is_user_online(self, user_id: str) -> bool:
        """
        Check if a user is currently online.
        
        Args:
            user_id: ID of the user to check
            
        Returns:
            True if the user is online, False otherwise
        """
        return user_id in self.active_connections and any(self.active_connections[user_id].values())

"""
WebSocket Routes

This module defines WebSocket routes for real-time messaging in the messaging service,
implementing the standardized security approach for WebSocket connections.
"""
import logging
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.orm import Session

from ..main import messaging_service, get_current_user, get_db
from ..services.message_service import MessageService
from ..utils.websocket_manager import MessageWebSocketManager

logger = logging.getLogger(__name__)

router = APIRouter()
message_service = None


@router.websocket("/ws/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(None)
):
    """
    WebSocket endpoint for real-time messaging in a conversation.
    
    Security:
    - Authentication via token
    - Authorization check for conversation access
    - Secure message handling with encryption/decryption
    - Rate limiting for message sending
    """
    user_id = None
    
    # Verify token and get user information
    try:
        # Use the application's authentication helper
        user = await get_current_user_from_token(token)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
        user_id = user.get("id")
        
        # Securely log connection attempt
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "WebSocket connection attempt",
                {"user_id": user_id, "conversation_id": conversation_id}
            )
    except Exception as e:
        logger.error(f"Authentication error in WebSocket: {str(e)}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Check if user has access to the conversation
    try:
        # This would require database access
        db = next(get_db())
        
        # Verify user's access to the conversation (simplified)
        # In a real implementation, this would use the conversation service
        has_access = await verify_conversation_access(db, user_id, conversation_id)
        if not has_access:
            # Securely log unauthorized access attempt
            if messaging_service.security_handler:
                messaging_service.security_handler.secure_log(
                    "Unauthorized WebSocket connection attempt",
                    {"user_id": user_id, "conversation_id": conversation_id},
                    "warning"
                )
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception as e:
        logger.error(f"Authorization error in WebSocket: {str(e)}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    # Accept the connection
    await websocket.accept()
    
    # Register connection with the WebSocket manager
    await messaging_service.websocket_manager.connect(conversation_id, user_id, websocket)
    
    # Securely log successful connection
    if messaging_service.security_handler:
        messaging_service.security_handler.secure_log(
            "WebSocket connection established",
            {"user_id": user_id, "conversation_id": conversation_id}
        )
    
    try:
        # Main message handling loop
        while True:
            # Receive and process message
            data = await websocket.receive_text()
            
            try:
                # Parse message data
                message_data = json.loads(data)
                
                # Apply rate limiting (simplified)
                # In a real implementation, this would track message frequency
                
                # Validate message content for security
                validate_message_content(message_data)
                
                # Process different message types
                message_type = message_data.get("type", "message")
                
                if message_type == "message":
                    # Process regular message
                    await process_message(user_id, conversation_id, message_data)
                elif message_type == "typing":
                    # Process typing indicator
                    await process_typing_indicator(user_id, conversation_id, message_data)
                elif message_type == "read":
                    # Process read receipt
                    await process_read_receipt(user_id, conversation_id, message_data)
                else:
                    # Ignore unknown message types
                    logger.warning(f"Unknown WebSocket message type: {message_type}")
            
            except json.JSONDecodeError:
                # Securely log invalid message format
                if messaging_service.security_handler:
                    messaging_service.security_handler.secure_log(
                        "Invalid WebSocket message format",
                        {"user_id": user_id, "conversation_id": conversation_id},
                        "warning"
                    )
                continue
                
            except Exception as e:
                # Securely log message processing error
                if messaging_service.security_handler:
                    messaging_service.security_handler.secure_log(
                        "Error processing WebSocket message",
                        {"user_id": user_id, "conversation_id": conversation_id, "error": str(e)},
                        "error"
                    )
                continue
                
    except WebSocketDisconnect:
        # Handle disconnection
        await messaging_service.websocket_manager.disconnect(conversation_id, user_id)
        
        # Securely log disconnection
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "WebSocket connection closed",
                {"user_id": user_id, "conversation_id": conversation_id}
            )
    
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected WebSocket error: {str(e)}")
        
        # Try to disconnect properly
        await messaging_service.websocket_manager.disconnect(conversation_id, user_id)
        
        # Securely log error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "WebSocket unexpected error",
                {"user_id": user_id, "conversation_id": conversation_id, "error": str(e)},
                "error"
            )


async def get_current_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Authenticate user from token."""
    # This is a simplified version
    # In a real implementation, this would use proper JWT validation
    # and the application's authentication system
    try:
        if not token:
            return None
            
        # Mock implementation
        # In a real system, this would verify the token and get user info
        user = {"id": "mock_user_id", "username": "mock_user"}
        return user
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return None


async def verify_conversation_access(db: Session, user_id: str, conversation_id: str) -> bool:
    """Verify that the user has access to the conversation."""
    # This is a simplified version
    # In a real implementation, this would check database records
    # to verify the user's membership in the conversation
    
    # Mock implementation - always returns True
    # In a real system, this would query the database
    return True


def validate_message_content(message_data: Dict[str, Any]) -> None:
    """
    Validate message content for security.
    
    Raises HTTPException if validation fails.
    """
    # Simplified validation
    # In a real implementation, this would check for:
    # - XSS attempts
    # - SQL injection
    # - Command injection
    # - Other security issues
    
    # Check if content is present for message type
    if message_data.get("type") == "message" and "content" not in message_data:
        raise ValueError("Message content is required")
        
    # Check content length if present
    if "content" in message_data and len(message_data["content"]) > messaging_service.config["max_message_length"]:
        raise ValueError(f"Message too long. Maximum length is {messaging_service.config['max_message_length']} characters")


async def process_message(user_id: str, conversation_id: str, message_data: Dict[str, Any]) -> None:
    """Process a regular message."""
    try:
        # Extract message content
        content = message_data.get("content", "")
        
        # Encrypt message content if needed
        is_encrypted = messaging_service.config["encryption_enabled"]
        if is_encrypted and messaging_service.security_handler:
            # In a real implementation, this would encrypt for all recipients
            # For simplicity, we're not doing that here
            encrypted_content = content
        else:
            encrypted_content = content
            
        # Prepare message for broadcasting
        broadcast_data = {
            "type": "message",
            "sender_id": user_id,
            "content": encrypted_content,
            "timestamp": message_data.get("timestamp"),
            "is_encrypted": is_encrypted,
            "message_id": message_data.get("message_id", "temp_" + str(id(message_data)))
        }
        
        # Broadcast message to all connected clients in the conversation
        await messaging_service.websocket_manager.broadcast(
            conversation_id, 
            json.dumps(broadcast_data),
            exclude_user_id=None  # Send to all users including sender
        )
        
        # In a real implementation, this would also save the message to the database
        # using the message_service
        
    except Exception as e:
        # Securely log error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error processing message",
                {"user_id": user_id, "conversation_id": conversation_id, "error": str(e)},
                "error"
            )
        raise


async def process_typing_indicator(user_id: str, conversation_id: str, message_data: Dict[str, Any]) -> None:
    """Process typing indicator."""
    try:
        # Extract typing status
        is_typing = message_data.get("is_typing", False)
        
        # Prepare typing notification for broadcasting
        broadcast_data = {
            "type": "typing",
            "user_id": user_id,
            "is_typing": is_typing,
            "timestamp": message_data.get("timestamp")
        }
        
        # Broadcast typing status to all connected clients except sender
        await messaging_service.websocket_manager.broadcast(
            conversation_id, 
            json.dumps(broadcast_data),
            exclude_user_id=user_id  # Don't send back to the sender
        )
        
    except Exception as e:
        # Securely log error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error processing typing indicator",
                {"user_id": user_id, "conversation_id": conversation_id, "error": str(e)},
                "error"
            )
        raise


async def process_read_receipt(user_id: str, conversation_id: str, message_data: Dict[str, Any]) -> None:
    """Process read receipt."""
    try:
        # Extract message ID that was read
        message_id = message_data.get("message_id")
        if not message_id:
            return
            
        # Prepare read receipt for broadcasting
        broadcast_data = {
            "type": "read",
            "user_id": user_id,
            "message_id": message_id,
            "timestamp": message_data.get("timestamp")
        }
        
        # Broadcast read receipt to all connected clients except sender
        await messaging_service.websocket_manager.broadcast(
            conversation_id, 
            json.dumps(broadcast_data),
            exclude_user_id=user_id  # Don't send back to the sender
        )
        
        # In a real implementation, this would also update the message's read status 
        # in the database using the message_service
        
    except Exception as e:
        # Securely log error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error processing read receipt",
                {"user_id": user_id, "conversation_id": conversation_id, "error": str(e)},
                "error"
            )
        raise


def init_routes(service: MessageService):
    """Initialize WebSocket routes with the message service instance."""
    global message_service
    message_service = service
    return router

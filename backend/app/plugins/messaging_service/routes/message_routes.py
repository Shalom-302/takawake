"""
Message Routes

This module defines API routes for message handling in the messaging service,
implementing the standardized security approach across all endpoints.
"""
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, Query
from sqlalchemy.orm import Session

from ..services.message_service import MessageService
from ..schemas.message import (
    MessageCreate, MessageUpdate, MessageResponse, MessageSearchRequest,
    BulkMessagesRequest, ForwardMessageRequest, BulkDeleteMessagesRequest,
    MessageStatusUpdateRequest
)
from ..main import messaging_service, get_current_user, get_db

logger = logging.getLogger(__name__)

router = APIRouter()
message_service = MessageService()


@router.post("/messages", response_model=MessageResponse)
async def create_message(
    message_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new message in a conversation.
    
    Security: 
    - Authentication required
    - Content validation for XSS and other attacks
    - Message encryption if conversation is encrypted
    """
    # Get user ID
    user_id = current_user.id
    logger.info(f"Creating message with user_id: {user_id}")
    logger.info(f"Message data received: {message_data}")
    
    try:
        # Convertir en objet MessageCreate
        message_create = MessageCreate(**message_data)
        
        # Securely create the message using the standardized approach
        message = await message_service.create_message(
            db, message_create, user_id, None
        )
        logger.info(f"Message created successfully with ID: {message.get('id', 'unknown')}")
        
        # S'assurer que tous les champs requis par MessageResponse sont présents
        if 'updated_at' not in message:
            message['updated_at'] = message.get('created_at')
        if 'is_edited' not in message:
            message['is_edited'] = False
        if 'is_forwarded' not in message:
            message['is_forwarded'] = False
        if 'is_encrypted' not in message:
            message['is_encrypted'] = False
        if 'conversation_id' not in message:
            message['conversation_id'] = message_create.conversation_id
            
        return message
    except HTTPException as e:
        # Rethrow HTTP exceptions
        raise e
    except Exception as e:
        # Securely log the error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error creating message",
                {"user_id": user_id, "error": str(e)},
                "error"
            )
        raise HTTPException(status_code=500, detail="Failed to create message")


@router.post("/messages/with-attachment", response_model=MessageResponse)
async def create_message_with_attachment(
    message_data: MessageCreate = Body(...),
    attachments: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new message in a conversation with attachments.
    
    Security: 
    - Authentication required
    - Content validation for XSS and other attacks
    - Message encryption if conversation is encrypted
    """
    # Get user ID
    user_id = current_user.id
    logger.info(f"Creating message with user_id: {user_id}")
    logger.info(f"Message data received: {message_data.dict()}")
    
    try:
        # Securely create the message using the standardized approach
        message = await message_service.create_message(
            db, message_data, user_id, attachments
        )
        logger.info(f"Message created successfully with ID: {message.get('id', 'unknown')}")
        return message
    except HTTPException as e:
        # Rethrow HTTP exceptions
        raise e
    except Exception as e:
        # Securely log the error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error creating message",
                {"user_id": user_id, "error": str(e)},
                "error"
            )
        raise HTTPException(status_code=500, detail="Failed to create message")


@router.get("/messages/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a single message by ID.
    
    Security:
    - Authentication required
    - Authorization check for conversation access
    - Secure decryption of message content
    """
    # Get user ID
    user_id = current_user.id
    
    try:
        # Securely retrieve the message using the standardized approach
        message = await message_service.get_message(db, message_id, user_id)
        return message
    except HTTPException as e:
        # Rethrow HTTP exceptions
        raise e
    except Exception as e:
        # Securely log the error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error retrieving message",
                {"user_id": user_id, "message_id": message_id, "error": str(e)},
                "error"
            )
        raise HTTPException(status_code=500, detail="Failed to retrieve message")


@router.post("/messages/bulk", response_model=List[MessageResponse])
async def get_messages(
    request: BulkMessagesRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get multiple messages from a conversation.
    
    Security:
    - Authentication required
    - Authorization check for conversation access
    - Secure decryption of message content
    - Rate limiting and pagination to prevent abuse
    """
    # Get user ID
    user_id = current_user.id
    try:
        # Securely retrieve messages using the standardized approach
        messages = await message_service.get_conversation_messages(
            db, 
            request.conversation_id, 
            user_id, 
            request.limit, 
            request.before_message_id
        )
      
        return messages
    except HTTPException as e:
        # Rethrow HTTP exceptions
        raise e
    except Exception as e:
        # Securely log the error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error retrieving messages",
                {
                    "user_id": user_id, 
                    "conversation_id": request.conversation_id, 
                    "error": str(e)
                },
                "error"
            )
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")


@router.patch("/messages/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    update_data: MessageUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update a message (edit content or delete).
    
    Security:
    - Authentication required
    - Authorization check (only sender can update)
    - Content validation for XSS and other attacks
    - Secure encryption of updated content
    """
    # Get user ID
    user_id = current_user.id
    
    try:
        # Securely update the message using the standardized approach
        message = await message_service.update_message(
            db, message_id, user_id, update_data
        )
        return message
    except HTTPException as e:
        # Rethrow HTTP exceptions
        raise e
    except Exception as e:
        # Securely log the error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error updating message",
                {"user_id": user_id, "message_id": message_id, "error": str(e)},
                "error"
            )
        raise HTTPException(status_code=500, detail="Failed to update message")


@router.post("/messages/search", response_model=List[MessageResponse])
async def search_messages(
    search_request: MessageSearchRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Search for messages with specific criteria.
    
    Security:
    - Authentication required
    - Authorization check for conversation access
    - Rate limiting to prevent abuse
    - Secure decryption of message content
    """
    # Get user ID
    user_id = current_user.id
    
    # This would require implementing a search method in the message service
    # For now, we'll raise a not implemented error
    
    # Securely log the request using standardized approach
    if messaging_service.security_handler:
        messaging_service.security_handler.secure_log(
            "Message search requested",
            {
                "user_id": user_id, 
                "conversation_id": search_request.conversation_id,
                "query": search_request.query
            }
        )
    
    raise HTTPException(status_code=501, detail="Message search not implemented yet")


@router.post("/messages/forward", response_model=List[MessageResponse])
async def forward_message(
    forward_request: ForwardMessageRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Forward a message to other conversations.
    
    Security:
    - Authentication required
    - Authorization check for both source and target conversations
    - Secure handling of message content
    """
    # Get user ID
    user_id = current_user.id
    
    # This would require implementing a forward method in the message service
    # For now, we'll raise a not implemented error
    
    # Securely log the request using standardized approach
    if messaging_service.security_handler:
        messaging_service.security_handler.secure_log(
            "Message forward requested",
            {
                "user_id": user_id, 
                "message_id": forward_request.message_id,
                "target_count": len(forward_request.target_conversation_ids)
            }
        )
    
    raise HTTPException(status_code=501, detail="Message forwarding not implemented yet")


@router.post("/messages/status", response_model=Dict[str, Any])
async def update_message_status(
    status_request: MessageStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update message delivery/read status.
    
    Security:
    - Authentication required
    - Authorization check for conversation access
    - Validation of status values
    """
    # Get user ID
    user_id = current_user.id
    
    # This would require implementing a status update method in the message service
    # For now, we'll raise a not implemented error
    
    # Securely log the request using standardized approach
    if messaging_service.security_handler:
        messaging_service.security_handler.secure_log(
            "Message status update requested",
            {
                "user_id": user_id, 
                "message_count": len(status_request.message_ids),
                "status": status_request.status
            }
        )
    
    raise HTTPException(status_code=501, detail="Message status update not implemented yet")


@router.post("/messages/delete-bulk", response_model=Dict[str, Any])
async def delete_messages_bulk(
    delete_request: BulkDeleteMessagesRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete multiple messages at once.
    
    Security:
    - Authentication required
    - Authorization check (only sender can delete for everyone)
    - Rate limiting to prevent abuse
    """
    # Get user ID
    user_id = current_user.id
    
    # This would require implementing a bulk delete method in the message service
    # For now, we'll raise a not implemented error
    
    # Securely log the request using standardized approach
    if messaging_service.security_handler:
        messaging_service.security_handler.secure_log(
            "Bulk message delete requested",
            {
                "user_id": user_id, 
                "message_count": len(delete_request.message_ids),
                "delete_for_everyone": delete_request.delete_for_everyone
            }
        )
    
    raise HTTPException(status_code=501, detail="Bulk message deletion not implemented yet")


@router.get("/messages/typing/{conversation_id}")
async def send_typing_notification(
    conversation_id: str,
    is_typing: bool = Query(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Send typing status notification to conversation participants.
    
    Security:
    - Authentication required
    - Authorization check for conversation access
    - Rate limiting to prevent abuse
    """
    # Get user ID
    user_id = current_user.id
    
    try:
        # This requires integration with the notification handler
        if messaging_service.notification_handler:
            await messaging_service.notification_handler.notify_typing_status(
                conversation_id, user_id, is_typing
            )
            
            return {"status": "success"}
        else:
            raise HTTPException(status_code=503, detail="Notification service not available")
    except HTTPException as e:
        # Rethrow HTTP exceptions
        raise e
    except Exception as e:
        # Securely log the error
        if messaging_service.security_handler:
            messaging_service.security_handler.secure_log(
                "Error sending typing notification",
                {
                    "user_id": user_id, 
                    "conversation_id": conversation_id, 
                    "error": str(e)
                },
                "error"
            )
        raise HTTPException(status_code=500, detail="Failed to send typing notification")


def init_routes(service: MessageService):
    """Initialize message service routes with the service instance."""
    global message_service
    message_service = service
    return router

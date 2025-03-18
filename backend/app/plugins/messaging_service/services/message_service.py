"""
Message Service

This module implements the core message handling service for the messaging plugin,
including message creation, retrieval, update, and deletion.
"""
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException

from ..models.message import MessageDB, MessageAttachmentDB, MessageReceiptDB
from ..models.conversation import ConversationDB, UserConversationSettingsDB
from ..schemas.message import MessageCreate, MessageUpdate, MessageSearchRequest

logger = logging.getLogger(__name__)


class MessageService:
    """
    Service for handling message operations, implementing the standardized
    security approach for all messaging functions.
    """
    
    def __init__(self):
        """Initialize the message service."""
        self.security_handler = None
        self.file_handler = None
        self.notification_handler = None
    
    def init_handlers(self, security_handler, file_handler, notification_handler):
        """
        Initialize handlers after they are available.
        
        Args:
            security_handler: Security handler for secure message handling
            file_handler: File handler for attachments
            notification_handler: Notification handler for real-time updates
        """
        self.security_handler = security_handler
        self.file_handler = file_handler
        self.notification_handler = notification_handler
        logger.info("Message service initialized with security, file, and notification handlers")
    
    async def create_message(self, db: Session, message_data: MessageCreate, 
                           sender_id: str, attachments: List[UploadFile] = None) -> Dict[str, Any]:
        """
        Create a new message in a conversation.
        
        Args:
            db: Database session
            message_data: Message data
            sender_id: ID of the sending user
            attachments: Optional list of file attachments
            
        Returns:
            Created message
            
        Raises:
            HTTPException: If message creation fails
        """
        # Validate the message request using standardized security approach
        if self.security_handler:
            is_valid = self.security_handler.validate_message_request(message_data.dict())
            if not is_valid:
                if self.security_handler:
                    self.security_handler.secure_log(
                        "Message validation failed",
                        {"sender_id": sender_id},
                        "warning"
                    )
                raise HTTPException(status_code=400, detail="Invalid message request")
        
        # Verify the conversation exists and user has access
        conversation_id = message_data.conversation_id
        conversation = db.query(ConversationDB).filter(
            ConversationDB.id == conversation_id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Check if user is a member of the conversation
        user_settings = db.query(UserConversationSettingsDB).filter(
            UserConversationSettingsDB.conversation_id == conversation_id,
            UserConversationSettingsDB.user_id == sender_id
        ).first()
        
        if not user_settings:
            if self.security_handler:
                self.security_handler.secure_log(
                    "Unauthorized message attempt",
                    {"sender_id": sender_id, "conversation_id": conversation_id},
                    "warning"
                )
            raise HTTPException(status_code=403, detail="Not a member of this conversation")
        
        # Process content based on conversation encryption setting
        content = message_data.content
        is_encrypted = conversation.is_encrypted
        
        # Encrypt content if needed using standardized security approach
        if is_encrypted and content and self.security_handler:
            encrypted_content = self.security_handler.encrypt_message(content, conversation_id)
            content = encrypted_content
        
        # Process metadata using standardized security approach
        metadata = message_data.message_metadata
        metadata_str = None
        
        if metadata and self.security_handler:
            metadata_str = self.security_handler.encrypt_metadata(metadata)
        
        # Create the message
        new_message = MessageDB(
            conversation_id=conversation_id,
            sender_id=sender_id,
            message_type=message_data.message_type,
            content=content,
            message_metadata=metadata_str,
            is_encrypted=is_encrypted,
            reply_to_message_id=message_data.reply_to_message_id
        )
        
        db.add(new_message)
        db.flush()  # Flush to get the message ID
        
        # Process attachments if any
        message_attachments = []
        if attachments and self.file_handler:
            for attachment in attachments:
                try:
                    attachment_info = await self.file_handler.save_attachment(
                        attachment, sender_id, conversation_id
                    )
                    
                    # Create attachment record
                    attachment_db = MessageAttachmentDB(
                        message_id=new_message.id,
                        file_name=attachment_info["file_name"],
                        file_type=attachment_info["file_type"],
                        file_size=attachment_info["file_size"],
                        file_path=attachment_info["file_path"],
                        thumbnail_path=attachment_info.get("thumbnail_path"),
                        is_image=attachment_info["is_image"]
                    )
                    
                    db.add(attachment_db)
                    message_attachments.append(attachment_db)
                    
                except ValueError as e:
                    # Log error using standardized security approach
                    if self.security_handler:
                        self.security_handler.secure_log(
                            "Attachment processing failed",
                            {"error": str(e), "sender_id": sender_id},
                            "warning"
                        )
                    raise HTTPException(status_code=400, detail=str(e))
        
        # Create delivery receipts for all participants
        participant_settings = db.query(UserConversationSettingsDB).filter(
            UserConversationSettingsDB.conversation_id == conversation_id
        ).all()
        
        recipient_ids = []
        for participant in participant_settings:
            if participant.user_id != sender_id:
                # Add delivery receipt
                receipt = MessageReceiptDB(
                    message_id=new_message.id,
                    user_id=participant.user_id,
                    status="sent"  # Initial status
                )
                db.add(receipt)
                recipient_ids.append(participant.user_id)
        
        # Update conversation last_message_at
        conversation.last_message_at = datetime.utcnow()
        
        # Commit the transaction
        db.commit()
        db.refresh(new_message)
        
        # Send real-time notification using standardized security approach
        if self.notification_handler:
            # Convert to dict for notification
            message_dict = self._message_to_dict(new_message, include_attachments=True)
            
            # Don't send the actual content in the notification for security
            if "content" in message_dict:
                message_dict["content_preview"] = "New message"
                del message_dict["content"]
                
            await self.notification_handler.notify_new_message(message_dict, recipient_ids)
        
        # Log the message creation using standardized security approach
        if self.security_handler:
            self.security_handler.secure_log(
                "Message created",
                {
                    "sender_id": sender_id,
                    "conversation_id": conversation_id,
                    "message_id": new_message.id,
                    "message_type": message_data.message_type,
                    "has_attachments": len(message_attachments) > 0
                }
            )
        
        return self._message_to_dict(new_message, include_attachments=True)
    
    async def get_message(self, db: Session, message_id: str, user_id: str) -> Dict[str, Any]:
        """
        Retrieve a single message.
        
        Args:
            db: Database session
            message_id: ID of the message to retrieve
            user_id: ID of the requesting user
            
        Returns:
            Message data
            
        Raises:
            HTTPException: If message retrieval fails
        """
        # Fetch the message
        message = db.query(MessageDB).filter(MessageDB.id == message_id).first()
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        # Check if user has access to the conversation
        user_settings = db.query(UserConversationSettingsDB).filter(
            UserConversationSettingsDB.conversation_id == message.conversation_id,
            UserConversationSettingsDB.user_id == user_id
        ).first()
        
        if not user_settings:
            if self.security_handler:
                self.security_handler.secure_log(
                    "Unauthorized message access attempt",
                    {"user_id": user_id, "message_id": message_id},
                    "warning"
                )
            raise HTTPException(status_code=403, detail="Not authorized to view this message")
        
        # Decrypt the message content if needed using standardized security approach
        message_dict = self._message_to_dict(message, user_id=user_id, include_attachments=True)
        
        # Update message receipt status if necessary
        receipt = db.query(MessageReceiptDB).filter(
            MessageReceiptDB.message_id == message_id,
            MessageReceiptDB.user_id == user_id
        ).first()
        
        # If message was delivered but not read, mark as read
        if receipt and receipt.status in ["sent", "delivered"]:
            receipt.status = "read"
            receipt.updated_at = datetime.utcnow()
            db.commit()
            
            # Notify sender about read status using standardized security approach
            if self.notification_handler:
                await self.notification_handler.notify_message_status(
                    message_id, message.conversation_id, user_id, "read"
                )
        
        return message_dict
    
    async def get_conversation_messages(self, db: Session, conversation_id: str, 
                                      user_id: str, limit: int = 50, 
                                      before_message_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieve messages from a conversation.
        
        Args:
            db: Database session
            conversation_id: ID of the conversation
            user_id: ID of the requesting user
            limit: Maximum number of messages to retrieve
            before_message_id: Retrieve messages before this ID (for pagination)
            
        Returns:
            List of messages
            
        Raises:
            HTTPException: If message retrieval fails
        """
        # Check if user has access to the conversation
        user_settings = db.query(UserConversationSettingsDB).filter(
            UserConversationSettingsDB.conversation_id == conversation_id,
            UserConversationSettingsDB.user_id == user_id
        ).first()
        
        if not user_settings:
            if self.security_handler:
                self.security_handler.secure_log(
                    "Unauthorized conversation access attempt",
                    {"user_id": user_id, "conversation_id": conversation_id},
                    "warning"
                )
            raise HTTPException(status_code=403, detail="Not authorized to view this conversation")
        
        # Build the query
        query = db.query(MessageDB).filter(MessageDB.conversation_id == conversation_id)
        
        # Apply pagination if before_message_id is specified
        if before_message_id:
            # Get the created_at timestamp of the specified message
            before_message = db.query(MessageDB).filter(MessageDB.id == before_message_id).first()
            if before_message:
                query = query.filter(MessageDB.created_at < before_message.created_at)
        
        # Order by created_at (newest first) and limit
        messages = query.order_by(MessageDB.created_at.desc()).limit(limit).all()
        
        # Convert to dict and decrypt if needed
        message_dicts = []
        for message in messages:
            message_dict = self._message_to_dict(message, user_id=user_id, include_attachments=True)
            message_dicts.append(message_dict)
            
            # Update message receipt status if necessary
            receipt = db.query(MessageReceiptDB).filter(
                MessageReceiptDB.message_id == message.id,
                MessageReceiptDB.user_id == user_id
            ).first()
            
            # If message was delivered but not read, mark as read
            if receipt and receipt.status in ["sent", "delivered"]:
                receipt.status = "read"
                receipt.updated_at = datetime.utcnow()
        
        # Commit receipt updates if any
        db.commit()
        
        # If any messages were marked as read, send a batch notification
        # In a real app, this would be optimized to send a single notification for all messages
        
        return message_dicts
    
    async def update_message(self, db: Session, message_id: str, user_id: str, 
                           update_data: MessageUpdate) -> Dict[str, Any]:
        """
        Update a message.
        
        Args:
            db: Database session
            message_id: ID of the message to update
            user_id: ID of the requesting user (must be the sender)
            update_data: Updated message data
            
        Returns:
            Updated message data
            
        Raises:
            HTTPException: If message update fails
        """
        # Fetch the message
        message = db.query(MessageDB).filter(MessageDB.id == message_id).first()
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        # Check if user is the sender
        if message.sender_id != user_id:
            if self.security_handler:
                self.security_handler.secure_log(
                    "Unauthorized message update attempt",
                    {"user_id": user_id, "message_id": message_id},
                    "warning"
                )
            raise HTTPException(status_code=403, detail="Only the sender can update this message")
        
        # Handle deletion
        if update_data.is_deleted is not None:
            message.is_deleted = update_data.is_deleted
            
            # If deleting, no need to process content
            if update_data.is_deleted:
                message.updated_at = datetime.utcnow()
                db.commit()
                
                # Log the deletion using standardized security approach
                if self.security_handler:
                    self.security_handler.secure_log(
                        "Message deleted",
                        {"user_id": user_id, "message_id": message_id},
                        "info"
                    )
                
                # Notify other participants
                if self.notification_handler:
                    # Get other participants
                    participant_settings = db.query(UserConversationSettingsDB).filter(
                        UserConversationSettingsDB.conversation_id == message.conversation_id,
                        UserConversationSettingsDB.user_id != user_id
                    ).all()
                    
                    recipient_ids = [p.user_id for p in participant_settings]
                    
                    await self.notification_handler.notify_conversation_update(
                        message.conversation_id,
                        "message_deleted",
                        {"message_id": message_id},
                        recipient_ids
                    )
                
                return self._message_to_dict(message)
        
        # Handle content update
        if update_data.content is not None:
            # Validate updated content using standardized security approach
            if self.security_handler:
                is_valid = self.security_handler.validate_message_request({"content": update_data.content})
                if not is_valid:
                    raise HTTPException(status_code=400, detail="Invalid message content")
            
            # Process content based on conversation encryption setting
            content = update_data.content
            
            # Get conversation to check encryption setting
            conversation = db.query(ConversationDB).filter(
                ConversationDB.id == message.conversation_id
            ).first()
            
            is_encrypted = conversation and conversation.is_encrypted
            
            # Encrypt content if needed using standardized security approach
            if is_encrypted and content and self.security_handler:
                encrypted_content = self.security_handler.encrypt_message(content, message.conversation_id)
                content = encrypted_content
            
            message.content = content
            message.is_edited = True
            message.updated_at = datetime.utcnow()
            
            db.commit()
            
            # Log the update using standardized security approach
            if self.security_handler:
                self.security_handler.secure_log(
                    "Message updated",
                    {"user_id": user_id, "message_id": message_id},
                    "info"
                )
            
            # Notify other participants
            if self.notification_handler:
                # Get other participants
                participant_settings = db.query(UserConversationSettingsDB).filter(
                    UserConversationSettingsDB.conversation_id == message.conversation_id,
                    UserConversationSettingsDB.user_id != user_id
                ).all()
                
                recipient_ids = [p.user_id for p in participant_settings]
                
                await self.notification_handler.notify_conversation_update(
                    message.conversation_id,
                    "message_edited",
                    {"message_id": message_id},
                    recipient_ids
                )
        
        return self._message_to_dict(message, user_id=user_id, include_attachments=True)

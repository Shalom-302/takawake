"""
Conversation Service

This module implements the conversation handling service for the messaging plugin,
including conversation creation, retrieval, update, and management.
"""
import logging
import uuid
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import or_, and_

from ..models.conversation import (
    ConversationDB, UserConversationSettingsDB, GroupChatDB, UserBlockDB
)
from ..models.message import MessageDB
from ..schemas.conversation import (
    DirectConversationCreate, GroupConversationCreate,
    ConversationUpdate, GroupConversationUpdate, ConversationMemberAction,
    ChatUserResponse
)

# Import User model from auth plugin
from app.plugins.advanced_auth.models.user import User

logger = logging.getLogger(__name__)


class ConversationService:
    """
    Service for handling conversation operations, implementing the standardized
    security approach for all conversation management functions.
    """
    
    def __init__(self):
        """Initialize the conversation service."""
        self.security_handler = None
        self.notification_handler = None
        self.websocket_manager = None
    
    def init_handlers(self, security_handler, notification_handler, websocket_manager):
        """
        Initialize handlers after they are available.
        
        Args:
            security_handler: Security handler for secure conversation handling
            notification_handler: Notification handler for real-time updates
            websocket_manager: WebSocket manager for real-time connections
        """
        self.security_handler = security_handler
        self.notification_handler = notification_handler
        self.websocket_manager = websocket_manager
        logger.info("Conversation service initialized with security, notification, and websocket handlers")
    
    async def create_direct_conversation(self, db: Session, conversation_data: DirectConversationCreate, user_id: str) -> Dict[str, Any]:
        """Create a direct conversation between two users"""
        try:
            # Ensure we have participant IDs (should be at least one other user)
            if not conversation_data.participant_ids or len(conversation_data.participant_ids) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="At least one participant must be specified"
                )
            
            # For a direct conversation, we should have exactly one other participant
            if len(conversation_data.participant_ids) > 1:
                raise HTTPException(
                    status_code=400,
                    detail="A direct conversation should have exactly one other participant"
                )
            
            participant_id = conversation_data.participant_ids[0]
            
            # Check for user blocks (in both directions)
            block_exists = (
                db.query(UserBlockDB)
                .filter(
                    or_(
                        and_(UserBlockDB.blocker_id == user_id, UserBlockDB.blocked_id == participant_id),
                        and_(UserBlockDB.blocker_id == participant_id, UserBlockDB.blocked_id == user_id)
                    )
                )
                .first()
            ) is not None
            
            if block_exists:
                raise HTTPException(
                    status_code=403,
                    detail="Cannot create conversation with blocked user"
                )
            
            # Check if conversation already exists between these users
            existing_conversation = self._find_direct_conversation(db, user_id, participant_id)
            
            if existing_conversation:
                logger.info(f"Returning existing conversation between {user_id} and {participant_id}")
                return existing_conversation
            
            # Generate a unique conversation ID
            conversation_id = str(uuid.uuid4())
            logger.info(f"Creating new conversation with ID: {conversation_id}")
            
            # Create the new conversation
            new_conversation = ConversationDB(
                id=conversation_id,
                title=None,  # Direct conversations typically don't have titles
                conversation_type="direct",
                created_by=user_id,
                is_encrypted=conversation_data.is_encrypted,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            db.add(new_conversation)
            
            # Add both participants
            all_participants = [user_id, participant_id]
            
            for participant_user_id in all_participants:
                settings = UserConversationSettingsDB(
                    user_id=participant_user_id,
                    conversation_id=conversation_id,
                    role="member"
                )
                db.add(settings)
            
            # Commit to database
            db.commit()
            logger.info(f"Successfully created conversation {conversation_id} with participants {all_participants}")
            
            # Return the created conversation
            return await self.get_conversation(db, conversation_id, user_id)
        
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating direct conversation: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating conversation: {str(e)}"
            )
    
    async def create_group_conversation(self, db: Session, conversation_data: GroupConversationCreate, user_id: str) -> Dict[str, Any]:
        """
        Create a new group conversation.
        
        Args:
            db: Database session
            conversation_data: Conversation data
            user_id: ID of the creating user
            
        Returns:
            Created conversation
            
        Raises:
            HTTPException: If conversation creation fails
        """
        # Validate participant list
        participant_ids = list(set(conversation_data.participant_ids))  # Remove duplicates
        
        # Check if creator is in the participant list, add if not
        if user_id not in participant_ids:
            participant_ids.append(user_id)
        
        # Validate group size
        if len(participant_ids) > conversation_data.max_participants:
            raise HTTPException(
                status_code=400, 
                detail=f"Group size exceeds maximum ({len(participant_ids)} > {conversation_data.max_participants})"
            )
        
        # Check for blocked users
        blocks = db.query(UserBlockDB).filter(
            or_(
                and_(UserBlockDB.blocker_id == user_id, UserBlockDB.blocked_id.in_(participant_ids)),
                and_(UserBlockDB.blocker_id.in_(participant_ids), UserBlockDB.blocked_id == user_id)
            )
        ).all()
        
        if blocks:
            blocked_ids = [block.blocked_id if block.blocker_id == user_id else block.blocker_id 
                          for block in blocks]
            
            if self.security_handler:
                self.security_handler.secure_log(
                    "Group includes blocked users",
                    {"user_id": user_id, "blocked_users": blocked_ids},
                    "warning"
                )
            
            # Filter out blocked users
            participant_ids = [pid for pid in participant_ids 
                              if pid == user_id or pid not in blocked_ids]
            
            if len(participant_ids) <= 1:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot create group with only blocked users"
                )
        
        # Create a new conversation
        conversation_id = str(uuid.uuid4())
        
        # Generate encryption key for the conversation if needed
        encryption_key = None
        if conversation_data.is_encrypted and self.security_handler:
            encryption_key = self.security_handler.generate_conversation_key(conversation_id)
            self.security_handler.store_conversation_key(conversation_id, encryption_key)
        
        # Create conversation record
        new_conversation = ConversationDB(
            id=conversation_id,
            conversation_type="group",
            title=conversation_data.title,
            avatar_url=conversation_data.avatar_url,
            created_by=user_id,
            is_encrypted=conversation_data.is_encrypted,
            conversation_metadata=conversation_data.metadata
        )
        
        db.add(new_conversation)
        db.flush()  # Flush to get the conversation ID
        
        # Create group chat settings
        group_settings = GroupChatDB(
            conversation_id=conversation_id,
            description=conversation_data.description,
            max_participants=conversation_data.max_participants,
            is_public=conversation_data.is_public,
            join_mode=conversation_data.join_mode,
            message_permission=conversation_data.message_permission,
            who_can_invite=conversation_data.who_can_invite,
            who_can_remove=conversation_data.who_can_remove
        )
        
        db.add(group_settings)
        
        # Add participants
        for idx, participant_id in enumerate(participant_ids):
            # Creator is admin, others are members
            role = "admin" if participant_id == user_id else "member"
            
            settings = UserConversationSettingsDB(
                user_id=participant_id,
                conversation_id=conversation_id,
                role=role
            )
            db.add(settings)
        
        # Commit the transaction
        db.commit()
        db.refresh(new_conversation)
        
        # Register the conversation with the WebSocket manager
        if self.websocket_manager:
            self.websocket_manager.register_conversation(conversation_id, participant_ids)
        
        # Log the conversation creation using standardized security approach
        if self.security_handler:
            self.security_handler.secure_log(
                "Group conversation created",
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "participant_count": len(participant_ids),
                    "is_encrypted": conversation_data.is_encrypted
                }
            )
        
        conversation_dict = self._conversation_to_dict(new_conversation, user_id, include_group_settings=True)
        
        # Notify other participants about new conversation
        if self.notification_handler:
            recipient_ids = [pid for pid in participant_ids if pid != user_id]
            
            if recipient_ids:
                await self.notification_handler.notify_conversation_update(
                    conversation_id,
                    "conversation_created",
                    conversation_dict,
                    recipient_ids
                )
        
        return conversation_dict
    
    async def get_conversation(self, db: Session, conversation_id: str, user_id: str) -> Dict[str, Any]:
        """
        Retrieve a single conversation by ID.
        
        Args:
            db: Database session
            conversation_id: ID of the conversation to retrieve
            user_id: ID of the requesting user
            
        Returns:
            Conversation data
            
        Raises:
            HTTPException: If conversation retrieval fails
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
        
        # Fetch the conversation
        conversation = db.query(ConversationDB).filter(
            ConversationDB.id == conversation_id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get the last message for this conversation
        last_message = db.query(MessageDB).filter(
            MessageDB.conversation_id == conversation_id
        ).order_by(MessageDB.created_at.desc()).first()
        
        # Get count of unread messages
        unread_count = db.query(MessageDB).join(
            MessageReceiptDB, 
            and_(
                MessageReceiptDB.message_id == MessageDB.id,
                MessageReceiptDB.user_id == user_id,
                MessageReceiptDB.status.in_(["sent", "delivered"])
            )
        ).filter(
            MessageDB.conversation_id == conversation_id,
            MessageDB.sender_id != user_id
        ).count()
        
        # Convert to dict and include additional data
        include_group_settings = conversation.conversation_type == "group"
        conversation_dict = self._conversation_to_dict(
            conversation, 
            user_id, 
            include_group_settings=include_group_settings,
            last_message=last_message,
            unread_count=unread_count
        )
        
        return conversation_dict
        
    async def get_conversations(self, db: Session, user_id: str,
                               limit: int = 50, offset: int = 0,
                               filter_archived: bool = False,
                               filter_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieve all conversations for a user.
        
        Args:
            db: Database session
            user_id: ID of the requesting user
            limit: Maximum number of conversations to retrieve
            offset: Offset for pagination
            filter_archived: If True, only include archived conversations
            filter_type: Optional type to filter by ('direct' or 'group')
            
        Returns:
            Dictionary with conversations and pagination info
        """
        # Get all conversation IDs for this user
        query = db.query(UserConversationSettingsDB).filter(
            UserConversationSettingsDB.user_id == user_id
        )
        
        # Apply archive filter if needed
        if filter_archived:
            query = query.filter(UserConversationSettingsDB.is_archived == True)
            
        # Get total count for pagination
        total_count = query.count()
        
        # Apply pagination
        user_settings = query.order_by(
            UserConversationSettingsDB.is_pinned.desc(),
            UserConversationSettingsDB.updated_at.desc()
        ).offset(offset).limit(limit).all()
        
        # Get all conversation IDs
        conversation_ids = [settings.conversation_id for settings in user_settings]
        
        # Get all conversations
        conversations_query = db.query(ConversationDB).filter(
            ConversationDB.id.in_(conversation_ids)
        )
        
        # Apply type filter if needed
        if filter_type:
            conversations_query = conversations_query.filter(
                ConversationDB.conversation_type == filter_type
            )
            
        conversations = conversations_query.all()
        
        # Get all group chat settings for group conversations
        group_chat_ids = [c.id for c in conversations if c.conversation_type == "group"]
        group_settings_map = {}
        
        if group_chat_ids:
            group_settings = db.query(GroupChatDB).filter(
                GroupChatDB.conversation_id.in_(group_chat_ids)
            ).all()
            
            group_settings_map = {gs.conversation_id: gs for gs in group_settings}
        
        # Get last messages for conversations
        last_messages_map = {}
        
        for conversation_id in conversation_ids:
            last_message = db.query(MessageDB).filter(
                MessageDB.conversation_id == conversation_id
            ).order_by(MessageDB.created_at.desc()).first()
            
            if last_message:
                last_messages_map[conversation_id] = last_message
                
        # Get unread counts for conversations
        unread_counts_map = {}
        
        for conversation_id in conversation_ids:
            unread_count = db.query(MessageDB).join(
                MessageReceiptDB, 
                and_(
                    MessageReceiptDB.message_id == MessageDB.id,
                    MessageReceiptDB.user_id == user_id,
                    MessageReceiptDB.status.in_(["sent", "delivered"])
                )
            ).filter(
                MessageDB.conversation_id == conversation_id,
                MessageDB.sender_id != user_id
            ).count()
            
            unread_counts_map[conversation_id] = unread_count
        
        # Create response items
        conversation_dicts = []
        
        for conversation in conversations:
            conversation_id = conversation.id
            
            # Get user settings for this conversation
            user_setting = next((s for s in user_settings if s.conversation_id == conversation_id), None)
            
            include_group_settings = conversation.conversation_type == "group"
            last_message = last_messages_map.get(conversation_id)
            unread_count = unread_counts_map.get(conversation_id, 0)
            
            conversation_dict = self._conversation_to_dict(
                conversation, 
                user_id, 
                include_group_settings=include_group_settings,
                user_settings=user_setting,
                last_message=last_message,
                unread_count=unread_count,
                group_settings=group_settings_map.get(conversation_id)
            )
            
            conversation_dicts.append(conversation_dict)
        
        # Sort by last message time (if available) or updated time
        conversation_dicts.sort(
            key=lambda x: (
                x.get("is_pinned", False),
                x.get("last_message_at") or x.get("updated_at")
            ),
            reverse=True
        )
        
        # Log the retrieval using standardized security approach
        if self.security_handler:
            self.security_handler.secure_log(
                "Retrieved user conversations",
                {
                    "user_id": user_id,
                    "count": len(conversation_dicts),
                    "total": total_count,
                    "filter_type": filter_type,
                    "filter_archived": filter_archived
                }
            )
        
        return {
            "conversations": conversation_dicts,
            "total": total_count,
            "page": offset // limit + 1 if limit else 1,
            "size": limit
        }
    
    async def get_blocked_users(self, db: Session, user_id: str) -> List[UserBlockDB]:
        """
        Get all users blocked by the specified user.
        
        Args:
            db: Database session
            user_id: ID of the user
            
        Returns:
            List of blocked user records
        """
        try:
            return db.query(UserBlockDB).filter(UserBlockDB.blocker_id == user_id).all()
        except Exception as e:
            # La table n'existe pas encore dans la base de données
            logger.warning(f"Error accessing blocked users table: {str(e)}. This is expected if the table hasn't been created yet.")
            # Important: annuler la transaction pour permettre aux requêtes suivantes de fonctionner
            db.rollback()
            return []
    
    async def search_users_for_chat(self, db: Session, current_user_id: str, search_query: str, limit: int = 20) -> List[ChatUserResponse]:
        """
        Search for users to start a chat with.
        
        Args:
            db: Database session
            current_user_id: ID of the current user
            search_query: Search string to match against username, first or last name
            limit: Maximum number of results to return
            
        Returns:
            List of users matching the search criteria
            
        Security:
            - Excludes the current user
            - Excludes blocked users
            - Only returns non-sensitive user data
            - Limited number of results
        """
        logger.info(f"Starting user search with query: '{search_query}', current_user_id: {current_user_id}")
        
        # Get blocked users
        blocked_users = await self.get_blocked_users(db, current_user_id)
        blocked_ids = [block.blocked_id for block in blocked_users]
        logger.info(f"Found {len(blocked_ids)} blocked users for current user")
        
        # Build query with search conditions
        search_filter = or_(
            User.username.ilike(f"%{search_query}%"),
            User.first_name.ilike(f"%{search_query}%"),
            User.last_name.ilike(f"%{search_query}%"),
            User.email.ilike(f"%{search_query}%") # Optionally include email
        )
        logger.info(f"Created search filter for query: '{search_query}'")
        
        # Query users
        query = db.query(
            User.id,
            User.username,
            User.first_name, 
            User.last_name,
            User.profile_picture,
            User.last_login.label("last_seen")
        ).filter(
            and_(
                User.id != current_user_id,  # Exclude current user
                User.is_active == True       # Only active users
            )
        )
        
        # Add blocked users filter only if there are blocked users
        if blocked_ids:
            query = query.filter(~User.id.in_(blocked_ids))
            
        logger.info("Created base query excluding current user and blocked users")
        
        # Add search filter if query provided
        if search_query:
            query = query.filter(search_filter)
            logger.info("Applied search filter to query")
        
        # Get results with limit
        logger.info(f"Executing query with limit: {limit}")
        try:
            # Print SQL query for debugging
            sql_query = str(query.statement.compile(compile_kwargs={"literal_binds": True}))
            logger.info(f"SQL Query: {sql_query}")
            
            results = query.limit(limit).all()
            logger.info(f"Query returned {len(results)} results")
            
            # Debug result details
            for i, user in enumerate(results):
                logger.info(f"Result {i+1}: id={user.id}, username={user.username}, first_name={user.first_name}, last_name={user.last_name}")
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            db.rollback()  # Rollback transaction to allow future queries to work
            raise
        
        # Convert to response schema
        chat_users = []
        for user in results:
            chat_users.append(
                ChatUserResponse(
                    id=str(user.id),
                    username=user.username,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    profile_picture=user.profile_picture,
                    last_seen=user.last_seen
                )
            )
        
        logger.info(f"Returning {len(chat_users)} users in response")
        return chat_users
    
    def _find_direct_conversation(self, db: Session, user_id: str, other_user_id: str) -> Optional[ConversationDB]:
        """
        Find a direct conversation between two users if it exists.
        
        Args:
            db: Database session
            user_id: First user ID
            other_user_id: Second user ID
            
        Returns:
            Conversation if found, None otherwise
        """
        # Get all conversation IDs that user_id participates in
        user_conversation_ids = db.query(UserConversationSettingsDB.conversation_id).filter(
            UserConversationSettingsDB.user_id == user_id
        ).all()
        
        user_conversation_ids = [c[0] for c in user_conversation_ids]
        
        if not user_conversation_ids:
            return None
        
        # Find conversations that both users participate in
        other_user_settings = db.query(UserConversationSettingsDB).filter(
            UserConversationSettingsDB.user_id == other_user_id,
            UserConversationSettingsDB.conversation_id.in_(user_conversation_ids)
        ).all()
        
        other_user_conversation_ids = [s.conversation_id for s in other_user_settings]
        
        if not other_user_conversation_ids:
            return None
        
        # Find a direct conversation among these shared conversations
        conversation = db.query(ConversationDB).filter(
            ConversationDB.id.in_(other_user_conversation_ids),
            ConversationDB.conversation_type == "direct"
        ).first()
        
        return conversation
    
    def _conversation_to_dict(self, conversation: ConversationDB, user_id: str,
                             include_group_settings: bool = False,
                             user_settings: Optional[UserConversationSettingsDB] = None,
                             last_message: Optional[MessageDB] = None,
                             unread_count: int = 0,
                             group_settings: Optional[GroupChatDB] = None) -> Dict[str, Any]:
        """
        Convert a conversation model to a dictionary with additional data.
        
        Args:
            conversation: Conversation model
            user_id: ID of the requesting user
            include_group_settings: Whether to include group chat settings
            user_settings: Optional user conversation settings
            last_message: Optional last message in the conversation
            unread_count: Number of unread messages
            group_settings: Optional group chat settings
            
        Returns:
            Dictionary representation of the conversation
        """
        # Get basic conversation data
        result = {
            "id": conversation.id,
            "conversation_type": conversation.conversation_type,
            "title": conversation.title,
            "avatar_url": conversation.avatar_url,
            "is_encrypted": conversation.is_encrypted,
            "created_by": conversation.created_by,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "last_message_at": conversation.last_message_at,
            "unread_count": unread_count
        }
        
        # Add metadata if available, using standardized security approach
        if conversation.conversation_metadata and self.security_handler:
            try:
                result["metadata"] = self.security_handler.decrypt_metadata(conversation.conversation_metadata)
            except Exception as e:
                logger.error(f"Error decrypting conversation metadata: {str(e)}")
                result["metadata"] = {}
        else:
            result["metadata"] = {}
        
        # Add user settings if available
        if user_settings:
            result.update({
                "is_muted": user_settings.is_muted,
                "is_pinned": user_settings.is_pinned,
                "is_archived": user_settings.is_archived,
                "custom_name": user_settings.custom_name,
                "theme_color": user_settings.theme_color,
                "notification_level": user_settings.notification_level,
                "role": user_settings.role,
                "last_read_message_id": user_settings.last_read_message_id
            })
        
        # Add group settings if this is a group and we should include them
        if include_group_settings and conversation.conversation_type == "group":
            # Use provided group settings if available, otherwise fetch from DB
            if not group_settings:
                # This would require a database session, which we might not have
                # In a real implementation, this should be handled by passing group_settings
                pass
                
            if group_settings:
                result.update({
                    "description": group_settings.description,
                    "max_participants": group_settings.max_participants,
                    "is_public": group_settings.is_public,
                    "join_mode": group_settings.join_mode,
                    "message_permission": group_settings.message_permission,
                    "who_can_invite": group_settings.who_can_invite,
                    "who_can_remove": group_settings.who_can_remove
                })
        
        # Add last message if available
        if last_message:
            # In a real implementation, we would convert the message to a dict
            # and possibly decrypt its content
            content = last_message.content
            if last_message.is_encrypted and self.security_handler:
                try:
                    content = self.security_handler.decrypt_message(
                        content, user_id
                    )
                except Exception as e:
                    logger.error(f"Error decrypting message content: {str(e)}")
                    content = None
                    
            result["last_message"] = {
                "id": last_message.id,
                "sender_id": last_message.sender_id,
                "message_type": last_message.message_type,
                "content": content,
                "is_deleted": last_message.is_deleted,
                "created_at": last_message.created_at
            }
        
        return result

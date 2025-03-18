"""
Social Subscriptions Plugin

Main integration module for the social subscriptions plugin.
This plugin enables users to:
- Subscribe to other users for notifications on specific activities
- Receive personalized activity feeds
- Manage subscription preferences and categories
- Process activity events and generate notifications

Security features include:
- Encryption of sensitive metadata
- Validation of subscription and activity requests
- Comprehensive logging of all subscription and notification events
"""

import logging
from fastapi import FastAPI, APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.db import get_db, Base, engine

# Import models
from .models.database import (
    Subscription,
    ActivityEvent,
    FeedItem,
    NotificationRecord,
    UserPreference
)

# Import routes and dependencies
from .routes.subscription import router as subscription_router, get_subscription_service
from .routes.feed import router as feed_router, get_feed_service, get_activity_service
from .routes.preferences import router as preferences_router, get_notification_service

# Import handlers and services
from .handlers.security_handler import SecurityHandler
from .services.subscription_service import SubscriptionService
from .services.activity_service import ActivityService
from .services.feed_service import FeedService
from .services.notification_service import NotificationService


class SocialSubscriptionsPlugin:
    """
    Plugin for managing user subscriptions, activity feeds, and social notifications
    """
    
    def __init__(self):
        """Initialize the Social Subscriptions plugin"""
        self.router = APIRouter(prefix="/social", tags=["social"])
        self.logger = logging.getLogger(__name__)
        
        # Initialize security handler
        self.security_handler = SecurityHandler()
        
        # Initialize services
        self.subscription_service = None
        self.activity_service = None
        self.feed_service = None
        self.notification_service = None
        
        self.logger.info("Social Subscriptions plugin initialized")
    
    def initialize(self):
        """Initialize plugin components"""
        try:
            # Les tables de base de données sont désormais gérées par Alembic migrations
            # au lieu d'être créées directement ici
            
            # Initialize services with dependencies
            self.subscription_service = SubscriptionService(self.security_handler)
            self.activity_service = ActivityService(self.security_handler, self.subscription_service)
            self.feed_service = FeedService(self.security_handler, self.subscription_service, self.activity_service)
            self.notification_service = NotificationService(self.security_handler, self.activity_service)
            
            # Include sub-routers - dependency injection happens at the app level in setup_social_subscriptions
            self.router.include_router(subscription_router)
            self.router.include_router(feed_router)
            self.router.include_router(preferences_router)
            
            self.logger.info("Social Subscriptions plugin services initialized successfully")
        except Exception as e:
            self.logger.error(f"Error initializing Social Subscriptions plugin: {e}")
            raise
    
    async def create_standard_subscription(
        self,
        db: Session,
        subscriber_id: str,
        publisher_id: str,
        categories: list = None
    ) -> Subscription:
        """
        Create a standard subscription between users
        
        Args:
            db: Database session
            subscriber_id: ID of the subscriber
            publisher_id: ID of the publisher
            categories: Optional list of categories
            
        Returns:
            Created subscription object
        """
        from .schemas.subscription import SubscriptionCreate
        
        # Create subscription data
        data = SubscriptionCreate(
            publisher_id=publisher_id,
            categories=categories or ["post", "update"]
        )
        
        # Create subscription using service
        return await self.subscription_service.create_subscription(db, subscriber_id, data)
    
    async def create_standard_activity(
        self,
        db: Session,
        publisher_id: str,
        activity_type: str,
        resource_type: str,
        resource_id: str,
        title: str = None,
        description: str = None,
        metadata: dict = None
    ) -> ActivityEvent:
        """
        Create a standard activity event
        
        Args:
            db: Database session
            publisher_id: ID of the publisher
            activity_type: Type of activity
            resource_type: Type of resource
            resource_id: ID of the resource
            title: Optional title
            description: Optional description
            metadata: Optional metadata
            
        Returns:
            Created activity event
        """
        return await self.activity_service.create_standard_activity(
            db,
            publisher_id,
            activity_type,
            resource_type,
            resource_id,
            title,
            description,
            metadata
        )
    
    async def process_activity(
        self,
        db: Session,
        activity_id: int
    ) -> int:
        """
        Process an activity for feeds and notifications
        
        Args:
            db: Database session
            activity_id: ID of the activity
            
        Returns:
            Number of feed items created
        """
        # Process activity for feeds
        feed_count = await self.feed_service.process_activity_for_feeds(db, activity_id)
        
        # Process activity for notifications
        notification_count = await self.notification_service.process_activity_notifications(db, activity_id)
        
        self.logger.info(
            f"Processed activity {activity_id}: created {feed_count} feed items and {notification_count} notifications"
        )
        
        return feed_count + notification_count
    
    async def get_user_feed(
        self,
        db: Session,
        user_id: str,
        skip: int = 0,
        limit: int = 20
    ):
        """
        Get a user's activity feed
        
        Args:
            db: Database session
            user_id: ID of the user
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of feed items
        """
        from .schemas.subscription import FeedFilter
        
        # Create empty filter
        filter_params = FeedFilter()
        
        # Get chronological feed
        return await self.feed_service.get_user_feed(
            db, user_id, filter_params, "chronological", skip, limit
        )


# Create plugin instance
social_subscriptions_plugin = SocialSubscriptionsPlugin()


def setup_social_subscriptions(app: FastAPI):
    """
    Configure the Social Subscriptions plugin
    
    Args:
        app: FastAPI application
    """
    try:
        # Initialize the plugin
        social_subscriptions_plugin.initialize()
        
        # Configure the dependency injection at the application level
        # This is the correct place to set dependency_overrides
        app.dependency_overrides[get_subscription_service] = lambda: social_subscriptions_plugin.subscription_service
        app.dependency_overrides[get_activity_service] = lambda: social_subscriptions_plugin.activity_service
        app.dependency_overrides[get_feed_service] = lambda: social_subscriptions_plugin.feed_service
        app.dependency_overrides[get_notification_service] = lambda: social_subscriptions_plugin.notification_service
        
        # Include router
        app.include_router(social_subscriptions_plugin.router)
        
        logging.getLogger(__name__).info("Social Subscriptions plugin configured successfully")
    except Exception as e:
        logging.getLogger(__name__).error(f"Error setting up Social Subscriptions plugin: {e}")
        raise

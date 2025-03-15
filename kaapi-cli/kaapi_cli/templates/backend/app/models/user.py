# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base
# from app.plugins.security import db_encryptor


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("role.id"), nullable=False)
    ssn = Column(String)  # Social Security Number
    role = relationship("Role")
    push_subscriptions = relationship("PushSubscription", back_populates="user")

# db_encryptor.register_model(User, ['ssn', 'medical_history'])

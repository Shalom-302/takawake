# backend/app/models/role.py
from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Role(Base):
    __tablename__ = "role"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
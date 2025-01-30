# backend/app/models/resource_definition.py
from sqlalchemy import Column, Integer, String, Text, JSON
from app.db import Base

class ResourceDefinition(Base):
    __tablename__ = "kaapi_resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    # We'll store the fields as JSON in a Text column
    # so we can parse them in Python. Alternatively, if your DB supports JSON, you can use a JSON type.
    fields = Column(JSON, nullable=False)

from sqlalchemy import Column, String, Boolean
from app.core.db import Base

class KaapiPlugin(Base):
    __tablename__ = "kaapi_plugins"

    name = Column(String(100), primary_key=True, index=True)
    enabled = Column(Boolean, nullable=False, default=True)

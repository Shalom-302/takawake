from abc import ABC, abstractmethod
from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session

class AuthResult(BaseModel):
    access_token: str
    token_type: str = "bearer"

class BaseAuthProvider(ABC):
    name: str
    description: str
    enabled: bool = False
    
    def __init__(self):
        self.router = APIRouter()
        self._register_routes()

    @abstractmethod
    def _register_routes(self):
        """Register FastAPI routes for this provider"""
        pass

    @abstractmethod
    async def authenticate(self, credentials: dict, db: Session) -> AuthResult:
        """Core authentication logic"""
        pass

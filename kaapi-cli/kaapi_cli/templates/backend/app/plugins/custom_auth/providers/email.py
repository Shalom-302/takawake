from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..base import BaseAuthProvider, AuthResult
from app.db import get_db
from app.models.user import User
import hashlib
import jwt
import datetime
import os

class EmailAuthProvider(BaseAuthProvider):
    name = "email"
    description = "Email/password authentication"

    # def _register_routes(self):
    #     self.router.add_api_route(
    #         "/login/email",
    #         self.handle_login,
    #         methods=["POST"],
    #         response_model=AuthResult
    #     )

    async def handle_login(self, username: str, password: str, db: Session = Depends(get_db)):
        return await self.authenticate({"username": username, "password": password}, db)

    async def authenticate(self, credentials: dict, db: Session) -> AuthResult:
        user = db.query(User).filter(User.username == credentials["username"]).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        hashed_input = hashlib.sha256(credentials["password"].encode()).hexdigest()
        if hashed_input != user.hashed_password:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        payload = {
            "sub": str(user.id),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            "auth_provider": self.name
        }
        token = jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")
        return AuthResult(access_token=token)
    
    async def handle_register(self, username: str, password: str, db: Session = Depends(get_db)):
        hashed_input = hashlib.sha256(password.encode()).hexdigest()
        db_user = User(username=username, hashed_password=hashed_input)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return {"message": "User created"}

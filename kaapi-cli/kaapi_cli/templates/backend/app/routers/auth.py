# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.user import User
import jwt
import hashlib
import datetime

SECRET_KEY = "CHANGE_THIS_TO_SOMETHING_SECURE"  # For production, load from .env

router = APIRouter()
oauth2_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token invalid")
        # Optionally fetch user from DB if needed
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Token invalid")
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Token(BaseModel):
    access_token: str

class LoginModel(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=Token)
def login(data: LoginModel, db: Session = Depends(get_db)):
    # 1. Find user by username
    user = db.query(User).filter(User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 2. Verify password
    hashed_input = hashlib.sha256(data.password.encode()).hexdigest()
    if hashed_input != user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 3. Generate JWT
    payload = {
        "sub": user.username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),  # token valid 1h
        "iat": datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return {"access_token": token}

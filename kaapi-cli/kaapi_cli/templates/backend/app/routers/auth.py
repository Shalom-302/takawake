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
import os

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME")  # load from .env in real usage
ALGORITHM = "HS256"

router = APIRouter()
oauth2_scheme = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    1) Decode the JWT token from 'credentials.credentials'.
    2) Extract the user_id from the token payload (sub as string, convert to int).
    3) Fetch the user from the database.
    4) Return the user object.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")  # sub is stored as a string
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalid: no user ID"
            )
        # convert to int
        user_id = int(user_id_str)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
        )
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid"
        )
    except ValueError:
        # e.g. int() conversion failed
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid user ID"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    return user

def require_role(*allowed_roles: str):
    """
    Use as a dependency to ensure the current user has one of the allowed roles.
    e.g. @router.get("/admin-only", dependencies=[Depends(require_role("Admin"))])
    """
    def wrapper(current_user: User = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(status_code=403, detail="Forbidden: insufficient role")
        return current_user
    return wrapper




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
        "sub": str(user.id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),  # token valid 1h
        "iat": datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return {"access_token": token}

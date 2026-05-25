from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from src.core.config import settings

from functools import lru_cache

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@lru_cache()
def get_private_key() -> str:
    with open(settings.PRIVATE_KEY_PATH, 'r') as f:
        return f.read()

@lru_cache()
def get_public_key() -> str:
    with open(settings.PUBLIC_KEY_PATH, 'r') as f:
        return f.read()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: str | int, user_type: str = None, role: str = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    if user_type:
        to_encode["user_type"] = user_type
    if role:
        to_encode["role"] = role
    return jwt.encode(to_encode, get_private_key(), algorithm=settings.ALGORITHM)

def create_refresh_token(subject: str | int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    return jwt.encode(to_encode, get_private_key(), algorithm=settings.ALGORITHM)

def verify_token(token: str) -> dict:
    return jwt.decode(token, get_public_key(), algorithms=[settings.ALGORITHM])
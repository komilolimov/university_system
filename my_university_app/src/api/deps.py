from typing import Generator
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

# Импортируем движок базы данных (убедись, что путь верный, обычно src/core/db.py)
from src.core.db import engine 
from src.core.security import verify_token
from src.core.redis_client import token_blocklist
from src.core.config import settings
from src.core.i18n import translate

security = HTTPBearer()

# Тот самый пропущенный "кран" для базы данных
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def get_language(request: Request) -> str:
    lang_header = request.headers.get("Accept-Language", "en")
    if lang_header:
        primary_lang = lang_header.split(",")[0].split("-")[0].strip().lower()
        if primary_lang in ["en", "ru", "it"]:
            return primary_lang
    return "en"

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    lang: str = Depends(get_language)
):
    token = credentials.credentials
    
    # Проверка черного списка в Redis
    if token_blocklist.get(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate("Token has been revoked (Logged out)", lang),
        )
        
    try:
        payload = verify_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail=translate("Invalid token type", lang))
        
        user_id = payload.get("sub")
        user_type = payload.get("user_type")
        role = payload.get("role")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail=translate("Invalid token", lang))
            
        return {"user_id": user_id, "user_type": user_type, "role": role}
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translate("Could not validate credentials", lang),
            headers={"WWW-Authenticate": "Bearer"},
        )

class RequireRole:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user), lang: str = Depends(get_language)):
        if user.get("role") not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=translate("Not enough permissions", lang)
            )
        return user
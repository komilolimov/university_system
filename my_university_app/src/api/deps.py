from typing import Generator, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from src.core.db import engine 
from src.core.security import verify_token
from src.core.redis_client import token_blocklist
from src.core.config import settings
from src.core.i18n import translate

# Импортируем модель Employee для проверки прав в БД
from src.models.employee import Employee

security = HTTPBearer()

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
    """Старая проверка по названию роли (оставляем для совместимости/студентов)"""
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user), lang: str = Depends(get_language)):
        role = user.get("role")
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=translate("Not enough permissions", lang)
            )
            
        role_lower = role.lower()
        allowed_roles_lower = [r.lower() for r in self.allowed_roles]
        
        if role_lower in ["admin", "administrator"] or role_lower in allowed_roles_lower:
            return user
            
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=translate("Not enough permissions", lang)
        )


class RequirePermission:
    """
    Новая умная проверка по правам. 
    Пользователь должен иметь ХОТЯ БЫ ОДНО из переданных прав.
    """
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions

    def __call__(
        self, 
        current_user: dict = Depends(get_current_user), 
        session: Session = Depends(get_session),
        lang: str = Depends(get_language)
    ):
        user_id = current_user.get("user_id")
        user_type = current_user.get("user_type")

        # Права проверяем только у сотрудников. Студентов сюда не пускаем.
        if user_type != "employee":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=translate("Not enough permissions. Employees only.", lang)
            )

        # Достаем свежие данные сотрудника из БД
        employee = session.get(Employee, int(user_id))
        
        # Если юзера удалили, но токен еще жив, или у него нет роли
        if not employee or not employee.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=translate("Role or permissions missing", lang)
            )

        # Чит-код для Супер-Админа (всегда пропускаем)
        if employee.role.title in ["Admin", "Administrator"]:
            return current_user

        # Собираем права юзера и проверяем пересечение
        user_permissions = [p.name for p in employee.role.permissions]
        has_permission = any(perm in user_permissions for perm in self.required_permissions)

        if not has_permission:
            # Формируем красивую строку с требуемыми правами для вывода ошибки
            req_perms_str = ", ".join(self.required_permissions)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=translate(f"Not enough permissions. Required one of: {req_perms_str}", lang)
            )
            
        return current_user
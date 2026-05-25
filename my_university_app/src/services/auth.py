from sqlmodel import Session, select
from datetime import timedelta

from src.core.exceptions import EntityNotFoundError, InvalidCredentialsError
from src.models import Employee, Student, Role
from src.core.security import verify_password, create_access_token, create_refresh_token
from src.core.redis_client import token_blocklist
from src.core.config import settings

class AuthService:
    def __init__(self, session: Session):
        self.session = session

    def authenticate_user(self, email: str, password: str) -> tuple[Employee | Student | None, str | None, str | None]:
        # 1. Сначала ищем почту среди сотрудников
        user = self.session.exec(select(Employee).where(Employee.email == email)).first()
        user_type = "employee"
        role_title = None
        
        if user:
            role_obj = self.session.exec(select(Role).where(Role.id == user.role_id)).first()
            if role_obj:
                role_title = role_obj.title
        
        # 2. Если не нашли, ищем среди студентов
        if not user:
            user = self.session.exec(select(Student).where(Student.email == email)).first()
            user_type = "student"
            role_title = "Student"
            
        # 3. Если пользователя вообще нет или пароль не подошел
        if not user or not verify_password(password, user.hashed_password):
            return None, None, None
            
        return user, user_type, role_title

    def login(self, email: str, password: str):
        # Вызываем нашу умную проверку
        user, user_type, role_title = self.authenticate_user(email, password)
        
        if not user:
            raise InvalidCredentialsError()
        access_token = create_access_token(subject=str(user.id), user_type=user_type, role=role_title)
        refresh_token = create_refresh_token(subject=str(user.id))
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
            "role": role_title,
            "user_type": user_type
        }

    def logout(self, token: str):
        try:
            from src.core.security import verify_token
            payload = verify_token(token)
            exp = payload.get("exp")
            if exp:
                from datetime import datetime, timezone
                now = datetime.now(timezone.utc).timestamp()
                ttl_seconds = int(exp - now)
                if ttl_seconds > 0:
                    expire_time = timedelta(seconds=ttl_seconds)
                    token_blocklist.setex(token, expire_time, "blocked")
                else:
                    # Token already expired, no need to add to Redis
                    pass
        except Exception:
            # If signature is invalid or token is already expired, we don't need to put it in Redis.
            pass
        return {"detail": "Successfully logged out"}
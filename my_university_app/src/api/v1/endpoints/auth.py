from typing import Union
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from fastapi.security import HTTPAuthorizationCredentials

from src.api.deps import get_session, get_current_user, security
from src.services.auth import AuthService
from src.models.student import Student, StudentRead
from src.models.employee import Employee, EmployeeRead
from src.models.roles import Role

router = APIRouter()

# В идеале эту схему стоит вынести в отдельный файл со схемами (schemas.py)
class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest, session: Session = Depends(get_session)):
    auth_service = AuthService(session)
    return auth_service.login(email=request.email, password=request.password)

@router.post("/logout")
def logout(
    session: Session = Depends(get_session),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    auth_service = AuthService(session)
    return auth_service.logout(token=credentials.credentials)


@router.get("/me", response_model=Union[StudentRead, EmployeeRead])
def get_me(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_id = int(current_user["user_id"])
    user_type = current_user["user_type"]

    if user_type == "student":
        user = session.get(Student, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_dict = user.model_dump()
        user_dict["permissions"] = []

        return StudentRead(**user_dict)

    user = session.get(Employee, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    permissions = []

    if user.role_id:
        db_role = session.get(Role, user.role_id)

        if db_role:
            role_name = db_role.title.lower()

            if role_name in ["admin", "administrator"]:
                permissions = ["*"]
            elif db_role.permissions:
                permissions = [permission.name for permission in db_role.permissions]

    user_dict = user.model_dump()
    user_dict["permissions"] = permissions

    return EmployeeRead(**user_dict)


@router.get("/permissions")
def get_permissions(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    role = current_user.get("role")
    
    if not role:
        return {"permissions": []}
        
    role_lower = role.lower()
    
    if role_lower in ["admin", "administrator"]:
        return {"permissions": ["*"]}
        
    # Извлекаем роль и её права из БД
    db_role = session.exec(select(Role).where(Role.title == role)).first()
    if db_role and db_role.permissions:
        return {"permissions": [p.name for p in db_role.permissions]}
        
    return {"permissions": []}
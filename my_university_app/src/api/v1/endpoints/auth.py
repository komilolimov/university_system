from fastapi import APIRouter, Depends
from sqlmodel import Session
from src.api.deps import get_session, get_current_user
from src.api.deps import get_session
from src.services.auth import AuthService
from pydantic import BaseModel
from fastapi.security import HTTPAuthorizationCredentials
from src.api.deps import security


router = APIRouter()

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

from typing import Union
from fastapi import HTTPException
from src.models.student import Student, StudentRead
from src.models.employee import Employee, EmployeeRead

@router.get("/me", response_model=Union[StudentRead, EmployeeRead])
def get_me(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    user_id = int(current_user["user_id"])
    user_type = current_user["user_type"]
    role = current_user.get("role")
    
    if user_type == "student":
        user = session.get(Student, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_dict = user.model_dump()
        user_dict["permissions"] = []
        return StudentRead(**user_dict)
    else:
        user = session.get(Employee, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_dict = user.model_dump()
        if role in ["Admin", "Administrator"]:
            user_dict["permissions"] = ["*"]
        else:
            user_dict["permissions"] = []
        return EmployeeRead(**user_dict)

@router.get("/permissions")
def get_permissions(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    
    if not role:
        return {"permissions": []}
        
    role_lower = role.lower()
    
    if role_lower in ["admin", "administrator"]:
        return {"permissions": ["*"]}
        
    # В будущем здесь можно подтягивать реальные права из БД
    return {"permissions": []}
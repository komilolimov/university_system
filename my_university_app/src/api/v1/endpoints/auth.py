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
from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session
from fastapi.security import HTTPAuthorizationCredentials

# ИСПРАВЛЕНО: Заменили RequireRole на RequirePermission
from src.api.deps import get_session, get_current_user, RequirePermission
from src.services.students import student_service
from src.models.student import StudentRead, StudentCreate, StudentUpdate
from src.models.enums import RegionType
from src.models.auth import ChangePasswordRequest

router = APIRouter(prefix="/students", tags=["Students"])

# Делаем удобные алиасы для зависимостей
SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]


@router.get("/", response_model=List[StudentRead])
def get_students(
    session: SessionDep,
    current_user: CurrentUserDep,
    q: Optional[str] = Query(None, description="Search by first_name, last_name, email"),
    region: Optional[RegionType] = Query(None),
    advisor_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    return student_service.get_all(
        session=session, q=q, region=region, advisor_id=advisor_id, is_active=is_active, skip=skip, limit=limit
    )


@router.get("/{student_id}", response_model=StudentRead)
def get_student(student_id: int, session: SessionDep, current_user: CurrentUserDep):
    return student_service.get(session=session, id=student_id)

# ИСПРАВЛЕНО: Добавлено право students:write
@router.post("/", response_model=StudentRead, dependencies=[Depends(RequirePermission(["students:write"]))])
def create_student(student_in: StudentCreate, session: SessionDep):
    return student_service.create(session=session, obj_in=student_in)

# ИСПРАВЛЕНО: Добавлено право students:write
@router.put("/{student_id}", response_model=StudentRead, dependencies=[Depends(RequirePermission(["students:write"]))])
def update_student(student_id: int, student_in: StudentUpdate, session: SessionDep):
    return student_service.update(session=session, id=student_id, obj_in=student_in)

# ИСПРАВЛЕНО: Добавлено право students:delete
@router.delete("/{student_id}", dependencies=[Depends(RequirePermission(["students:delete"]))])
def delete_student(student_id: int, session: SessionDep):
    return student_service.delete(session=session, id=student_id)


@router.post("/change-password")
def change_student_password(
    session: SessionDep,
    current_user: CurrentUserDep,
    obj_in: ChangePasswordRequest
):
    if current_user.get("user_type") != "student":
        raise HTTPException(status_code=403, detail="Only students can change their student password")
    
    student_id = int(current_user["user_id"])
    student_service.change_password(session=session, id=student_id, obj_in=obj_in)
    return {"Success": "Password changed successfully"}
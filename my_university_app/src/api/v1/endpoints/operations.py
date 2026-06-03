from typing import List, Annotated
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

# ИСПРАВЛЕНО: Заменили RequireRole на RequirePermission
from src.api.deps import get_session, get_current_user, RequirePermission
from src.services.operations import student_program_service
from src.models.student import StudentProgramRead, StudentProgramCreate, StudentProgramUpdate

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

router = APIRouter(prefix="/student-programs", tags=["Student Programs"])

@router.get("/", response_model=List[StudentProgramRead])
def get_student_programs(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return student_program_service.get_all(session=session, skip=skip, limit=limit)

@router.get("/student/{student_id}", response_model=List[StudentProgramRead])
def get_programs_by_student(student_id: int, session: SessionDep, current_user: CurrentUserDep):
    return student_program_service.get_by_student(session=session, student_id=student_id)

@router.get("/{student_id}/{program_id}", response_model=StudentProgramRead)
def get_student_program(student_id: int, program_id: int, session: SessionDep, current_user: CurrentUserDep):
    return student_program_service.get(session=session, student_id=student_id, program_id=program_id)

# ИСПРАВЛЕНО: Добавлено право student_programs:write
@router.post("/", response_model=StudentProgramRead, dependencies=[Depends(RequirePermission(["student_programs:write"]))])
def create_student_program(obj_in: StudentProgramCreate, session: SessionDep):
    return student_program_service.create(session=session, obj_in=obj_in)

# ИСПРАВЛЕНО: Добавлено право student_programs:write
@router.put("/{student_id}/{program_id}", response_model=StudentProgramRead, dependencies=[Depends(RequirePermission(["student_programs:write"]))])
def update_student_program(student_id: int, program_id: int, obj_in: StudentProgramUpdate, session: SessionDep):
    return student_program_service.update(session=session, student_id=student_id, program_id=program_id, obj_in=obj_in)

# ИСПРАВЛЕНО: Добавлено право student_programs:delete
@router.delete("/{student_id}/{program_id}", dependencies=[Depends(RequirePermission(["student_programs:delete"]))])
def delete_student_program(student_id: int, program_id: int, session: SessionDep):
    return student_program_service.delete(session=session, student_id=student_id, program_id=program_id)
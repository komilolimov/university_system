from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from src.api.deps import get_session, get_current_user, RequireRole
from src.services.departments import department_service, school_service, research_lab_service
from src.models.department import (
    DepartmentRead, DepartmentCreate, DepartmentUpdate,
    ResearchLabRead, ResearchLabCreate, ResearchLabUpdate,
)
from src.models.school import SchoolRead, SchoolCreate, SchoolUpdate

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

department_router = APIRouter(prefix="/departments", tags=["Departments"])


@department_router.get("/", response_model=List[DepartmentRead])
def get_departments(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    q: Optional[str] = Query(None, description="Search by name"),
    school_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return department_service.get_all(session=session, q=q, school_id=school_id, skip=skip, limit=limit)


@department_router.get("/{department_id}", response_model=DepartmentRead)
def get_department(department_id: int, session: SessionDep, current_user: CurrentUserDep):
    return department_service.get(session=session, id=department_id)


@department_router.post("/", response_model=DepartmentRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_department(department: DepartmentCreate, session: SessionDep):
    return department_service.create(session=session, obj_in=department)


@department_router.put("/{department_id}", response_model=DepartmentRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_department(department_id: int, obj_in: DepartmentUpdate, session: SessionDep):
    return department_service.update(session=session, id=department_id, obj_in=obj_in)


@department_router.delete("/{department_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_department(department_id: int, session: SessionDep):
    return department_service.delete(session=session, id=department_id)


school_router = APIRouter(prefix="/schools", tags=["Schools"])


@school_router.get("/", response_model=List[SchoolRead])
def get_schools(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return school_service.get_all(session=session, skip=skip, limit=limit)


@school_router.get("/{school_id}", response_model=SchoolRead)
def get_school(school_id: int, session: SessionDep, current_user: CurrentUserDep):
    return school_service.get(session=session, id=school_id)


@school_router.post("/", response_model=SchoolRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_school(obj_in: SchoolCreate, session: SessionDep):
    return school_service.create(session=session, obj_in=obj_in)


@school_router.put("/{school_id}", response_model=SchoolRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_school(school_id: int, obj_in: SchoolUpdate, session: SessionDep):
    return school_service.update(session=session, id=school_id, obj_in=obj_in)


@school_router.delete("/{school_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_school(school_id: int, session: SessionDep):
    return school_service.delete(session=session, id=school_id)

research_lab_router = APIRouter(prefix="/research-labs", tags=["Research Labs"])

@research_lab_router.get("/", response_model=List[ResearchLabRead])
def get_research_labs(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return research_lab_service.get_all(session=session, skip=skip, limit=limit)


@research_lab_router.get("/{lab_id}", response_model=ResearchLabRead)
def get_research_lab(lab_id: int, session: SessionDep, current_user: CurrentUserDep):
    return research_lab_service.get(session=session, id=lab_id)


@research_lab_router.post("/", response_model=ResearchLabRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_research_lab(obj_in: ResearchLabCreate, session: SessionDep):
    return research_lab_service.create(session=session, obj_in=obj_in)


@research_lab_router.put("/{lab_id}", response_model=ResearchLabRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_research_lab(lab_id: int, obj_in: ResearchLabUpdate, session: SessionDep):
    return research_lab_service.update(session=session, id=lab_id, obj_in=obj_in)


@research_lab_router.delete("/{lab_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_research_lab(lab_id: int, session: SessionDep):
    return research_lab_service.delete(session=session, id=lab_id)

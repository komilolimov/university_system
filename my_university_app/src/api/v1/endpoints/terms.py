from typing import List, Annotated
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from src.api.deps import get_session, get_current_user, RequireRole
from src.services.terms import academic_term_service
from src.models.course import AcademicTermRead, AcademicTermCreate, AcademicTermUpdate

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

router = APIRouter(prefix="/academic-terms", tags=["Academic Terms"])


@router.get("/", response_model=List[AcademicTermRead])
def get_academic_terms(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return academic_term_service.get_all(session=session, skip=skip, limit=limit)


@router.get("/{term_id}", response_model=AcademicTermRead)
def get_academic_term(term_id: int, session: SessionDep, current_user: CurrentUserDep):
    return academic_term_service.get(session=session, id=term_id)


@router.post("/", response_model=AcademicTermRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_academic_term(obj_in: AcademicTermCreate, session: SessionDep):
    return academic_term_service.create(session=session, obj_in=obj_in)


@router.put("/{term_id}", response_model=AcademicTermRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_academic_term(term_id: int, obj_in: AcademicTermUpdate, session: SessionDep):
    return academic_term_service.update(session=session, id=term_id, obj_in=obj_in)


@router.delete("/{term_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_academic_term(term_id: int, session: SessionDep):
    return academic_term_service.delete(session=session, id=term_id)

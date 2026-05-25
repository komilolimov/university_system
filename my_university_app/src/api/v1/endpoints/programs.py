from typing import List, Annotated
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from src.api.deps import get_session, get_current_user, RequireRole
from src.services.programs import degree_program_service, program_requirement_service
from src.models.program import (
    DegreeProgramRead, DegreeProgramCreate, DegreeProgramUpdate,
    ProgramRequirementRead, ProgramRequirementCreate, ProgramRequirementUpdate,
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

degree_program_router = APIRouter(prefix="/degree-programs", tags=["Degree Programs"])


@degree_program_router.get("/", response_model=List[DegreeProgramRead])
def get_degree_programs(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return degree_program_service.get_all(session=session, skip=skip, limit=limit)


@degree_program_router.get("/{program_id}", response_model=DegreeProgramRead)
def get_degree_program(program_id: int, session: SessionDep, current_user: CurrentUserDep):
    return degree_program_service.get(session=session, id=program_id)


@degree_program_router.post("/", response_model=DegreeProgramRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_degree_program(obj_in: DegreeProgramCreate, session: SessionDep):
    return degree_program_service.create(session=session, obj_in=obj_in)


@degree_program_router.put("/{program_id}", response_model=DegreeProgramRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_degree_program(program_id: int, obj_in: DegreeProgramUpdate, session: SessionDep):
    return degree_program_service.update(session=session, id=program_id, obj_in=obj_in)


@degree_program_router.delete("/{program_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_degree_program(program_id: int, session: SessionDep):
    return degree_program_service.delete(session=session, id=program_id)


program_requirement_router = APIRouter(prefix="/program-requirements", tags=["Program Requirements"])


@program_requirement_router.get("/", response_model=List[ProgramRequirementRead])
def get_program_requirements(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return program_requirement_service.get_all(session=session, skip=skip, limit=limit)


@program_requirement_router.get("/{program_id}/{catalog_id}", response_model=ProgramRequirementRead)
def get_program_requirement(program_id: int, catalog_id: int, session: SessionDep, current_user: CurrentUserDep):
    return program_requirement_service.get(session=session, program_id=program_id, catalog_id=catalog_id)


@program_requirement_router.post("/", response_model=ProgramRequirementRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_program_requirement(obj_in: ProgramRequirementCreate, session: SessionDep):
    return program_requirement_service.create(session=session, obj_in=obj_in)


@program_requirement_router.put("/{program_id}/{catalog_id}", response_model=ProgramRequirementRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_program_requirement(program_id: int, catalog_id: int, obj_in: ProgramRequirementUpdate, session: SessionDep):
    return program_requirement_service.update(session=session, program_id=program_id, catalog_id=catalog_id, obj_in=obj_in)


@program_requirement_router.delete("/{program_id}/{catalog_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_program_requirement(program_id: int, catalog_id: int, session: SessionDep):
    return program_requirement_service.delete(session=session, program_id=program_id, catalog_id=catalog_id)

from typing import List, Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.api.deps import get_session, RequireRole
# Добавлен RoleUpdate
from src.models.employee import RoleCreate, RoleRead, RoleUpdate
from src.services.roles import role_service

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/", response_model=List[RoleRead])
def get_roles(session: SessionDep):
    return role_service.get_all(session=session)

@router.get("/{role_id}", response_model=RoleRead)
def get_role(role_id: int, session: SessionDep):
    return role_service.get_by_id(session=session, role_id=role_id)

@router.post("/", response_model=RoleRead, dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def create_role(role_in: RoleCreate, session: SessionDep):
    return role_service.create(session=session, role_in=role_in)

# Исправлено: role_in теперь RoleUpdate
@router.put("/{role_id}", response_model=RoleRead, dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def update_role(role_id: int, role_in: RoleUpdate, session: SessionDep):
    return role_service.update(session=session, role_id=role_id, role_in=role_in)

@router.delete("/{role_id}", dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def delete_role(role_id: int, session: SessionDep):
    return role_service.delete(session=session, role_id=role_id)
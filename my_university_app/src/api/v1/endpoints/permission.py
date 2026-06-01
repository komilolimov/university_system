from typing import List, Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.api.deps import get_session, RequireRole
from src.models.employee import (
    PermissionCreate, 
    PermissionRead, 
    PermissionUpdate, # <-- Добавлено сюда
    AssignPermissionRequest
)
from src.services.permission import permission_service

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/", response_model=List[PermissionRead])
def get_permissions(session: SessionDep):
    return permission_service.get_all(session=session)

@router.get("/{permission_id}", response_model=PermissionRead)
def get_permission(permission_id: int, session: SessionDep):
    return permission_service.get_by_id(session=session, permission_id=permission_id)

@router.post("/", response_model=PermissionRead, dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def create_permission(permission_in: PermissionCreate, session: SessionDep):
    return permission_service.create(session=session, permission_in=permission_in)

# <-- Исправлено: permission_in теперь принимает PermissionUpdate
@router.put("/{permission_id}", response_model=PermissionRead, dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def update_permission(permission_id: int, permission_in: PermissionUpdate, session: SessionDep): 
    return permission_service.update(session=session, permission_id=permission_id, permission_in=permission_in)

@router.delete("/{permission_id}", dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def delete_permission(permission_id: int, session: SessionDep):
    return permission_service.delete(session=session, permission_id=permission_id)

@router.post("/assign", dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def assign_permission(request: AssignPermissionRequest, session: SessionDep):
    return permission_service.assign_to_role(session=session, role_id=request.role_id, permission_id=request.permission_id)

@router.post("/revoke", dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def revoke_permission(request: AssignPermissionRequest, session: SessionDep):
    return permission_service.revoke_from_role(session=session, role_id=request.role_id, permission_id=request.permission_id)
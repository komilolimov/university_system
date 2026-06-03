from typing import List, Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

# ИСПРАВЛЕНО: Заменили RequireRole на RequirePermission
from src.api.deps import get_session, RequirePermission
from src.models.employee import (
    PermissionCreate, 
    PermissionRead, 
    PermissionUpdate, 
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

# ИСПРАВЛЕНО: Добавлено право permissions:write
@router.post("/", response_model=PermissionRead, dependencies=[Depends(RequirePermission(["permissions:write"]))])
def create_permission(permission_in: PermissionCreate, session: SessionDep):
    return permission_service.create(session=session, permission_in=permission_in)

# ИСПРАВЛЕНО: Добавлено право permissions:write
@router.put("/{permission_id}", response_model=PermissionRead, dependencies=[Depends(RequirePermission(["permissions:write"]))])
def update_permission(permission_id: int, permission_in: PermissionUpdate, session: SessionDep): 
    return permission_service.update(session=session, permission_id=permission_id, permission_in=permission_in)

# ИСПРАВЛЕНО: Добавлено право permissions:delete
@router.delete("/{permission_id}", dependencies=[Depends(RequirePermission(["permissions:delete"]))])
def delete_permission(permission_id: int, session: SessionDep):
    return permission_service.delete(session=session, permission_id=permission_id)

# ИСПРАВЛЕНО: Добавлено право roles:write (так как мы модифицируем роль)
@router.post("/assign", dependencies=[Depends(RequirePermission(["roles:write"]))])
def assign_permission(request: AssignPermissionRequest, session: SessionDep):
    return permission_service.assign_to_role(session=session, role_id=request.role_id, permission_id=request.permission_id)

# ИСПРАВЛЕНО: Добавлено право roles:write (так как мы модифицируем роль)
@router.post("/revoke", dependencies=[Depends(RequirePermission(["roles:write"]))])
def revoke_permission(request: AssignPermissionRequest, session: SessionDep):
    return permission_service.revoke_from_role(session=session, role_id=request.role_id, permission_id=request.permission_id)
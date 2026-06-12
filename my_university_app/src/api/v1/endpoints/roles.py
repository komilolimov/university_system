from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from src.api.deps import get_session, RequirePermission
from src.models.roles import RoleCreate, RoleRead, RoleUpdate, Role, RoleReadWithPermissions
from src.services.roles import role_service, RoleAssignPermissions

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/", response_model=List[RoleRead])
def get_roles(
    session: SessionDep,
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = 0,
    limit: int = 100,
):
    return role_service.get_all(session=session, is_active=is_active, skip=skip, limit=limit)

@router.get("/{role_id}", response_model=RoleReadWithPermissions)
def get_role(role_id: int, session: SessionDep):
    return role_service.get(session=session, id=role_id)

@router.post("/", response_model=RoleRead, dependencies=[Depends(RequirePermission(["roles:write"]))])
def create_role(role_in: RoleCreate, session: SessionDep):
    return role_service.create(session=session, obj_in=role_in)

@router.post("/{role_id}/permissions", dependencies=[Depends(RequirePermission(["roles:write"]))])
def assign_permissions_to_role(
    role_id: int,
    payload: RoleAssignPermissions,
    session: SessionDep 
):
    role = role_service.assign_permissions(
        session=session, 
        id=role_id, 
        payload=payload 
    )
    
    permission_names = [p.name for p in role.permissions]
    
    return {
        "detail": f"Permissions successfully assigned to role '{role.title}'",
        "assigned_permissions": permission_names
    }

@router.put("/{role_id}", response_model=RoleRead, dependencies=[Depends(RequirePermission(["roles:write"]))])
def update_role(role_id: int, role_in: RoleUpdate, session: SessionDep):
    return role_service.update(session=session, id=role_id, obj_in=role_in)

@router.delete("/{role_id}", dependencies=[Depends(RequirePermission(["roles:delete"]))])
def delete_role(role_id: int, session: SessionDep):
    return role_service.delete(session=session, id=role_id)

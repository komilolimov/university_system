from typing import List, Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

# ИСПРАВЛЕНО: Заменили RequireRole на RequirePermission
from src.api.deps import get_session, RequirePermission

from src.models.employee import RoleCreate, RoleRead, RoleUpdate, Role, RoleReadWithPermissions
from src.services.roles import role_service, RoleAssignPermissions

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/", response_model=List[RoleRead])
def get_roles(session: SessionDep):
    return role_service.get_all(session=session)

@router.get("/{role_id}", response_model=RoleReadWithPermissions)
def get_role(role_id: int, session: SessionDep):
    return role_service.get_by_id(session=session, role_id=role_id)

# ИСПРАВЛЕНО: Добавлено право roles:write
@router.post("/", response_model=RoleRead, dependencies=[Depends(RequirePermission(["roles:write"]))])
def create_role(role_in: RoleCreate, session: SessionDep):
    return role_service.create(session=session, role_in=role_in)

# ИСПРАВЛЕНО: Закрыли этот роут правом roles:write
@router.post("/{role_id}/permissions", dependencies=[Depends(RequirePermission(["roles:write"]))])
def assign_permissions_to_role(
    role_id: int,
    payload: RoleAssignPermissions,
    session: Session = Depends(get_session)
):
  
    role = role_service.assign_permissions(
        session=session, 
        role_id=role_id, 
        payload=payload 
    )
    
    permission_names = [p.name for p in role.permissions]
    
    return {
        "detail": f"Permissions successfully assigned to role '{role.title}'",
        "assigned_permissions": permission_names
    }

# ИСПРАВЛЕНО: Добавлено право roles:write
@router.put("/{role_id}", response_model=RoleRead, dependencies=[Depends(RequirePermission(["roles:write"]))])
def update_role(role_id: int, role_in: RoleUpdate, session: SessionDep):
    return role_service.update(session=session, role_id=role_id, role_in=role_in)

# ИСПРАВЛЕНО: Добавлено право roles:delete
@router.delete("/{role_id}", dependencies=[Depends(RequirePermission(["roles:delete"]))])
def delete_role(role_id: int, session: SessionDep):
    return role_service.delete(session=session, role_id=role_id)
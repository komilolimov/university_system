from typing import List, Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session
from src.api.deps import get_session, RequireRole


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

@router.post("/", response_model=RoleRead, dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def create_role(role_in: RoleCreate, session: SessionDep):
    return role_service.create(session=session, role_in=role_in)


@router.post("/{role_id}/permissions")
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

@router.put("/{role_id}", response_model=RoleRead, dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def update_role(role_id: int, role_in: RoleUpdate, session: SessionDep):
    return role_service.update(session=session, role_id=role_id, role_in=role_in)

@router.delete("/{role_id}", dependencies=[Depends(RequireRole(["Admin", "Administrator"]))])
def delete_role(role_id: int, session: SessionDep):
    return role_service.delete(session=session, role_id=role_id)
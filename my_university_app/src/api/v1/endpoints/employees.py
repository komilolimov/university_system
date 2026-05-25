from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from src.api.deps import get_session, get_current_user, RequireRole
from src.services.employees import employee_service, role_service, employee_experience_service
from src.models.employee import (
    EmployeeRead, EmployeeCreate, EmployeeUpdate,
    RoleRead, RoleCreate, RoleUpdate,
    EmployeeExperienceRead, EmployeeExperienceCreate, EmployeeExperienceUpdate,
)
from src.models.auth import ChangePasswordRequest

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

employee_router = APIRouter(prefix="/employees", tags=["Employees"])


@employee_router.get("/", response_model=List[EmployeeRead])
def get_employees(
    session: SessionDep, 
    current_user: CurrentUserDep,
    q: Optional[str] = Query(None, description="Search by first_name, last_name, email"),
    department_id: Optional[int] = Query(None),
    role_id: Optional[int] = Query(None),
    region: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return employee_service.get_all(
        session=session, q=q, department_id=department_id, role_id=role_id, region=region, is_active=is_active, skip=skip, limit=limit
    )


@employee_router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(employee_id: int, session: SessionDep, current_user: CurrentUserDep):
    return employee_service.get(session=session, id=employee_id)


@employee_router.post("/", response_model=EmployeeRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_employee(obj_in: EmployeeCreate, session: SessionDep):
    return employee_service.create(session=session, obj_in=obj_in)


@employee_router.put("/{employee_id}", response_model=EmployeeRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_employee(employee_id: int, obj_in: EmployeeUpdate, session: SessionDep):
    return employee_service.update(session=session, id=employee_id, obj_in=obj_in)


@employee_router.delete("/{employee_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_employee(employee_id: int, session: SessionDep):
    return employee_service.delete(session=session, id=employee_id)


@employee_router.post("/change-password")
def change_employee_password(
    session: SessionDep,
    current_user: CurrentUserDep,
    obj_in: ChangePasswordRequest
):
    if current_user.get("user_type") != "employee":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only employees can change their employee password")
    
    employee_id = int(current_user["user_id"])
    employee_service.change_password(session=session, id=employee_id, obj_in=obj_in)
    return {"Success": "Password changed successfully"}


role_router = APIRouter(prefix="/roles", tags=["Roles"])


@role_router.get("/", response_model=List[RoleRead])
def get_roles(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return role_service.get_all(session=session, skip=skip, limit=limit)


@role_router.get("/{role_id}", response_model=RoleRead)
def get_role(role_id: int, session: SessionDep, current_user: CurrentUserDep):
    return role_service.get(session=session, id=role_id)


@role_router.post("/", response_model=RoleRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_role(obj_in: RoleCreate, session: SessionDep):
    return role_service.create(session=session, obj_in=obj_in)


@role_router.put("/{role_id}", response_model=RoleRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_role(role_id: int, obj_in: RoleUpdate, session: SessionDep):
    return role_service.update(session=session, id=role_id, obj_in=obj_in)


@role_router.delete("/{role_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_role(role_id: int, session: SessionDep):
    return role_service.delete(session=session, id=role_id)


experience_router = APIRouter(prefix="/employee-experiences", tags=["Employee Experiences"])


@experience_router.get("/", response_model=List[EmployeeExperienceRead])
def get_experiences(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return employee_experience_service.get_all(session=session, skip=skip, limit=limit)


@experience_router.get("/{experience_id}", response_model=EmployeeExperienceRead)
def get_experience(experience_id: int, session: SessionDep, current_user: CurrentUserDep):
    return employee_experience_service.get(session=session, id=experience_id)


@experience_router.post("/", response_model=EmployeeExperienceRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_experience(obj_in: EmployeeExperienceCreate, session: SessionDep):
    return employee_experience_service.create(session=session, obj_in=obj_in)


@experience_router.put("/{experience_id}", response_model=EmployeeExperienceRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_experience(experience_id: int, obj_in: EmployeeExperienceUpdate, session: SessionDep):
    return employee_experience_service.update(session=session, id=experience_id, obj_in=obj_in)


@experience_router.delete("/{experience_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_experience(experience_id: int, session: SessionDep):
    return employee_experience_service.delete(session=session, id=experience_id)

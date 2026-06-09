from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session

# ИСПРАВЛЕНО: Заменили RequireRole на RequirePermission
from src.api.deps import get_session, get_current_user, RequirePermission

# ИСПРАВЛЕНО: Оставили только сервисы, относящиеся к сотрудникам
from src.services.employees import employee_service, employee_experience_service
from src.models.employee import (
    EmployeeRead, EmployeeCreate, EmployeeUpdate,
    Employee,
    EmployeeExperienceRead, EmployeeExperienceCreate, EmployeeExperienceUpdate,
)
from src.models.auth import ChangePasswordRequest

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

# Функция для распаковки прав роли в массив строк для EmployeeRead
def format_employee_read(employee: Employee) -> dict:
    emp_dict = employee.model_dump()
    if employee.role and employee.role.permissions:
        emp_dict["permissions"] = [p.name for p in employee.role.permissions]
    else:
        emp_dict["permissions"] = []
    return emp_dict

# ==========================================
# EMPLOYEES ROUTER
# ==========================================
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
    employees = employee_service.get_all(
        session=session, q=q, department_id=department_id, role_id=role_id, region=region, is_active=is_active, skip=skip, limit=limit
    )
    return [format_employee_read(emp) for emp in employees]

@employee_router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(employee_id: int, session: SessionDep, current_user: CurrentUserDep):
    employee = employee_service.get(session=session, id=employee_id)
    return format_employee_read(employee)

# ИСПРАВЛЕНО: Добавлено право employees:write
@employee_router.post("/", response_model=EmployeeRead, dependencies=[Depends(RequirePermission(["employees:write"]))])
def create_employee(obj_in: EmployeeCreate, session: SessionDep):
    employee = employee_service.create(session=session, obj_in=obj_in)
    return format_employee_read(employee)

# ИСПРАВЛЕНО: Добавлено право employees:write
@employee_router.put("/{employee_id}", response_model=EmployeeRead, dependencies=[Depends(RequirePermission(["employees:write"]))])
def update_employee(employee_id: int, obj_in: EmployeeUpdate, session: SessionDep):
    employee = employee_service.update(session=session, id=employee_id, obj_in=obj_in)
    return format_employee_read(employee)

# --- ДОБАВЛЕНО: Метод DELETE для удаления сотрудника ---
@employee_router.delete("/{employee_id}", dependencies=[Depends(RequirePermission(["employees:delete"]))])
def delete_employee(employee_id: int, session: SessionDep):
    return employee_service.delete(session=session, id=employee_id)

# --- ДОБАВЛЕНО: Метод для смены пароля сотрудника ---
@employee_router.post("/change-password")
def change_employee_password(
    session: SessionDep,
    current_user: CurrentUserDep,
    obj_in: ChangePasswordRequest
):
    # Проверяем, что запрос делает именно сотрудник
    if current_user.get("user_type") != "employee":
        raise HTTPException(status_code=403, detail="Only employees can change their employee password")
    
    employee_id = int(current_user["user_id"])
    employee_service.change_password(session=session, id=employee_id, obj_in=obj_in)
    return {"Success": "Password changed successfully"}


# ==========================================
# EMPLOYEE EXPERIENCE ROUTER
# ==========================================
experience_router = APIRouter(prefix="/employee-experiences", tags=["Employee Experiences"])

@experience_router.get("/", response_model=List[EmployeeExperienceRead])
def get_experiences(
    session: SessionDep, 
    current_user: CurrentUserDep,
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return employee_experience_service.get_all(session=session, skip=skip, limit=limit)

@experience_router.post("/{employee_id}", response_model=EmployeeExperienceRead, dependencies=[Depends(RequirePermission(["employees:write"]))])
def create_experience(employee_id: int, obj_in: EmployeeExperienceCreate, session: SessionDep):
    return employee_experience_service.create(session=session, employee_id=employee_id, obj_in=obj_in)

@experience_router.put("/{experience_id}", response_model=EmployeeExperienceRead, dependencies=[Depends(RequirePermission(["employees:write"]))])
def update_experience(experience_id: int, obj_in: EmployeeExperienceUpdate, session: SessionDep):
    return employee_experience_service.update(session=session, id=experience_id, obj_in=obj_in)

@experience_router.delete("/{experience_id}", dependencies=[Depends(RequirePermission(["employees:write"]))])
def delete_experience(experience_id: int, session: SessionDep):
    return employee_experience_service.delete(session=session, id=experience_id)
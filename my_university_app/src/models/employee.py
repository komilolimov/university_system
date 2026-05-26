from typing import Optional, TYPE_CHECKING
from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from src.models.base import TimestampMixin
from src.models.enums import RegionType

if TYPE_CHECKING:
    from src.models.student import Student

class RoleBase(SQLModel):
    title: str = Field(unique=True)
    is_faculty: bool = Field(default=False)

class Role(RoleBase, TimestampMixin, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)

class RoleCreate(RoleBase):
    pass

class RoleRead(RoleBase):
    id: int

class RoleUpdate(SQLModel):
    title: Optional[str] = None
    is_faculty: Optional[bool] = None

class EmployeeBase(SQLModel):
    first_name: str
    last_name: str
    email: str = Field(unique=True)
    role_id: int = Field(foreign_key="roles.id")
    department_id: Optional[int] = Field(default=None, foreign_key="departments.id")
    office_room_id: Optional[int] = Field(default=None, foreign_key="rooms.id")
    region: RegionType = Field(default=RegionType.Domestic)
    hire_date: date
    is_active: bool = Field(default=True)

class Employee(EmployeeBase, TimestampMixin, table=True):
    __tablename__ = "employees"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- ДОБАВЛЕНО: Хэш пароля для сохранения в базе данных ---
    hashed_password: str 
    
    advisees: list["Student"] = Relationship(back_populates="advisor")

class EmployeeCreate(EmployeeBase):
    # --- ДОБАВЛЕНО: Открытый пароль, который мы получаем при создании сотрудника ---
    password: str 

class EmployeeRead(EmployeeBase):
    id: int
    permissions: list[str] = []

class EmployeeUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    role_id: Optional[int] = None
    department_id: Optional[int] = None
    office_room_id: Optional[int] = None
    region: Optional[RegionType] = None
    hire_date: Optional[date] = None
    is_active: Optional[bool] = None

class EmployeeExperienceBase(SQLModel):
    company_name: str
    job_title: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    employee_id: int = Field(foreign_key="employees.id")

class EmployeeExperience(EmployeeExperienceBase, TimestampMixin, table=True):
    __tablename__ = "employee_experience"
    id: Optional[int] = Field(default=None, primary_key=True)

class EmployeeExperienceCreate(EmployeeExperienceBase):
    pass

class EmployeeExperienceRead(EmployeeExperienceBase):
    id: int

class EmployeeExperienceUpdate(SQLModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    employee_id: Optional[int] = None
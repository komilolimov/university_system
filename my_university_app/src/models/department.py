from typing import Optional
from sqlmodel import SQLModel, Field
from src.models.base import TimestampMixin

class DepartmentBase(SQLModel):
    name: str
    school_id: int = Field(foreign_key="schools.id")

class Department(DepartmentBase, TimestampMixin, table=True):
    __tablename__ = "departments"
    id: Optional[int] = Field(default=None, primary_key=True)

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentRead(DepartmentBase):
    id: int

class DepartmentUpdate(SQLModel):
    name: Optional[str] = None
    school_id: Optional[int] = None

class ResearchLabBase(SQLModel):
    name: str
    department_id: int = Field(foreign_key="departments.id")

class ResearchLab(ResearchLabBase, TimestampMixin, table=True):
    __tablename__ = "research_labs"
    id: Optional[int] = Field(default=None, primary_key=True)

class ResearchLabCreate(ResearchLabBase):
    pass

class ResearchLabRead(ResearchLabBase):
    id: int

class ResearchLabUpdate(SQLModel):
    name: Optional[str] = None
    department_id: Optional[int] = None

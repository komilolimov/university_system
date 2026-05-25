from typing import Optional
from sqlmodel import SQLModel, Field
from src.models.base import TimestampMixin

class DegreeProgramBase(SQLModel):
    title: str
    degree_level: str
    total_credits_required: int
    department_id: int = Field(foreign_key="departments.id")

class DegreeProgram(DegreeProgramBase, TimestampMixin, table=True):
    __tablename__ = "degree_programs"
    id: Optional[int] = Field(default=None, primary_key=True)

class DegreeProgramCreate(DegreeProgramBase):
    pass

class DegreeProgramRead(DegreeProgramBase):
    id: int

class DegreeProgramUpdate(SQLModel):
    title: Optional[str] = None
    degree_level: Optional[str] = None
    total_credits_required: Optional[int] = None
    department_id: Optional[int] = None

class ProgramRequirementBase(SQLModel):
    is_core: bool = Field(default=True)
    semester_recommended: Optional[int] = None
    program_id: int = Field(foreign_key="degree_programs.id", primary_key=True)
    catalog_id: int = Field(foreign_key="course_catalog.id", primary_key=True)

class ProgramRequirement(ProgramRequirementBase, TimestampMixin, table=True):
    __tablename__ = "program_requirements"

class ProgramRequirementCreate(ProgramRequirementBase):
    pass

class ProgramRequirementRead(ProgramRequirementBase):
    pass

class ProgramRequirementUpdate(SQLModel):
    is_core: Optional[bool] = None
    semester_recommended: Optional[int] = None

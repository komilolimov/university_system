from typing import Optional, TYPE_CHECKING
from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from src.models.base import TimestampMixin
from src.models.enums import RegionType, ProgramType

if TYPE_CHECKING:
    from src.models.employee import Employee

class StudentBase(SQLModel):
    first_name: str
    last_name: str
    email: str = Field(unique=True)
    region: RegionType = Field(default=RegionType.Domestic)
    enrollment_date: date
    advisor_id: Optional[int] = Field(default=None, foreign_key="employees.id")
    graduation_date: Optional[date] = None
    is_active: bool = Field(default=True)

class Student(StudentBase, TimestampMixin, table=True):
    __tablename__ = "students"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- ДОБАВЛЕНО: Хэш пароля для сохранения в базе данных ---
    hashed_password: str 
    
    advisor: Optional["Employee"] = Relationship(back_populates="advisees")

class StudentCreate(StudentBase):
    # --- ДОБАВЛЕНО: Открытый пароль, который мы получаем при создании студента ---
    password: str 

class StudentRead(StudentBase):
    id: int

class StudentUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    region: Optional[RegionType] = None
    enrollment_date: Optional[date] = None
    advisor_id: Optional[int] = None
    graduation_date: Optional[date] = None
    is_active: Optional[bool] = None

class StudentProgramBase(SQLModel):
    type: ProgramType
    declared_date: date
    student_id: int = Field(foreign_key="students.id", primary_key=True)
    program_id: int = Field(foreign_key="degree_programs.id", primary_key=True)

class StudentProgram(StudentProgramBase, TimestampMixin, table=True):
    __tablename__ = "student_programs"

class StudentProgramCreate(StudentProgramBase):
    pass

class StudentProgramRead(StudentProgramBase):
    pass

class StudentProgramUpdate(SQLModel):
    type: Optional[ProgramType] = None
    declared_date: Optional[date] = None
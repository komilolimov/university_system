# cspell:ignore ondelete
from typing import Optional
from datetime import date
from decimal import Decimal
from sqlmodel import SQLModel, Field
from src.models.base import TimestampMixin
from src.models.enums import EnrollmentStatus

class AcademicTermBase(SQLModel):
    name: str = Field(unique=True)
    start_date: date
    end_date: date

class AcademicTerm(AcademicTermBase, TimestampMixin, table=True):
    __tablename__ = "academic_terms"
    id: Optional[int] = Field(default=None, primary_key=True)

class AcademicTermCreate(AcademicTermBase):
    pass

class AcademicTermRead(AcademicTermBase):
    id: int

class AcademicTermUpdate(SQLModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class CourseCatalogBase(SQLModel):
    code: str = Field(unique=True)
    title: str
    credits: int
    description: Optional[str] = None
    is_active: bool = Field(default=True)
    department_id: int = Field(foreign_key="departments.id")

class CourseCatalog(CourseCatalogBase, TimestampMixin, table=True):
    __tablename__ = "course_catalog"
    id: Optional[int] = Field(default=None, primary_key=True)

class CourseCatalogCreate(CourseCatalogBase):
    pass

class CourseCatalogRead(CourseCatalogBase):
    id: int

class CourseCatalogUpdate(SQLModel):
    code: Optional[str] = None
    title: Optional[str] = None
    credits: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    department_id: Optional[int] = None

class CourseOfferingBase(SQLModel):
    schedule_blocks: Optional[str] = None
    max_capacity: int
    catalog_id: int = Field(foreign_key="course_catalog.id")
    term_id: int = Field(foreign_key="academic_terms.id")
    primary_instructor_id: int = Field(foreign_key="employees.id")
    room_id: Optional[int] = Field(default=None, foreign_key="rooms.id")

class CourseOffering(CourseOfferingBase, TimestampMixin, table=True):
    __tablename__ = "course_offerings"
    id: Optional[int] = Field(default=None, primary_key=True)

class CourseOfferingCreate(CourseOfferingBase):
    pass

class CourseOfferingRead(CourseOfferingBase):
    id: int

class CourseOfferingUpdate(SQLModel):
    schedule_blocks: Optional[str] = None
    max_capacity: Optional[int] = None
    catalog_id: Optional[int] = None
    term_id: Optional[int] = None
    primary_instructor_id: Optional[int] = None
    room_id: Optional[int] = None

class EnrollmentBase(SQLModel):
    status: EnrollmentStatus
    grade: Optional[Decimal] = Field(
        default=None,
        ge=0.0, 
        le=4.0,  
        max_digits=3, 
        decimal_places=2
    )
    credits_earned: Optional[int] = None
    student_id: int = Field(foreign_key="students.id",ondelete="CASCADE", primary_key=True)
    offering_id: int = Field(foreign_key="course_offerings.id", ondelete="CASCADE", primary_key=True)

class Enrollment(EnrollmentBase, TimestampMixin, table=True):
    __tablename__ = "enrollments"

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentRead(EnrollmentBase):
    pass

class EnrollmentUpdate(SQLModel):
    status: Optional[EnrollmentStatus] = None
    grade: Optional[Decimal] = None
    credits_earned: Optional[int] = None

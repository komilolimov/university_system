from typing import Optional
from datetime import date
from sqlmodel import SQLModel, Field
from src.models.base import TimestampMixin

class AcademicTermBase(SQLModel):
    name: str = Field(unique=True) # Например: "Fall 2026"
    start_date: date
    end_date: date
    # ДОБАВЛЕНО: Флаг активности с дефолтным значением для существующих строк
    is_active: bool = Field(default=True, sa_column_kwargs={"server_default": "true"})

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
    is_active: Optional[bool] = None
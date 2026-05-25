from typing import Optional
from sqlmodel import SQLModel, Field
from src.models.base import TimestampMixin

class SchoolBase(SQLModel):
    name: str = Field(unique=True)

class School(SchoolBase, TimestampMixin, table=True):
    __tablename__ = "schools"
    id: Optional[int] = Field(default=None, primary_key=True)

class SchoolCreate(SchoolBase):
    pass

class SchoolRead(SchoolBase):
    id: int

class SchoolUpdate(SQLModel):
    name: Optional[str] = None

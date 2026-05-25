from typing import Optional
from sqlmodel import SQLModel, Field
from src.models.base import TimestampMixin
from src.models.enums import RoomType

class BuildingBase(SQLModel):
    code: str = Field(unique=True)
    name: Optional[str] = None

class Building(BuildingBase, TimestampMixin, table=True):
    __tablename__ = "buildings"
    id: Optional[int] = Field(default=None, primary_key=True)

class BuildingCreate(BuildingBase):
    pass

class BuildingRead(BuildingBase):
    id: int

class BuildingUpdate(SQLModel):
    code: Optional[str] = None
    name: Optional[str] = None

class RoomBase(SQLModel):
    room_number: str
    capacity: int
    type: RoomType
    building_id: int = Field(foreign_key="buildings.id")

class Room(RoomBase, TimestampMixin, table=True):
    __tablename__ = "rooms"
    id: Optional[int] = Field(default=None, primary_key=True)

class RoomCreate(RoomBase):
    pass

class RoomRead(RoomBase):
    id: int

class RoomUpdate(SQLModel):
    room_number: Optional[str] = None
    capacity: Optional[int] = None
    type: Optional[RoomType] = None
    building_id: Optional[int] = None

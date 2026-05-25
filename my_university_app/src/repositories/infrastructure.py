from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models import Building, Room

class BuildingRepository(BaseRepository[Building]):
    def __init__(self):
        super().__init__(Building)

class RoomRepository(BaseRepository[Room]):
    def __init__(self):
        super().__init__(Room)

building_repository = BuildingRepository()
room_repository = RoomRepository()

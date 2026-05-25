from src.core.exceptions import EntityNotFoundError
from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.infrastructure import building_repository, room_repository
from src.models.room import (
    Building, BuildingCreate, BuildingUpdate,
    Room, RoomCreate, RoomUpdate,
)
from src.core.uow import UnitOfWork


class BuildingService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[Building]:
        return building_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> Building:
        obj = building_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("Building", id)
        return obj

    def create(self, session: Session, obj_in: BuildingCreate) -> Building:
        with UnitOfWork(session):
            return building_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: BuildingUpdate) -> Building:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return building_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            building_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Building deleted"}


class RoomService:
    def get_all(
        self, 
        session: Session, 
        q: Optional[str] = None,
        building_id: Optional[int] = None,
        type: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Room]:
        statement = select(Room)
        if q:
            statement = statement.where(Room.room_number.ilike(f"%{q}%"))
        if building_id is not None:
            statement = statement.where(Room.building_id == building_id)
        if type:
            statement = statement.where(Room.type == type)
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get(self, session: Session, id: int) -> Room:
        obj = room_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("Room", id)
        return obj

    def create(self, session: Session, obj_in: RoomCreate) -> Room:
        with UnitOfWork(session):
            building = building_repository.get(session=session, id=obj_in.building_id)
            if not building:
                raise EntityNotFoundError("Building", obj_in.building_id)
            return room_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: RoomUpdate) -> Room:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return room_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            room_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Room deleted"}


building_service = BuildingService()
room_service = RoomService()

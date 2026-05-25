from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from src.api.deps import get_session, get_current_user, RequireRole
from src.services.infrastructure import building_service, room_service
from src.models.room import (
    BuildingRead, BuildingCreate, BuildingUpdate,
    RoomRead, RoomCreate, RoomUpdate,
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

building_router = APIRouter(prefix="/buildings", tags=["Buildings"])


@building_router.get("/", response_model=List[BuildingRead])
def get_buildings(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return building_service.get_all(session=session, skip=skip, limit=limit)


@building_router.get("/{building_id}", response_model=BuildingRead)
def get_building(building_id: int, session: SessionDep, current_user: CurrentUserDep):
    return building_service.get(session=session, id=building_id)


@building_router.post("/", response_model=BuildingRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_building(obj_in: BuildingCreate, session: SessionDep):
    return building_service.create(session=session, obj_in=obj_in)


@building_router.put("/{building_id}", response_model=BuildingRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_building(building_id: int, obj_in: BuildingUpdate, session: SessionDep):
    return building_service.update(session=session, id=building_id, obj_in=obj_in)


@building_router.delete("/{building_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_building(building_id: int, session: SessionDep):
    return building_service.delete(session=session, id=building_id)


room_router = APIRouter(prefix="/rooms", tags=["Rooms"])


@room_router.get("/", response_model=List[RoomRead])
def get_rooms(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    q: Optional[str] = Query(None, description="Search by room_number"),
    building_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100)
):
    return room_service.get_all(session=session, q=q, building_id=building_id, type=type, skip=skip, limit=limit)


@room_router.get("/{room_id}", response_model=RoomRead)
def get_room(room_id: int, session: SessionDep, current_user: CurrentUserDep):
    return room_service.get(session=session, id=room_id)


@room_router.post("/", response_model=RoomRead, dependencies=[Depends(RequireRole(["Admin"]))])
def create_room(obj_in: RoomCreate, session: SessionDep):
    return room_service.create(session=session, obj_in=obj_in)


@room_router.put("/{room_id}", response_model=RoomRead, dependencies=[Depends(RequireRole(["Admin"]))])
def update_room(room_id: int, obj_in: RoomUpdate, session: SessionDep):
    return room_service.update(session=session, id=room_id, obj_in=obj_in)


@room_router.delete("/{room_id}", dependencies=[Depends(RequireRole(["Admin"]))])
def delete_room(room_id: int, session: SessionDep):
    return room_service.delete(session=session, id=room_id)

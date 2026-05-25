import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from src.models.room import Building, Room
from src.models.enums import RoomType

def setup_infrastructure(session: Session):
    b1 = Building(code="ENG", name="Engineering Building")
    b2 = Building(code="ART", name="Arts Center")
    session.add_all([b1, b2])
    session.commit()
    session.refresh(b1)
    session.refresh(b2)
    
    r1 = Room(room_number="101A", capacity=50, type=RoomType.Lecture_Hall, building_id=b1.id)
    r2 = Room(room_number="202B", capacity=20, type=RoomType.Wet_Lab, building_id=b1.id)
    session.add_all([r1, r2])
    session.commit()

@pytest.mark.parametrize("query_params, expected_count", [
    ("?q=101", 1),
    ("?q=A", 1),
    ("?type=Lecture Hall", 1),
    ("?skip=0&limit=1", 1),
    ("", 2),
])
def test_get_rooms_filters(client: TestClient, session: Session, admin_token: str, query_params, expected_count):
    # Arrange
    setup_infrastructure(session)
    b1 = session.exec(select(Building).where(Building.code == "ENG")).first()
    if not query_params:
        query_params = f"?building_id={b1.id}"
    elif "?q" not in query_params and "?skip" not in query_params:
        query_params += f"&building_id={b1.id}"
        
    # Act
    response = client.get(f"/api/v1/rooms/{query_params}", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    assert len(response.json()) == expected_count

def test_create_room(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_infrastructure(session)
    b2 = session.exec(select(Building).where(Building.code == "ART")).first()
    payload = {
        "room_number": "303C",
        "capacity": 100,
        "type": "Lecture Hall",
        "building_id": b2.id
    }
    
    # Act
    response = client.post("/api/v1/rooms/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    
    db_room = session.exec(select(Room).where(Room.room_number == "303C")).first()
    assert db_room is not None

def test_create_room_invalid_building(client: TestClient, admin_token: str):
    # Arrange
    payload = {
        "room_number": "999Z",
        "capacity": 100,
        "type": "Lecture Hall",
        "building_id": 9999
    }
    
    # Act
    response = client.post("/api/v1/rooms/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code in [400, 404, 422]

def test_delete_room(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_infrastructure(session)
    room = session.exec(select(Room).where(Room.room_number == "101A")).first()
    
    # Act
    response = client.delete(f"/api/v1/rooms/{room.id}", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    db_room = session.exec(select(Room).where(Room.id == room.id)).first()
    assert db_room is None

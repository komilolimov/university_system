import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import date
from src.models.student import Student, RegionType
from src.core.security import get_password_hash

def setup_students(session: Session):
    students = [
        Student(
            first_name="Alice",
            last_name="Smith",
            email="alice@test.com",
            region=RegionType.Domestic,
            enrollment_date=date.today(),
            is_active=True,
            hashed_password=get_password_hash("pass")
        ),
        Student(
            first_name="Bob",
            last_name="Johnson",
            email="bob@test.com",
            region=RegionType.Non_EU,
            enrollment_date=date.today(),
            is_active=False,
            hashed_password=get_password_hash("pass")
        )
    ]
    session.add_all(students)
    session.commit()

@pytest.mark.parametrize("query_params, expected_count", [
    ("?q=Alice", 1),
    ("?q=ob", 1),
    ("?region=Domestic", 1),
    ("?is_active=false", 1),
    ("?skip=1&limit=1", 1),
    ("", 2),
])
def test_get_students_filters(client: TestClient, session: Session, admin_token: str, query_params, expected_count):
    # Arrange
    setup_students(session)
    # Act
    response = client.get(f"/api/v1/students/{query_params}", headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == expected_count

def test_create_student_as_admin(client: TestClient, session: Session, admin_token: str):
    # Arrange
    payload = {
        "first_name": "Charlie",
        "last_name": "Brown",
        "email": "charlie@test.com",
        "region": "Domestic",
        "enrollment_date": str(date.today()),
        "password": "secure"
    }
    # Act
    response = client.post("/api/v1/students/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 200
    
    # DB State Check
    db_student = session.exec(select(Student).where(Student.email == "charlie@test.com")).first()
    assert db_student is not None
    assert db_student.first_name == "Charlie"

def test_create_student_as_student_forbidden(client: TestClient, student_token: str):
    # Arrange
    payload = {
        "first_name": "Hacker",
        "last_name": "Man",
        "email": "hacker@test.com",
        "region": "Domestic",
        "enrollment_date": str(date.today()),
        "password": "secure"
    }
    # Act
    response = client.post("/api/v1/students/", json=payload, headers={"Authorization": f"Bearer {student_token}"})
    # Assert
    assert response.status_code == 403

def test_update_student(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_students(session)
    student_id = session.exec(select(Student).where(Student.email == "alice@test.com")).first().id
    payload = {"first_name": "Alicia"}
    # Act
    response = client.put(f"/api/v1/students/{student_id}", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 200
    db_student = session.exec(select(Student).where(Student.id == student_id)).first()
    assert db_student.first_name == "Alicia"

def test_delete_student(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_students(session)
    student_id = session.exec(select(Student).where(Student.email == "alice@test.com")).first().id
    # Act
    response = client.delete(f"/api/v1/students/{student_id}", headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 200
    
    # DB State Check
    db_student = session.exec(select(Student).where(Student.id == student_id)).first()
    assert db_student is None

def test_get_non_existent_student(client: TestClient, admin_token: str):
    # Arrange
    # Act
    response = client.get("/api/v1/students/9999", headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 404

def test_invalid_payload_422(client: TestClient, admin_token: str):
    # Arrange
    payload = {"first_name": "OnlyName"} # Missing required fields
    # Act
    response = client.post("/api/v1/students/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 422

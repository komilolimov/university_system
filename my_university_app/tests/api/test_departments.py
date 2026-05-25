import pytest
from sqlmodel import Session

def test_read_departments_unauthenticated(client):
    response = client.get("/api/v1/departments/")
    assert response.status_code == 401

def test_read_departments_student(client, student_token):
    headers = {"Authorization": f"Bearer {student_token}"}
    response = client.get("/api/v1/departments/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_department_student_forbidden(client, student_token, session: Session):
    from src.models.school import School
    school = School(name="Test School for Student")
    session.add(school)
    session.commit()
    session.refresh(school)

    payload = {"name": "Test Dept", "school_id": school.id}
    response = client.post(
        "/api/v1/departments/",
        headers={"Authorization": f"Bearer {student_token}"},
        json=payload
    )
    assert response.status_code == 403

def test_create_department_admin(client, admin_token, session: Session):
    from src.models.school import School
    school = School(name="Admin School")
    session.add(school)
    session.commit()
    session.refresh(school)

    payload = {"name": "Admin Dept", "school_id": school.id}
    response = client.post(
        "/api/v1/departments/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Admin Dept"
    assert data["school_id"] == school.id
    assert "id" in data

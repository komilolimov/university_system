import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from src.models.student import Student, RegionType
from src.models.employee import Employee, Role
from src.core.security import get_password_hash, create_access_token
from datetime import date

def test_student_change_password_success(client: TestClient, session: Session):
    # Setup student
    student = Student(
        id=2, # matching subject=2 in student_token
        first_name="Alice",
        last_name="Smith",
        email="alice@test.com",
        region=RegionType.Domestic,
        enrollment_date=date.today(),
        is_active=True,
        hashed_password=get_password_hash("OldPassword123")
    )
    session.add(student)
    session.commit()

    token = create_access_token(subject=2, user_type="student", role="Student")
    headers = {"Authorization": f"Bearer {token}"}

    # Change password
    response = client.post(
        "/api/v1/students/change-password",
        headers=headers,
        json={"old_password": "OldPassword123", "new_password": "NewPassword456"}
    )
    assert response.status_code == 200
    assert response.json() == {"Success": "Password changed successfully"}

    # Verify we can login with new password
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@test.com", "password": "NewPassword456"}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_student_change_password_wrong_old(client: TestClient, session: Session):
    student = Student(
        id=2,
        first_name="Alice",
        last_name="Smith",
        email="alice@test.com",
        region=RegionType.Domestic,
        enrollment_date=date.today(),
        is_active=True,
        hashed_password=get_password_hash("OldPassword123")
    )
    session.add(student)
    session.commit()

    token = create_access_token(subject=2, user_type="student", role="Student")
    headers = {"Authorization": f"Bearer {token}"}

    # Wrong old password
    response = client.post(
        "/api/v1/students/change-password",
        headers=headers,
        json={"old_password": "WrongPassword", "new_password": "NewPassword456"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect old password"

def test_student_change_password_complexity_failures(client: TestClient):
    token = create_access_token(subject=2, user_type="student", role="Student")
    headers = {"Authorization": f"Bearer {token}"}

    # Too short
    response = client.post(
        "/api/v1/students/change-password",
        headers=headers,
        json={"old_password": "Old", "new_password": "Short1"}
    )
    assert response.status_code == 422

    # No uppercase
    response = client.post(
        "/api/v1/students/change-password",
        headers=headers,
        json={"old_password": "Old", "new_password": "nouppercase123"}
    )
    assert response.status_code == 422

    # No lowercase
    response = client.post(
        "/api/v1/students/change-password",
        headers=headers,
        json={"old_password": "Old", "new_password": "NOLOWERCASE123"}
    )
    assert response.status_code == 422

    # No number
    response = client.post(
        "/api/v1/students/change-password",
        headers=headers,
        json={"old_password": "Old", "new_password": "NoNumberHere"}
    )
    assert response.status_code == 422

def test_student_change_password_forbidden_for_employee(client: TestClient):
    # Employee trying to use student endpoint
    token = create_access_token(subject=1, user_type="employee", role="Admin")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/students/change-password",
        headers=headers,
        json={"old_password": "Old", "new_password": "NewPassword456"}
    )
    assert response.status_code == 403

def test_employee_change_password_success(client: TestClient, session: Session):
    role = Role(title="Admin", is_faculty=False)
    session.add(role)
    session.commit()
    session.refresh(role)

    emp = Employee(
        id=1,
        first_name="Admin",
        last_name="User",
        email="admin@test.com",
        role_id=role.id,
        hire_date=date.today(),
        hashed_password=get_password_hash("OldPassword123")
    )
    session.add(emp)
    session.commit()

    token = create_access_token(subject=1, user_type="employee", role="Admin")
    headers = {"Authorization": f"Bearer {token}"}

    # Change password
    response = client.post(
        "/api/v1/employees/change-password",
        headers=headers,
        json={"old_password": "OldPassword123", "new_password": "NewPassword456"}
    )
    assert response.status_code == 200
    assert response.json() == {"Success": "Password changed successfully"}

    # Verify login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "NewPassword456"}
    )
    assert login_response.status_code == 200

def test_employee_change_password_forbidden_for_student(client: TestClient):
    token = create_access_token(subject=2, user_type="student", role="Student")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/employees/change-password",
        headers=headers,
        json={"old_password": "Old", "new_password": "NewPassword456"}
    )
    assert response.status_code == 403

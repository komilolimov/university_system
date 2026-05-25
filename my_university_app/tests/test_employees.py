import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import date
from src.models.employee import Employee, Role
from src.models.enums import RegionType
from src.core.security import get_password_hash

def setup_employees(session: Session):
    role1 = Role(title="Professor", is_faculty=True)
    role2 = Role(title="Staff", is_faculty=False)
    session.add_all([role1, role2])
    session.commit()
    session.refresh(role1)
    session.refresh(role2)

    emps = [
        Employee(
            first_name="Prof",
            last_name="X",
            email="profx@test.com",
            role_id=role1.id,
            region=RegionType.Domestic,
            hire_date=date.today(),
            is_active=True,
            hashed_password=get_password_hash("pass")
        ),
        Employee(
            first_name="Staff",
            last_name="Member",
            email="staff@test.com",
            role_id=role2.id,
            region=RegionType.Non_EU,
            hire_date=date.today(),
            is_active=False,
            hashed_password=get_password_hash("pass")
        )
    ]
    session.add_all(emps)
    session.commit()

@pytest.mark.parametrize("query_params, expected_count", [
    ("?q=Prof", 1),
    ("?region=Non-EU", 1),
    ("?is_active=true", 1),
    ("", 2),
])
def test_get_employees_filters(client: TestClient, session: Session, admin_token: str, query_params, expected_count):
    # Arrange
    setup_employees(session)
    # Act
    response = client.get(f"/api/v1/employees/{query_params}", headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == expected_count

def test_create_employee(client: TestClient, session: Session, admin_token: str):
    # Arrange
    role = Role(title="NewRole")
    session.add(role)
    session.commit()
    session.refresh(role)

    payload = {
        "first_name": "New",
        "last_name": "Emp",
        "email": "newemp@test.com",
        "role_id": role.id,
        "region": "Domestic",
        "hire_date": str(date.today()),
        "password": "secure"
    }
    # Act
    response = client.post("/api/v1/employees/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 200
    
    # DB check
    db_emp = session.exec(select(Employee).where(Employee.email == "newemp@test.com")).first()
    assert db_emp is not None

def test_employee_forbidden_for_student(client: TestClient, student_token: str):
    # Act
    response = client.delete("/api/v1/employees/1", headers={"Authorization": f"Bearer {student_token}"})
    # Assert
    assert response.status_code == 403

def test_get_non_existent_employee(client: TestClient, admin_token: str):
    # Act
    response = client.get("/api/v1/employees/999", headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 404

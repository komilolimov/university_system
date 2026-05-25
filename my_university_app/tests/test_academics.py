import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import date
from src.models.school import School
from src.models.department import Department
from src.models.program import DegreeProgram, ProgramRequirement
from src.models.course import AcademicTerm, CourseCatalog

def setup_academics(session: Session):
    term1 = AcademicTerm(name="Fall 2026", start_date=date(2026, 9, 1), end_date=date(2026, 12, 15))
    term2 = AcademicTerm(name="Spring 2027", start_date=date(2027, 1, 15), end_date=date(2027, 5, 15))
    session.add_all([term1, term2])
    
    school = School(name="Science")
    session.add(school)
    session.commit()
    session.refresh(school)
    
    dept1 = Department(name="Physics", school_id=school.id)
    dept2 = Department(name="Chemistry", school_id=school.id)
    session.add_all([dept1, dept2])
    session.commit()
    session.refresh(dept1)
    
    prog = DegreeProgram(title="BSc Physics", degree_level="Bachelors", total_credits_required=120, department_id=dept1.id)
    session.add(prog)
    session.commit()

@pytest.mark.parametrize("query_params, expected_count", [
    ("?q=Phys", 1),
    ("?q=mist", 1),
    ("", 2),
])
def test_get_departments_filters(client: TestClient, session: Session, admin_token: str, query_params, expected_count):
    # Arrange
    setup_academics(session)
    school_id = session.exec(select(School)).first().id
    if not query_params:
        query_params = f"?school_id={school_id}"
    elif "?q" not in query_params:
        query_params += f"&school_id={school_id}"
        
    # Act
    response = client.get(f"/api/v1/departments/{query_params}", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    assert len(response.json()) == expected_count

def test_create_department_invalid_school(client: TestClient, admin_token: str):
    # Arrange
    payload = {
        "name": "Invalid Dept",
        "school_id": 9999
    }
    
    # Act
    response = client.post("/api/v1/departments/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code in [400, 404, 422]

def test_get_terms_pagination(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_academics(session)
    
    # Act
    response = client.get("/api/v1/academic-terms/?skip=1&limit=1", headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_create_degree_program(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_academics(session)
    dept = session.exec(select(Department).where(Department.name == "Physics")).first()
    payload = {
        "title": "MSc Physics",
        "degree_level": "Masters",
        "total_credits_required": 60,
        "department_id": dept.id
    }
    
    # Act
    response = client.post("/api/v1/degree-programs/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    db_prog = session.exec(select(DegreeProgram).where(DegreeProgram.title == "MSc Physics")).first()
    assert db_prog is not None

def test_pagination_validation_invalid_skip(client: TestClient, admin_token: str):
    # skip must be >= 0
    response = client.get("/api/v1/departments/?skip=-1", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 422
    assert "ge" in response.text or "greater than or equal to" in response.text

def test_pagination_validation_invalid_limit_low(client: TestClient, admin_token: str):
    # limit must be >= 1
    response = client.get("/api/v1/departments/?limit=0", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 422
    assert "ge" in response.text or "greater than or equal to" in response.text

def test_pagination_validation_invalid_limit_high(client: TestClient, admin_token: str):
    # limit must be <= 100
    response = client.get("/api/v1/departments/?limit=101", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 422
    assert "le" in response.text or "less than or equal to" in response.text

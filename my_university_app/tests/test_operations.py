import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import date
from src.models.course import AcademicTerm, CourseCatalog, CourseOffering, Enrollment
from src.models.department import Department
from src.models.school import School
from src.models.employee import Employee, Role, EmployeeExperience
from src.models.student import Student, StudentProgram
from src.models.program import DegreeProgram
from src.models.enums import EnrollmentStatus, RegionType, ProgramType
from src.core.security import get_password_hash

def setup_operations(session: Session):
    school = School(name="Ops School")
    session.add(school)
    session.commit()
    session.refresh(school)
    
    dept = Department(name="Ops Dept", school_id=school.id)
    session.add(dept)
    session.commit()
    session.refresh(dept)
    
    term = AcademicTerm(name="Fall 2026", start_date=date(2026, 9, 1), end_date=date(2026, 12, 15))
    session.add(term)
    session.commit()
    session.refresh(term)
    
    role = Role(title="Instructor", is_faculty=True)
    session.add(role)
    session.commit()
    session.refresh(role)
    
    emp = Employee(
        first_name="Alan",
        last_name="Turing",
        email="alan@test.com",
        role_id=role.id,
        department_id=dept.id,
        hire_date=date.today(),
        hashed_password=get_password_hash("pass")
    )
    session.add(emp)
    session.commit()
    session.refresh(emp)
    
    student = Student(
        first_name="Student",
        last_name="One",
        email="student@test.com",
        enrollment_date=date.today(),
        hashed_password=get_password_hash("pass")
    )
    session.add(student)
    session.commit()
    session.refresh(student)

    cat = CourseCatalog(code="CS101", title="Intro to CS", credits=3, department_id=dept.id)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    
    offering = CourseOffering(max_capacity=30, catalog_id=cat.id, term_id=term.id, primary_instructor_id=emp.id)
    session.add(offering)
    session.commit()
    session.refresh(offering)
    
    prog = DegreeProgram(title="BSc CS", degree_level="Bachelors", total_credits_required=120, department_id=dept.id)
    session.add(prog)
    session.commit()
    session.refresh(prog)
    
    exp = EmployeeExperience(
        company_name="Tech Corp",
        job_title="Dev",
        start_date=date(2020, 1, 1),
        employee_id=emp.id
    )
    session.add(exp)
    session.commit()

@pytest.mark.parametrize("status", [
    ("Enrolled"),
    ("Waitlisted"),
    ("Dropped"),
])
def test_enrollment_status(client: TestClient, session: Session, student_token: str, admin_token: str, status):
    # Arrange
    setup_operations(session)
    student = session.exec(select(Student)).first()
    offering = session.exec(select(CourseOffering)).first()
    
    # Create the enrollment directly in the DB to test the PUT mutation
    enroll = Enrollment(student_id=student.id, offering_id=offering.id, status=EnrollmentStatus.Enrolled)
    session.add(enroll)
    session.commit()
    
    payload = {
        "status": status,
        "student_id": student.id,
        "offering_id": offering.id
    }
    
    # Act - Use PUT to change status since POST ignores the status parameter in the payload
    # PUT requires admin token
    response = client.put(f"/api/v1/enrollments/{student.id}/{offering.id}", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    db_enroll = session.exec(
        select(Enrollment)
        .where(Enrollment.student_id == student.id)
        .where(Enrollment.offering_id == offering.id)
    ).first()
    assert db_enroll is not None
    assert db_enroll.status.value == status

def test_enrollment_invalid_offering(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_operations(session)
    student = session.exec(select(Student)).first()
    
    payload = {
        "status": "Enrolled",
        "student_id": student.id,
        "offering_id": 9999
    }
    
    # Act
    response = client.post("/api/v1/enrollments/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code in [400, 404, 422]

def test_student_programs_composite_key(client: TestClient, session: Session, admin_token: str):
    # Arrange
    setup_operations(session)
    student = session.exec(select(Student)).first()
    prog = session.exec(select(DegreeProgram)).first()
    
    payload = {
        "type": "Primary Major",
        "declared_date": str(date.today()),
        "student_id": student.id,
        "program_id": prog.id
    }
    
    # Act
    response = client.post("/api/v1/student-programs/", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    
    # Assert
    assert response.status_code == 200
    db_sp = session.exec(
        select(StudentProgram)
        .where(StudentProgram.student_id == student.id)
        .where(StudentProgram.program_id == prog.id)
    ).first()
    assert db_sp is not None
    assert db_sp.type.value == "Primary Major"

def test_employee_experience_forbidden(client: TestClient, session: Session, student_token: str):
    # Arrange
    setup_operations(session)
    exp = session.exec(select(EmployeeExperience)).first()
    
    # Act
    response = client.delete(f"/api/v1/employee-experiences/{exp.id}", headers={"Authorization": f"Bearer {student_token}"})
    
    # Assert
    assert response.status_code == 403

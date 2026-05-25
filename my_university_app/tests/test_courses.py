import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import date
from src.models.course import AcademicTerm, CourseCatalog, CourseOffering, Enrollment
from src.models.department import Department
from src.models.school import School
from src.models.employee import Employee, Role
from src.models.student import Student
from src.models.enums import EnrollmentStatus, RegionType
from src.core.security import get_password_hash

def setup_courses(session: Session):
    # School & Dept
    school = School(name="Engineering")
    session.add(school)
    session.commit()
    session.refresh(school)
    
    dept = Department(name="Computer Science", school_id=school.id)
    session.add(dept)
    session.commit()
    session.refresh(dept)
    
    # Term
    term = AcademicTerm(name="Fall 2026", start_date=date(2026, 9, 1), end_date=date(2026, 12, 15))
    session.add(term)
    session.commit()
    session.refresh(term)
    
    # Instructor
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
    
    # Student
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

    # Catalog & Offering
    cat1 = CourseCatalog(code="CS101", title="Intro to CS", credits=3, department_id=dept.id)
    cat2 = CourseCatalog(code="CS201", title="Data Structures", credits=4, department_id=dept.id)
    session.add_all([cat1, cat2])
    session.commit()
    session.refresh(cat1)
    session.refresh(cat2)
    
    off1 = CourseOffering(max_capacity=30, catalog_id=cat1.id, term_id=term.id, primary_instructor_id=emp.id)
    session.add(off1)
    session.commit()
    session.refresh(off1)
    
    # Enrollment
    enroll = Enrollment(student_id=student.id, offering_id=off1.id, status=EnrollmentStatus.Enrolled)
    session.add(enroll)
    session.commit()

@pytest.mark.parametrize("query_params, expected_count", [
    ("?q=Intro", 1),
    ("?q=CS", 2),
    ("?credits=4", 1),
    ("?credits=3", 1),
    ("", 2),
])
def test_course_catalog_filters(client: TestClient, session: Session, admin_token: str, query_params, expected_count):
    # Arrange
    setup_courses(session)
    dept_id = session.exec(select(Department)).first().id
    if "?q" not in query_params and not query_params:
        query_params = f"?department_id={dept_id}"
    elif "?q" not in query_params:
        query_params += f"&department_id={dept_id}"
        
    # Act
    response = client.get(f"/api/v1/course-catalog/{query_params}", headers={"Authorization": f"Bearer {admin_token}"})
    # Assert
    assert response.status_code == 200
    assert len(response.json()) == expected_count

def test_course_offerings_filters(client: TestClient, session: Session, admin_token: str):
    setup_courses(session)
    term_id = session.exec(select(AcademicTerm)).first().id
    response = client.get(f"/api/v1/course-offerings/?term_id={term_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_student_enroll(client: TestClient, session: Session, admin_token: str):
    setup_courses(session)
    offering = session.exec(select(CourseOffering)).first()
    student = session.exec(select(Student)).first()
    
    # Delete existing enrollment from setup
    enrollment = session.exec(select(Enrollment)).first()
    session.delete(enrollment)
    session.commit()
    
    payload = {
        "status": "Enrolled",
        "student_id": student.id,
        "offering_id": offering.id
    }
    
    response = client.post(
        f"/api/v1/enrollments/",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    
    db_enroll = session.exec(select(Enrollment).where(Enrollment.student_id == student.id)).first()
    assert db_enroll.status == EnrollmentStatus.Enrolled

def test_student_enroll_full_capacity_400(client: TestClient, session: Session, admin_token: str):
    setup_courses(session)
    offering = session.exec(select(CourseOffering)).first()
    student = session.exec(select(Student)).first()
    
    # update capacity to 0
    offering.max_capacity = 0
    session.add(offering)
    session.commit()
    
    # Delete existing enrollment to test clean registration
    enrollment = session.exec(select(Enrollment)).first()
    if enrollment:
        session.delete(enrollment)
        session.commit()
        
    payload = {
        "status": "Enrolled",
        "student_id": student.id,
        "offering_id": offering.id
    }
        
    response = client.post(
        f"/api/v1/enrollments/",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    # The service raises CapacityExceededError which might return 400 or 422 depending on error handler
    assert response.status_code in (400, 409, 422)

def test_student_enroll_forbidden_for_student(client: TestClient, session: Session, student_token: str):
    setup_courses(session)
    offering = session.exec(select(CourseOffering)).first()
    student = session.exec(select(Student)).first()
    
    payload = {
        "status": "Enrolled",
        "student_id": student.id,
        "offering_id": offering.id
    }
    
    response = client.post(
        f"/api/v1/enrollments/",
        json=payload,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403

def test_get_enrollment_not_found(client: TestClient, admin_token: str):
    response = client.get("/api/v1/enrollments/999/999", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 404

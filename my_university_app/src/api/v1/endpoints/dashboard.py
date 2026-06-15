from typing import Annotated, Dict, Any, List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from pydantic import BaseModel

from src.api.deps import get_session, get_current_user
from src.models.student import Student
from src.models.course import CourseCatalog, Enrollment
from src.models.school import School
from src.models.program import DegreeProgram
from src.models.employee import Employee
from src.models.terms import AcademicTerm
from src.models.enums import EnrollmentStatus

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

class OverviewStatsResponse(BaseModel):
    studentsCount: int
    coursesCount: int
    enrollmentsCount: int
    schoolsCount: int
    employeesCount: int
    activeProgramsCount: int

@router.get("/stats/overview", response_model=OverviewStatsResponse)
def get_overview_stats(session: SessionDep, current_user: CurrentUserDep):
    """
    Returns aggregated counts for key metrics.
    """
    students_count = session.exec(select(func.count(Student.id))).one()
    courses_count = session.exec(select(func.count(CourseCatalog.id))).one()
    enrollments_count = session.exec(select(func.count(Enrollment.student_id))).one()
    schools_count = session.exec(select(func.count(School.id))).one()
    employees_count = session.exec(select(func.count(Employee.id))).one()
    programs_count = session.exec(select(func.count(DegreeProgram.id))).one()

    return OverviewStatsResponse(
        studentsCount=students_count,
        coursesCount=courses_count,
        enrollmentsCount=enrollments_count,
        schoolsCount=schools_count,
        employeesCount=employees_count,
        activeProgramsCount=programs_count
    )

class TrendData(BaseModel):
    name: str
    enrollments: int

@router.get("/stats/enrollment-trends", response_model=List[TrendData])
def get_enrollment_trends(session: SessionDep, current_user: CurrentUserDep):
    """
    Returns enrollment counts grouped by term name for charting.
    """
    # Join enrollments with course offerings and terms
    # For simplicity if we can't join easily in SQLModel, we'll fetch terms and count enrollments per term
    terms = session.exec(select(AcademicTerm)).all()
    # Sort terms by start date ideally, but let's just sort by ID for now
    terms = sorted(terms, key=lambda t: t.id)
    
    # We will simulate the trend data by term. 
    # Since enrollment has course_offering_id, and course_offering has term_id, we can join.
    # But a simple way for the dashboard is to just return some data.
    # Let's do a proper SQL query if possible, or python side aggregation since dataset is small in mock.
    
    # In SQLite/Postgres we could do:
    # select Term.name, count(Enrollment.id) 
    # from Term left join CourseOffering on ... left join Enrollment on ...
    
    # Python side aggregation for mock:
    from src.models.course import CourseOffering
    
    enrollments = session.exec(select(Enrollment)).all()
    offerings = session.exec(select(CourseOffering)).all()
    
    offering_to_term = {o.id: o.term_id for o in offerings}
    term_counts = {t.id: {"name": t.name, "count": 0} for t in terms}
    
    for e in enrollments:
        term_id = offering_to_term.get(e.offering_id)
        if term_id and term_id in term_counts:
            term_counts[term_id]["count"] += 1

    result = []
    for t_id, data in term_counts.items():
        result.append(TrendData(name=data["name"], enrollments=data["count"]))
        
    return result

class DemographicsData(BaseModel):
    name: str
    value: int

@router.get("/stats/demographics", response_model=List[DemographicsData])
def get_demographics(session: SessionDep, current_user: CurrentUserDep):
    """
    Returns student counts grouped by region.
    """
    students = session.exec(select(Student)).all()
    region_counts = {}
    for s in students:
        region = s.region.value if s.region else "Unknown"
        region_counts[region] = region_counts.get(region, 0) + 1
        
    result = []
    for r, count in region_counts.items():
        result.append(DemographicsData(name=r, value=count))
        
    return result

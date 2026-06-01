from src.repositories.students import student_repository, student_program_repository
from src.repositories.employees import employee_repository, employee_experience_repository
from src.repositories.rbac import role_repository, permission_repository, link_repository
from src.repositories.departments import department_repository, school_repository, research_lab_repository
from src.repositories.infrastructure import building_repository, room_repository
from src.repositories.programs import degree_program_repository, program_requirement_repository
from src.repositories.courses import course_catalog_repository, course_offering_repository, enrollment_repository
from src.repositories.terms import academic_term_repository

__all__ = [
    "student_repository",
    "student_program_repository",
    "employee_repository",
    "employee_experience_repository",
    "role_repository",
    "permission_repository",
    "link_repository",
    "department_repository",
    "school_repository",
    "research_lab_repository",
    "building_repository",
    "room_repository",
    "degree_program_repository",
    "program_requirement_repository",
    "course_catalog_repository",
    "course_offering_repository",
    "enrollment_repository",
    "academic_term_repository"
]
from src.services.terms import academic_term_service
from src.services.students import student_service
from src.services.roles import role_service
from src.services.programs import degree_program_service, program_requirement_service
from src.services.permission import permission_service
from src.services.operations import student_program_service
from src.services.infrastructure import building_service, room_service
from src.services.employees import employee_service, employee_experience_service
from src.services.departments import department_service, school_service, research_lab_service
from src.services.courses import course_catalog_service, course_offering_service, enrollment_service

__all__ = [
    "academic_term_service",
    "student_service",
    "role_service",
    "degree_program_service",
    "program_requirement_service",
    "permission_service",
    "student_program_service",
    "building_service",
    "room_service",
    "employee_service",
    "employee_experience_service",
    "department_service",
    "school_service",
    "research_lab_service",
    "course_catalog_service",
    "course_offering_service",
    "enrollment_service"
]

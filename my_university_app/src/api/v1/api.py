from fastapi import APIRouter
from src.api.v1.endpoints import auth, permission, roles, dashboard
from src.api.v1.endpoints.students import router as students_router
from src.api.v1.endpoints.employees import employee_router, experience_router
from src.api.v1.endpoints.departments import department_router, school_router, research_lab_router
from src.api.v1.endpoints.programs import degree_program_router, program_requirement_router
from src.api.v1.endpoints.courses import course_catalog_router, course_offering_router, enrollment_router
from src.api.v1.endpoints.terms import router as terms_router
from src.api.v1.endpoints.infrastructure import building_router, room_router
from src.api.v1.endpoints.operations import router as operations_router
from src.api.v1.endpoints.documents import router as documents_router

api_router = APIRouter(prefix="/api/v1")

# Dashboard Stats
api_router.include_router(dashboard.router)

# Authentication & RBAC
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(permission.router, prefix="/permissions", tags=["Permissions"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])

# Users (Students & Employees)
api_router.include_router(students_router)
api_router.include_router(employee_router)
api_router.include_router(experience_router)

# University Structure
api_router.include_router(department_router)
api_router.include_router(school_router)
api_router.include_router(research_lab_router)

# Academic Programs & Courses
api_router.include_router(degree_program_router)
api_router.include_router(program_requirement_router)
api_router.include_router(course_catalog_router)
api_router.include_router(course_offering_router)
api_router.include_router(enrollment_router)

# Infrastructure & Terms
api_router.include_router(terms_router)
api_router.include_router(building_router)
api_router.include_router(room_router)

# Operations & Documents
api_router.include_router(operations_router)
api_router.include_router(documents_router)
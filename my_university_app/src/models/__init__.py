from sqlmodel import SQLModel
from src.models.auth import ChangePasswordRequest

from src.models.enums import ProgramType, EnrollmentStatus, RoomType, RegionType
from src.models.school import School, SchoolCreate, SchoolRead, SchoolUpdate
from src.models.department import Department, DepartmentCreate, DepartmentRead, DepartmentUpdate, ResearchLab, ResearchLabCreate, ResearchLabRead, ResearchLabUpdate
from src.models.room import Building, BuildingCreate, BuildingRead, BuildingUpdate, Room, RoomCreate, RoomRead, RoomUpdate
from src.models.employee import (
    Role, RoleCreate, RoleRead, RoleUpdate, 
    Employee, EmployeeCreate, EmployeeRead, EmployeeUpdate, 
    EmployeeExperience, EmployeeExperienceCreate, EmployeeExperienceRead, EmployeeExperienceUpdate,
    Permission, PermissionCreate, PermissionRead, PermissionUpdate, RolePermissionLink
)
from src.models.student import Student, StudentCreate, StudentRead, StudentUpdate, StudentProgram, StudentProgramCreate, StudentProgramRead, StudentProgramUpdate
from src.models.program import DegreeProgram, DegreeProgramCreate, DegreeProgramRead, DegreeProgramUpdate, ProgramRequirement, ProgramRequirementCreate, ProgramRequirementRead, ProgramRequirementUpdate
from src.models.course import AcademicTerm, AcademicTermCreate, AcademicTermRead, AcademicTermUpdate, CourseCatalog, CourseCatalogCreate, CourseCatalogRead, CourseCatalogUpdate, CourseOffering, CourseOfferingCreate, CourseOfferingRead, CourseOfferingUpdate, Enrollment, EnrollmentCreate, EnrollmentRead, EnrollmentUpdate

__all__ = [
    "SQLModel",
    "ChangePasswordRequest",
    "ProgramType", "EnrollmentStatus", "RoomType", "RegionType",
    "School", "SchoolCreate", "SchoolRead", "SchoolUpdate",
    "Department", "DepartmentCreate", "DepartmentRead", "DepartmentUpdate", 
    "ResearchLab", "ResearchLabCreate", "ResearchLabRead", "ResearchLabUpdate",
    "Building", "BuildingCreate", "BuildingRead", "BuildingUpdate", 
    "Room", "RoomCreate", "RoomRead", "RoomUpdate",
    "Role", "RoleCreate", "RoleRead", "RoleUpdate", 
    "Employee", "EmployeeCreate", "EmployeeRead", "EmployeeUpdate", 
    "EmployeeExperience", "EmployeeExperienceCreate", "EmployeeExperienceRead", "EmployeeExperienceUpdate",
    "Permission", "PermissionCreate", "PermissionRead", "PermissionUpdate", "RolePermissionLink",
    "Student", "StudentCreate", "StudentRead", "StudentUpdate", 
    "StudentProgram", "StudentProgramCreate", "StudentProgramRead", "StudentProgramUpdate",
    "DegreeProgram", "DegreeProgramCreate", "DegreeProgramRead", "DegreeProgramUpdate", 
    "ProgramRequirement", "ProgramRequirementCreate", "ProgramRequirementRead", "ProgramRequirementUpdate",
    "AcademicTerm", "AcademicTermCreate", "AcademicTermRead", "AcademicTermUpdate", 
    "CourseCatalog", "CourseCatalogCreate", "CourseCatalogRead", "CourseCatalogUpdate", 
    "CourseOffering", "CourseOfferingCreate", "CourseOfferingRead", "CourseOfferingUpdate", 
    "Enrollment", "EnrollmentCreate", "EnrollmentRead", "EnrollmentUpdate"
]
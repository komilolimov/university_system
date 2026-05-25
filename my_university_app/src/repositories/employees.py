from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models import Employee, EmployeeExperience, Role

class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self):
        super().__init__(Employee)

class EmployeeExperienceRepository(BaseRepository[EmployeeExperience]):
    def __init__(self):
        super().__init__(EmployeeExperience)

class RoleRepository(BaseRepository[Role]):
    def __init__(self):
        super().__init__(Role)

employee_repository = EmployeeRepository()
employee_experience_repository = EmployeeExperienceRepository()
role_repository = RoleRepository()

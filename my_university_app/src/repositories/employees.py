from src.repositories.base import BaseRepository
from src.models.employee import Employee, EmployeeExperience

class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self):
        super().__init__(Employee)

class EmployeeExperienceRepository(BaseRepository[EmployeeExperience]):
    def __init__(self):
        super().__init__(EmployeeExperience)

employee_repository = EmployeeRepository()
employee_experience_repository = EmployeeExperienceRepository()
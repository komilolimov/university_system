from src.repositories.base import BaseRepository
from src.models.employee import Employee, EmployeeExperience
from sqlmodel import Session, select


class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self):
        super().__init__(Employee)
    def get_by_email(self, session: Session, email: str) -> Employee | None:
        return session.exec(select(Employee).where(Employee.email == email)).first()

employee_repository = EmployeeRepository()

class EmployeeExperienceRepository(BaseRepository[EmployeeExperience]):
    def __init__(self):
        super().__init__(EmployeeExperience)

employee_repository = EmployeeRepository()
employee_experience_repository = EmployeeExperienceRepository()
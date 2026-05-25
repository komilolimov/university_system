from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models import Student, StudentProgram, RegionType

class StudentRepository(BaseRepository[Student]):
    def __init__(self):
        super().__init__(Student)

    def get_by_filters(self, session: Session, region: Optional[RegionType] = None, is_active: Optional[bool] = None) -> List[Student]:
        query = select(Student)
        if region:
            query = query.where(Student.region == region)
        if is_active is not None:
            query = query.where(Student.is_active == is_active)
        return session.exec(query).all()

class StudentProgramRepository(BaseRepository[StudentProgram]):
    def __init__(self):
        super().__init__(StudentProgram)

student_repository = StudentRepository()
student_program_repository = StudentProgramRepository()

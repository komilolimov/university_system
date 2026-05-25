from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models.student import StudentProgram


class StudentProgramRepository(BaseRepository[StudentProgram]):
    def __init__(self):
        super().__init__(StudentProgram)

    def get(self, session: Session, student_id: int, program_id: int) -> Optional[StudentProgram]:
        return session.get(StudentProgram, (student_id, program_id))

    def get_by_student(self, session: Session, student_id: int) -> List[StudentProgram]:
        query = select(StudentProgram).where(StudentProgram.student_id == student_id)
        return session.exec(query).all()

    def delete(self, session: Session, student_id: int, program_id: int) -> bool:
        obj = self.get(session, student_id, program_id)
        if obj:
            session.delete(obj)
            session.flush()
            return True
        return False


student_program_repository = StudentProgramRepository()

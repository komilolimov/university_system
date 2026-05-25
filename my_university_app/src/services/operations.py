from src.core.exceptions import EntityNotFoundError
from typing import List
from sqlmodel import Session
from src.repositories.operations import student_program_repository
from src.models.student import StudentProgram, StudentProgramCreate, StudentProgramUpdate
from src.core.uow import UnitOfWork


class StudentProgramService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[StudentProgram]:
        return student_program_repository.get_all(session=session, skip=skip, limit=limit)

    def get_by_student(self, session: Session, student_id: int) -> List[StudentProgram]:
        return student_program_repository.get_by_student(session=session, student_id=student_id)

    def get(self, session: Session, student_id: int, program_id: int) -> StudentProgram:
        obj = student_program_repository.get(session=session, student_id=student_id, program_id=program_id)
        if not obj:
            raise EntityNotFoundError("StudentProgram", f"{student_id}-{program_id}")
        return obj

    def create(self, session: Session, obj_in: StudentProgramCreate) -> StudentProgram:
        with UnitOfWork(session):
            return student_program_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, student_id: int, program_id: int, obj_in: StudentProgramUpdate) -> StudentProgram:
        with UnitOfWork(session):
            db_obj = self.get(session=session, student_id=student_id, program_id=program_id)
            return student_program_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, student_id: int, program_id: int) -> dict:
        with UnitOfWork(session):
            self.get(session=session, student_id=student_id, program_id=program_id)
            student_program_repository.delete(session=session, student_id=student_id, program_id=program_id)
            return {"Success": "Student program deleted"}


student_program_service = StudentProgramService()

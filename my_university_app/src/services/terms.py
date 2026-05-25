from src.core.exceptions import EntityNotFoundError
from typing import List
from sqlmodel import Session
from src.repositories.terms import academic_term_repository
from src.models.course import AcademicTerm, AcademicTermCreate, AcademicTermUpdate
from src.core.uow import UnitOfWork


class AcademicTermService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[AcademicTerm]:
        return academic_term_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> AcademicTerm:
        obj = academic_term_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("AcademicTerm", id)
        return obj

    def create(self, session: Session, obj_in: AcademicTermCreate) -> AcademicTerm:
        with UnitOfWork(session):
            return academic_term_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: AcademicTermUpdate) -> AcademicTerm:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return academic_term_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            academic_term_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Academic term deleted"}


academic_term_service = AcademicTermService()

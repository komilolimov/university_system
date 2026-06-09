from src.core.exceptions import EntityNotFoundError
from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.terms import academic_term_repository
from src.models.terms import AcademicTerm, AcademicTermCreate, AcademicTermUpdate
from src.core.uow import UnitOfWork


class AcademicTermService:
    def get_all(
        self, 
        session: Session, 
        is_active: Optional[bool] = True, # По умолчанию отдаем только активные
        skip: int = 0, 
        limit: int = 100
    ) -> List[AcademicTerm]:
        statement = select(AcademicTerm)
        
        # Добавляем фильтр по активности, если он передан
        if is_active is not None:
            statement = statement.where(AcademicTerm.is_active == is_active)
            
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

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
            # Soft delete: переводим в неактивный статус вместо удаления из БД
            academic_term_repository.update(
                session=session, 
                db_obj=db_obj, 
                obj_in={"is_active": False}
            )
            return {"Success": "Academic term archived (Soft Deleted)"}

academic_term_service = AcademicTermService()
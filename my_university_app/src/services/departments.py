from src.core.exceptions import EntityNotFoundError
from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.departments import department_repository, school_repository, research_lab_repository
from src.models.department import (
    Department, DepartmentCreate, DepartmentUpdate,
    ResearchLab, ResearchLabCreate, ResearchLabUpdate,
)
from src.models.school import School, SchoolCreate, SchoolUpdate
from src.core.uow import UnitOfWork


class DepartmentService:
    def get_all(
        self, 
        session: Session, 
        q: Optional[str] = None,
        school_id: Optional[int] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Department]:
        statement = select(Department)
        if q:
            statement = statement.where(Department.name.ilike(f"%{q}%"))
        if school_id is not None:
            statement = statement.where(Department.school_id == school_id)
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get(self, session: Session, id: int) -> Department:
        obj = department_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("Department", id)
        return obj

    def create(self, session: Session, obj_in: DepartmentCreate) -> Department:
        with UnitOfWork(session):
            school = school_repository.get(session=session, id=obj_in.school_id)
            if not school:
                raise EntityNotFoundError("School", obj_in.school_id)
            return department_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: DepartmentUpdate) -> Department:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return department_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            department_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Department deleted"}


class SchoolService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[School]:
        return school_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> School:
        obj = school_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("School", id)
        return obj

    def create(self, session: Session, obj_in: SchoolCreate) -> School:
        with UnitOfWork(session):
            return school_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: SchoolUpdate) -> School:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return school_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            school_repository.delete(session=session, id=db_obj.id)
            return {"Success": "School deleted"}


class ResearchLabService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[ResearchLab]:
        return research_lab_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> ResearchLab:
        obj = research_lab_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("ResearchLab", id)
        return obj

    def create(self, session: Session, obj_in: ResearchLabCreate) -> ResearchLab:
        with UnitOfWork(session):
            return research_lab_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: ResearchLabUpdate) -> ResearchLab:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return research_lab_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            research_lab_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Research lab deleted"}


department_service = DepartmentService()
school_service = SchoolService()
research_lab_service = ResearchLabService()

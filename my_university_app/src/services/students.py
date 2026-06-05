from src.core.exceptions import EntityNotFoundError
from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy import or_
from src.repositories.students import student_repository
from src.models.student import Student, StudentCreate, StudentUpdate, RegionType
from src.core.security import get_password_hash, verify_password
from src.core.uow import UnitOfWork
from src.models.auth import ChangePasswordRequest

class StudentService:
    def get_all(
        self, 
        session: Session, 
        q: Optional[str] = None,
        region: Optional[RegionType] = None,
        advisor_id: Optional[int] = None,
        is_active: Optional[bool] = True,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Student]:
        statement = select(Student)
        if q:
            statement = statement.where(
                or_(
                    Student.first_name.ilike(f"%{q}%"),
                    Student.last_name.ilike(f"%{q}%"),
                    Student.email.ilike(f"%{q}%")
                )
            )
        if region:
            statement = statement.where(Student.region == region)
        if advisor_id is not None:
            statement = statement.where(Student.advisor_id == advisor_id)
        if is_active is not None:
            statement = statement.where(Student.is_active == is_active)
            
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get(self, session: Session, id: int) -> Student:
        obj = student_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("Student", id)
        return obj

    def create(self, session: Session, obj_in: StudentCreate) -> Student:
        with UnitOfWork(session):
            create_data = obj_in.model_dump(exclude={"password"})
            create_data["hashed_password"] = get_password_hash(obj_in.password)
            return student_repository.create(session=session, obj_in=create_data)

    def update(self, session: Session, id: int, obj_in: StudentUpdate) -> Student:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            update_data = obj_in.model_dump(exclude_unset=True)
            return student_repository.update(session=session, db_obj=db_obj, obj_in=update_data)

    def change_password(self, session: Session, id: int, obj_in: ChangePasswordRequest) -> None:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            if not verify_password(obj_in.old_password, db_obj.hashed_password):
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="Incorrect old password")
            db_obj.hashed_password = get_password_hash(obj_in.new_password)
            session.add(db_obj)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            
            db_obj.is_active = False
            session.add(db_obj)
            
            return {"Success": "Student archived successfully"}

student_service = StudentService()

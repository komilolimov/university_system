from src.core.exceptions import EntityNotFoundError
from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy import or_
from src.repositories.employees import employee_repository, employee_experience_repository
from src.repositories.rbac import role_repository
from src.models.employee import (
    Employee, EmployeeCreate, EmployeeUpdate,
    Role, RoleCreate, RoleUpdate,
    EmployeeExperience, EmployeeExperienceCreate, EmployeeExperienceUpdate,
)
from src.core.security import get_password_hash, verify_password
from src.core.uow import UnitOfWork
from src.models.auth import ChangePasswordRequest

class EmployeeService:
    def get_all(
        self, 
        session: Session, 
        q: Optional[str] = None,
        department_id: Optional[int] = None,
        role_id: Optional[int] = None,
        region: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Employee]:
        statement = select(Employee)
        if q:
            statement = statement.where(
                or_(
                    Employee.first_name.ilike(f"%{q}%"),
                    Employee.last_name.ilike(f"%{q}%"),
                    Employee.email.ilike(f"%{q}%")
                )
            )
        if department_id is not None:
            statement = statement.where(Employee.department_id == department_id)
        if role_id is not None:
            statement = statement.where(Employee.role_id == role_id)
        if region:
            statement = statement.where(Employee.region == region)
        if is_active is not None:
            statement = statement.where(Employee.is_active == is_active)
            
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get(self, session: Session, id: int) -> Employee:
        obj = employee_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("Employee", id)
        return obj

    def create(self, session: Session, obj_in: EmployeeCreate) -> Employee:
        with UnitOfWork(session):
            # 1. Превращаем Pydantic-схему в словарь и исключаем открытый пароль
            create_data = obj_in.model_dump(exclude={"password"})
            
            # 2. Хэшируем пароль и добавляем его под правильным ключом для БД
            create_data["hashed_password"] = get_password_hash(obj_in.password)
            
            # 3. Передаем готовый словарь в репозиторий
            return employee_repository.create(session=session, obj_in=create_data)

    def update(self, session: Session, id: int, obj_in: EmployeeUpdate) -> Employee:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            
            # Превращаем данные для обновления в словарь (только те, что были переданы)
            update_data = obj_in.model_dump(exclude_unset=True)
            
            return employee_repository.update(session=session, db_obj=db_obj, obj_in=update_data)

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
            employee_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Employee deleted"}



class RoleService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[Role]:
        return role_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> Role:
        obj = role_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("Role", id)
        return obj

    def create(self, session: Session, obj_in: RoleCreate) -> Role:
        with UnitOfWork(session):
            return role_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: RoleUpdate) -> Role:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return role_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            role_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Role deleted"}


class EmployeeExperienceService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[EmployeeExperience]:
        return employee_experience_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> EmployeeExperience:
        obj = employee_experience_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("EmployeeExperience", id)
        return obj

    def create(self, session: Session, obj_in: EmployeeExperienceCreate) -> EmployeeExperience:
        with UnitOfWork(session):
            return employee_experience_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: EmployeeExperienceUpdate) -> EmployeeExperience:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return employee_experience_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            employee_experience_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Employee experience deleted"}


employee_service = EmployeeService()
role_service = RoleService()
employee_experience_service = EmployeeExperienceService()
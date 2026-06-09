from src.core.exceptions import EntityNotFoundError
from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy import or_
from fastapi import HTTPException, status

from src.repositories.employees import employee_repository, employee_experience_repository
from src.repositories.rbac import role_repository
from src.models.employee import (
    Employee, EmployeeCreate, EmployeeUpdate,
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
            # Проверка уникальности Email
            existing_email = session.exec(select(Employee).where(Employee.email == obj_in.email)).first()
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already registered")
                
            # Проверка существования Role
            role = role_repository.get(session=session, id=obj_in.role_id)
            if not role:
                raise HTTPException(status_code=404, detail="Assigned Role not found")

            # 1. Превращаем Pydantic-схему в словарь и исключаем открытый пароль
            create_data = obj_in.model_dump(exclude={"password"})
            
            # 2. Хэшируем пароль и добавляем его под правильным ключом для БД
            create_data["hashed_password"] = get_password_hash(obj_in.password)
            
            # 3. Передаем готовый словарь в репозиторий
            return employee_repository.create(session=session, obj_in=create_data)

    def update(self, session: Session, id: int, obj_in: EmployeeUpdate) -> Employee:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            
            # Проверка Email при обновлении
            if obj_in.email and obj_in.email != db_obj.email:
                existing_email = session.exec(select(Employee).where(Employee.email == obj_in.email)).first()
                if existing_email:
                    raise HTTPException(status_code=400, detail="Email already registered")
                    
            # Проверка Role при обновлении
            if obj_in.role_id and obj_in.role_id != db_obj.role_id:
                role = role_repository.get(session=session, id=obj_in.role_id)
                if not role:
                    raise HTTPException(status_code=404, detail="Assigned Role not found")
            
            # Превращаем данные для обновления в словарь (только те, что были переданы)
            update_data = obj_in.model_dump(exclude_unset=True)
            
            updated_employee = employee_repository.update(session=session, db_obj=db_obj, obj_in=update_data)
        
        # ОБЯЗАТЕЛЬНО: делаем refresh, чтобы подгрузить свежие данные из базы (включая связи)
        session.flush() # сохраняем изменения в транзакции
        session.refresh(updated_employee) # обновляем объект данными из БД
        
        return updated_employee

    def change_password(self, session: Session, id: int, obj_in: ChangePasswordRequest) -> None:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            if not verify_password(obj_in.old_password, db_obj.hashed_password):
                raise HTTPException(status_code=400, detail="Incorrect old password")
            db_obj.hashed_password = get_password_hash(obj_in.new_password)
            session.add(db_obj)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            
            # Мягкое удаление (Архивирование)
            db_obj.is_active = False
            session.add(db_obj)
            
            return {"Success": "Employee archived successfully"}


class EmployeeExperienceService:
    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[EmployeeExperience]:
        return employee_experience_repository.get_all(session=session, skip=skip, limit=limit)

    def get(self, session: Session, id: int) -> EmployeeExperience:
        obj = employee_experience_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("EmployeeExperience", id)
        return obj

    # ИСПРАВЛЕНО: Добавлен аргумент employee_id для связки с роутером
    def create(self, session: Session, employee_id: int, obj_in: EmployeeExperienceCreate) -> EmployeeExperience:
        with UnitOfWork(session):
            # Проверяем, существует ли такой сотрудник, прежде чем добавлять ему опыт
            employee = employee_repository.get(session=session, id=employee_id)
            if not employee:
                raise EntityNotFoundError("Employee", employee_id)
            
            # Подмешиваем employee_id в данные перед созданием записи
            create_data = obj_in.model_dump()
            create_data["employee_id"] = employee_id
            
            return employee_experience_repository.create(session=session, obj_in=create_data)

    def update(self, session: Session, id: int, obj_in: EmployeeExperienceUpdate) -> EmployeeExperience:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            # Извлекаем только те поля, которые были переданы (PATCH поведение)
            update_data = obj_in.model_dump(exclude_unset=True)
            return employee_experience_repository.update(session=session, db_obj=db_obj, obj_in=update_data)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            # Жесткое удаление опыта работы из базы
            employee_experience_repository.delete(session=session, id=db_obj.id)
            return {"Success": "Employee experience deleted"}

employee_service = EmployeeService()
employee_experience_service = EmployeeExperienceService()
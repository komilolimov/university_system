from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import or_
from src.core.exceptions import EntityNotFoundError
from src.core.uow import UnitOfWork
from src.repositories.rbac import role_repository
from src.models.roles import Role, RoleCreate, RoleUpdate
from src.models.permission import Permission

# Схема для принятия массива ID прав от фронтенда
class RoleAssignPermissions(BaseModel):
    permission_ids: List[int]
    assign_all: bool = False

class RoleService:
    def get_all(
        self, 
        session: Session, 
        is_active: Optional[bool] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Role]:
        statement = select(Role)
        if is_active is not None:
            statement = statement.where(Role.is_active == is_active)
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    # Используем имя `get` для согласованности с EmployeeService
    def get(self, session: Session, id: int) -> Role:
        obj = role_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("Role", id)
        return obj

    def create(self, session: Session, obj_in: RoleCreate) -> Role:
        with UnitOfWork(session):
            # Проверка уникальности title
            existing = session.exec(select(Role).where(Role.title == obj_in.title)).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role with this title already exists")
            
            return role_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: RoleUpdate) -> Role:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            
            # Проверяем уникальность title, если он был передан и изменился
            if obj_in.title is not None and obj_in.title != db_obj.title:
                existing = session.exec(select(Role).where(Role.title == obj_in.title)).first()
                if existing:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role with this title already exists")
                    
            return role_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            
            # Мягкое удаление (Soft Delete)
            db_obj.is_active = False
            session.add(db_obj)
            
            return {"Success": "Role archived successfully"}

    def assign_permissions(self, session: Session, id: int, payload: RoleAssignPermissions) -> Role:
        with UnitOfWork(session):
            role = self.get(session=session, id=id)

            if payload.assign_all:
                permissions = session.exec(select(Permission)).all()
            else:
                permissions = session.exec(
                    select(Permission).where(Permission.id.in_(payload.permission_ids))
                ).all()
                
                # Защита от дурака
                if len(permissions) != len(payload.permission_ids):
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND, 
                        detail="One or more permissions not found in the database"
                    )

            # Магия SQLModel: автоматически обновляет связи в базе
            role.permissions = permissions
            session.add(role)
            
            return role

role_service = RoleService()
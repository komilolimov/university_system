from typing import List
from sqlmodel import Session, select
from fastapi import HTTPException, status

# Добавили RoleUpdate и нужные импорты для архитектуры
from src.models.employee import Role, RoleCreate, RoleUpdate
from src.repositories.rbac import role_repository
from src.core.uow import UnitOfWork
from src.core.exceptions import EntityNotFoundError

class RoleService:
    def get_all(self, session: Session) -> List[Role]:
        return role_repository.get_all(session=session)

    def get_by_id(self, session: Session, role_id: int) -> Role:
        role = role_repository.get(session=session, id=role_id)
        if not role:
            raise EntityNotFoundError("Role", role_id)
        return role

    def create(self, session: Session, role_in: RoleCreate) -> Role:
        with UnitOfWork(session):
            existing = session.exec(select(Role).where(Role.title == role_in.title)).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role with this title already exists")
            
            return role_repository.create(session=session, obj_in=role_in)

    # Исправлено на RoleUpdate
    def update(self, session: Session, role_id: int, role_in: RoleUpdate) -> Role:
        with UnitOfWork(session):
            role = self.get_by_id(session=session, role_id=role_id)
            
            # Проверяем уникальность title, если он был передан и изменился
            if role_in.title is not None and role_in.title != role.title:
                existing = session.exec(select(Role).where(Role.title == role_in.title)).first()
                if existing:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role with this title already exists")
                    
            return role_repository.update(session=session, db_obj=role, obj_in=role_in)

    def delete(self, session: Session, role_id: int) -> dict:
        with UnitOfWork(session):
            role = self.get_by_id(session=session, role_id=role_id)
            role_repository.delete(session=session, id=role.id)
            return {"detail": "Role deleted successfully"}

# Создаем глобальный инстанс сервиса
role_service = RoleService()
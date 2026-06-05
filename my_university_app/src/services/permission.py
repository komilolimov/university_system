from typing import List
from sqlmodel import Session, select
from fastapi import HTTPException, status
from src.models.permission import Permission, PermissionCreate, PermissionUpdate
from src.repositories.rbac import permission_repository, role_repository
from src.core.uow import UnitOfWork
from src.core.exceptions import EntityNotFoundError

class PermissionService:
    def get_all(self, session: Session) -> List[Permission]:
        return permission_repository.get_all(session=session)

    def get_by_id(self, session: Session, permission_id: int) -> Permission:
        permission = permission_repository.get(session=session, id=permission_id)
        if not permission:
            raise EntityNotFoundError("Permission", permission_id)
        return permission

    def create(self, session: Session, permission_in: PermissionCreate) -> Permission:
        with UnitOfWork(session):
            existing = session.exec(select(Permission).where(Permission.name == permission_in.name)).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Permission already exists")
            
            return permission_repository.create(session=session, obj_in=permission_in)

    def update(self, session: Session, permission_id: int, permission_in: PermissionUpdate) -> Permission:
        with UnitOfWork(session):
            permission = self.get_by_id(session=session, permission_id=permission_id)
            
            if permission_in.name is not None and permission_in.name != permission.name:
                existing = session.exec(select(Permission).where(Permission.name == permission_in.name)).first()
                if existing:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Permission with this name already exists")
                    
            return permission_repository.update(session=session, db_obj=permission, obj_in=permission_in)

    def delete(self, session: Session, permission_id: int) -> dict:
        with UnitOfWork(session):
            permission = self.get_by_id(session=session, permission_id=permission_id)
            permission_repository.delete(session=session, id=permission.id)
            return {"detail": "Permission deleted successfully"}

    # --- ИСПРАВЛЕНО: Привязка через магию ORM ---
    def assign_to_role(self, session: Session, role_id: int, permission_id: int) -> dict:
        with UnitOfWork(session):
            role = role_repository.get(session=session, id=role_id)
            if not role:
                raise EntityNotFoundError("Role", role_id)
                
            permission = self.get_by_id(session=session, permission_id=permission_id)
            
            # Проверяем, есть ли уже это право у роли
            if permission in role.permissions:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Permission already assigned to this role")
                
            # Добавляем право (ORM сама создаст запись в таблице-связке)
            role.permissions.append(permission)
            session.add(role)
            
            return {"detail": "Permission assigned successfully"}

    # --- ИСПРАВЛЕНО: Отвязка через магию ORM ---
    def revoke_from_role(self, session: Session, role_id: int, permission_id: int) -> dict:
        with UnitOfWork(session):
            role = role_repository.get(session=session, id=role_id)
            if not role:
                raise EntityNotFoundError("Role", role_id)

            permission = self.get_by_id(session=session, permission_id=permission_id)
            
            # Проверяем, есть ли это право у роли вообще
            if permission not in role.permissions:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission is not assigned to this role")
                
            # Удаляем право (ORM сама удалит запись из таблицы-связки)
            role.permissions.remove(permission)
            session.add(role)
            
            return {"detail": "Permission revoked successfully"}

permission_service = PermissionService()
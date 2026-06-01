from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models.employee import Role, Permission, RolePermissionLink

class RoleRepository(BaseRepository[Role]):
    def __init__(self):
        super().__init__(Role)

class PermissionRepository(BaseRepository[Permission]):
    def __init__(self):
        super().__init__(Permission)

# Репозиторий для таблицы Many-to-Many
class RolePermissionLinkRepository:
    def get_link(self, session: Session, role_id: int, permission_id: int) -> RolePermissionLink | None:
        return session.exec(
            select(RolePermissionLink)
            .where(RolePermissionLink.role_id == role_id)
            .where(RolePermissionLink.permission_id == permission_id)
        ).first()

    def create_link(self, session: Session, role_id: int, permission_id: int) -> RolePermissionLink:
        link = RolePermissionLink(role_id=role_id, permission_id=permission_id)
        session.add(link)
        return link

    def delete_link(self, session: Session, link: RolePermissionLink) -> None:
        session.delete(link)

role_repository = RoleRepository()
permission_repository = PermissionRepository()
link_repository = RolePermissionLinkRepository()
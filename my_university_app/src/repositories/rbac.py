
from src.repositories.base import BaseRepository
from src.models.employee import Role, Permission, RolePermissionLink

class RoleRepository(BaseRepository[Role]):
    def __init__(self):
        super().__init__(Role)

class PermissionRepository(BaseRepository[Permission]):
    def __init__(self):
        super().__init__(Permission)



role_repository = RoleRepository()
permission_repository = PermissionRepository()

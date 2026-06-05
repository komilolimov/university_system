from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from src.models.base import TimestampMixin

# Используем TYPE_CHECKING, чтобы избежать циклических импортов
if TYPE_CHECKING:
    from src.models.roles import Role  # ИСПРАВЛЕНО: role вместо roles

# ==========================================
# 1. СВЯЗУЮЩАЯ ТАБЛИЦА (Many-to-Many)
# ==========================================
class RolePermissionLink(SQLModel, table=True):
    __tablename__ = "role_permissions"
    role_id: Optional[int] = Field(default=None, foreign_key="roles.id", primary_key=True)
    permission_id: Optional[int] = Field(default=None, foreign_key="permissions.id", primary_key=True)

# ==========================================
# 2. ПРАВА (PERMISSIONS)
# ==========================================
class PermissionBase(SQLModel):
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    is_active: bool = Field(default=True)

class PermissionUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Permission(PermissionBase, TimestampMixin, table=True):
    __tablename__ = "permissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Обратная связь с ролями (используем строковое название "Role" для отложенного импорта)
    roles: list["Role"] = Relationship(back_populates="permissions", link_model=RolePermissionLink)

class PermissionCreate(PermissionBase):
    pass

class PermissionRead(PermissionBase):
    id: int

class AssignPermissionRequest(SQLModel):
    role_id: int
    permission_id: int
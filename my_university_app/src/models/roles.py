from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from src.models.base import TimestampMixin  # Убедись, что этот импорт правильный для твоего проекта

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

class Permission(PermissionBase, TimestampMixin, table=True):
    __tablename__ = "permissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Обратная связь с ролями
    roles: list["Role"] = Relationship(back_populates="permissions", link_model=RolePermissionLink)

class PermissionCreate(PermissionBase):
    pass

class PermissionRead(PermissionBase):
    id: int

class PermissionUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None

class AssignPermissionRequest(SQLModel):
    role_id: int
    permission_id: int

# ==========================================
# 3. РОЛИ (ROLES)
# ==========================================
class RoleBase(SQLModel):
    title: str = Field(unique=True, index=True)
    is_faculty: bool = Field(default=False)

class Role(RoleBase, TimestampMixin, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Прямая связь с правами
    permissions: list["Permission"] = Relationship(back_populates="roles", link_model=RolePermissionLink)

class RoleCreate(RoleBase):
    pass

class RoleRead(RoleBase):
    id: int

class RoleUpdate(SQLModel):
    title: Optional[str] = None
    is_faculty: Optional[bool] = None
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from src.models.base import TimestampMixin

# Импортируем связующую таблицу из файла с правами
from src.models.permission import RolePermissionLink

# Используем TYPE_CHECKING, чтобы избежать циклических импортов
if TYPE_CHECKING:
    from src.models.permission import Permission, PermissionRead

# ==========================================
# РОЛИ (ROLES)
# ==========================================
class RoleBase(SQLModel):
    title: str = Field(unique=True, index=True)
    is_faculty: bool = Field(default=False)
    # Наш спасительный флаг для мягкого удаления
    is_active: bool = Field(default=True)

class Role(RoleBase, TimestampMixin, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Прямая связь с правами (используем строковое "Permission" для отложенного импорта)
    permissions: list["Permission"] = Relationship(
        back_populates="roles", 
        link_model=RolePermissionLink
    )

class RoleCreate(RoleBase):
    pass

class RoleRead(RoleBase):
    id: int
    is_active: bool  # Полезно отдавать на фронтенд статус роли

class RoleReadWithPermissions(RoleBase):
    id: int
    is_active: bool
    permissions: list["PermissionRead"] = [] # В кавычках из-за TYPE_CHECKING

class RoleUpdate(SQLModel):
    title: Optional[str] = None
    is_faculty: Optional[bool] = None
    is_active: Optional[bool] = None
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class TimestampMixin(SQLModel):
    """
    Миксин для добавления полей аудита ко всем таблицам базы данных.
    """
    created_at: datetime = Field(
        default_factory=utc_now, 
        nullable=False,
        description="Время создания записи"
    )
    updated_at: datetime = Field(
        default_factory=utc_now, 
        nullable=False,
        description="Время последнего обновления"
    )
    deleted_at: Optional[datetime] = Field(
        default=None, 
        nullable=True,
        description="Время мягкого удаления (Soft Delete)"
    )
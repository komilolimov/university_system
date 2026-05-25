from typing import TypeVar, Generic, Type, Optional, List, Any, Union
from sqlmodel import Session, select, SQLModel

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=Union[SQLModel, dict])
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=Union[SQLModel, dict])

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, session: Session, id: Any) -> Optional[ModelType]:
        """Получение записи по ID (поддерживает и int, и композитные ключи)."""
        return session.get(self.model, id)

    def get_all(self, session: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Получение списка записей с пагинацией."""
        query = select(self.model).offset(skip).limit(limit)
        return session.exec(query).all()

    def create(self, session: Session, obj_in: CreateSchemaType) -> ModelType:
        """Создание новой записи. Принимает как схему Pydantic, так и словарь."""
        if isinstance(obj_in, dict):
            db_obj = self.model(**obj_in)
        else:
            db_obj = self.model.model_validate(obj_in)
            
        session.add(db_obj)
        session.flush() # Отправляем запрос, но не коммитим (задача UnitOfWork)
        return db_obj

    def update(
        self, 
        session: Session, 
        db_obj: ModelType, 
        obj_in: UpdateSchemaType
    ) -> ModelType:
        """Обновление записи через sqlmodel_update (быстрее и чище)."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        # SQLModel умеет эффективно обновлять поля из словаря
        db_obj.sqlmodel_update(update_data)
        
        session.add(db_obj)
        session.flush()
        return db_obj

    def delete(self, session: Session, id: Any) -> bool:
        """Удаление записи. Возвращает True, если объект был найден и удален."""
        db_obj = self.get(session, id)
        if not db_obj:
            return False
            
        session.delete(db_obj)
        session.flush()
        return True
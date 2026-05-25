from sqlmodel import Session
from loguru import logger # Если используешь стандартный logging, замени на import logging

class UnitOfWork:
    """
    Паттерн Unit of Work для управления транзакциями БД.
    Гарантирует, что все операции внутри блока with будут либо
    сохранены вместе, либо отменены (Rollback) при ошибке.
    """
    def __init__(self, session: Session):
        self.session = session

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, traceback):
        if exc_type is not None:
            # Если произошла ошибка (Exception), откатываем изменения
            self.session.rollback()
            logger.error(f"Transaction rollback due to: {exc_val}")
        else:
            # Если всё прошло успешно, фиксируем изменения в БД
            try:
                self.session.commit()
            except Exception as e:
                self.session.rollback()
                logger.error(f"Failed to commit transaction: {e}")
                raise e
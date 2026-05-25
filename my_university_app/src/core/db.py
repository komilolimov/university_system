from sqlmodel import create_engine
from src.core.config import settings

# Создаем движок, используя URL из конфига
# pool_pre_ping=True поможет избежать ошибок "заснувшего" соединения
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
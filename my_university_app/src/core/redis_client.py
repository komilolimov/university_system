import redis
from src.core.config import settings

token_blocklist = redis.from_url(settings.REDIS_URL, decode_responses=True)
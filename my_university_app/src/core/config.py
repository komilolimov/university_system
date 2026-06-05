from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "University API"
    VERSION: str = "3.0.0"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "university_db"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@db:5432/university_db"
    
    REDIS_URL: str = "redis://redis:6379/0"
    
    MINIO_ENDPOINT_URL: str = "http://minio:9000"
    MINIO_ACCESS_KEY: str = "admin"
    MINIO_SECRET_KEY: str = "adminpassword"
    MINIO_BUCKET_NAME: str = "university-documents"
    
    PRIVATE_KEY_PATH: str = "certs/private.pem"
    PUBLIC_KEY_PATH: str = "certs/public.pem"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "RS256"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
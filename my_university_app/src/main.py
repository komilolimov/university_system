from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError  

from src.api.v1.api import api_router
from src.core.config import settings
from src.core.exceptions import (
    EntityNotFoundError, 
    InvalidCredentialsError, 
    DuplicateEnrollmentError, 
    CapacityExceededError
)

app = FastAPI(
    title="University System API",
    description="Fullstack University Management System",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "University System API v3 is running. Navigate to /docs"}

# --- ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ ОШИБОК ---

@app.exception_handler(EntityNotFoundError)
async def not_found_exception_handler(request: Request, exc: EntityNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )

@app.exception_handler(InvalidCredentialsError)
async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Неверный email или пароль"},
    )

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    print(f"⚠️ DATABASE INTEGRITY ERROR: {exc.orig}")
    # Ловит попытки создать дубликаты (если нет кастомной валидации) или нарушения ключей в БД
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Нарушение уникальности или конфликт данных в базе (Integrity Error)."},
    )

@app.exception_handler(CapacityExceededError)
async def capacity_exception_handler(request: Request, exc: CapacityExceededError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT, # 409 Conflict идеально подходит для нехватки мест
        content={"detail": str(exc)},
    )

@app.exception_handler(DuplicateEnrollmentError)
async def duplicate_enrollment_handler(request: Request, exc: DuplicateEnrollmentError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )
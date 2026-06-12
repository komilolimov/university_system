from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

# ИСПРАВЛЕНО: Заменили RequireRole на RequirePermission
from src.api.deps import get_session, get_current_user, RequirePermission
from src.services.courses import course_catalog_service, course_offering_service, enrollment_service
from src.models.course import (
    CourseCatalogRead, CourseCatalogCreate, CourseCatalogUpdate,
    CourseOfferingRead, CourseOfferingCreate, CourseOfferingUpdate,
    EnrollmentRead, EnrollmentCreate, EnrollmentUpdate,
)
from src.models.enums import EnrollmentStatus

# Удобные алиасы для базовых зависимостей
SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]

# ==========================================
# 📚 COURSE CATALOG ROUTER
# ==========================================
course_catalog_router = APIRouter(prefix="/course-catalog", tags=["Course Catalog"])

@course_catalog_router.get("/", response_model=List[CourseCatalogRead])
def get_course_catalog_entries(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    q: Optional[str] = Query(None, description="Search by title, code"),
    department_id: Optional[int] = Query(None),
    credits: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=10000)
):
    return course_catalog_service.get_all(
        session=session, q=q, department_id=department_id, credits=credits, is_active=is_active, skip=skip, limit=limit
    )

@course_catalog_router.get("/{catalog_id}", response_model=CourseCatalogRead)
def get_course_catalog_entry(catalog_id: int, session: SessionDep, current_user: CurrentUserDep):
    return course_catalog_service.get(session=session, id=catalog_id)

# ИСПРАВЛЕНО: Добавлено право courses:write
@course_catalog_router.post("/", response_model=CourseCatalogRead, dependencies=[Depends(RequirePermission(["courses:write"]))])
def create_course_catalog_entry(obj_in: CourseCatalogCreate, session: SessionDep):
    return course_catalog_service.create(session=session, obj_in=obj_in)

# ИСПРАВЛЕНО: Добавлено право courses:write
@course_catalog_router.put("/{catalog_id}", response_model=CourseCatalogRead, dependencies=[Depends(RequirePermission(["courses:write"]))])
def update_course_catalog_entry(catalog_id: int, obj_in: CourseCatalogUpdate, session: SessionDep):
    return course_catalog_service.update(session=session, id=catalog_id, obj_in=obj_in)

# ИСПРАВЛЕНО: Добавлено право courses:delete
@course_catalog_router.delete("/{catalog_id}", dependencies=[Depends(RequirePermission(["courses:delete"]))])
def delete_course_catalog_entry(catalog_id: int, session: SessionDep):
    return course_catalog_service.delete(session=session, id=catalog_id)


# ==========================================
# 🏫 COURSE OFFERINGS ROUTER
# ==========================================
course_offering_router = APIRouter(prefix="/course-offerings", tags=["Course Offerings"])

@course_offering_router.get("/", response_model=List[CourseOfferingRead])
def get_course_offerings(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    term_id: Optional[int] = Query(None),
    catalog_id: Optional[int] = Query(None),
    primary_instructor_id: Optional[int] = Query(None),
    room_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=10000),
    is_active: Optional[bool] = Query(None),
):
    return course_offering_service.get_all(
        session=session, term_id=term_id, catalog_id=catalog_id, primary_instructor_id=primary_instructor_id, room_id=room_id, skip=skip, limit=limit, is_active=is_active
    )

@course_offering_router.get("/{offering_id}", response_model=CourseOfferingRead)
def get_course_offering(offering_id: int, session: SessionDep, current_user: CurrentUserDep):
    return course_offering_service.get(session=session, id=offering_id)

# ИСПРАВЛЕНО: Добавлено право offerings:write
@course_offering_router.post("/", response_model=CourseOfferingRead, dependencies=[Depends(RequirePermission(["offerings:write"]))])
def create_course_offering(obj_in: CourseOfferingCreate, session: SessionDep):
    return course_offering_service.create(session=session, obj_in=obj_in)

# ИСПРАВЛЕНО: Добавлено право offerings:write
@course_offering_router.put("/{offering_id}", response_model=CourseOfferingRead, dependencies=[Depends(RequirePermission(["offerings:write"]))])
def update_course_offering(offering_id: int, obj_in: CourseOfferingUpdate, session: SessionDep):
    return course_offering_service.update(session=session, id=offering_id, obj_in=obj_in)

# ИСПРАВЛЕНО: Добавлено право offerings:delete
@course_offering_router.delete("/{offering_id}", dependencies=[Depends(RequirePermission(["offerings:delete"]))])
def delete_course_offering(offering_id: int, session: SessionDep):
    return course_offering_service.delete(session=session, id=offering_id)


# ==========================================
# 📝 ENROLLMENTS ROUTER
# ==========================================
enrollment_router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@enrollment_router.get("/", response_model=List[EnrollmentRead])
def get_enrollments(
    session: SessionDep, 
    current_user: CurrentUserDep, 
    student_id: Optional[int] = Query(None),
    offering_id: Optional[int] = Query(None),
    status: Optional[EnrollmentStatus] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=10000)
):
    return enrollment_service.get_all(
        session=session, student_id=student_id, offering_id=offering_id, status=status, skip=skip, limit=limit
    )

@enrollment_router.get("/{student_id}/{offering_id}", response_model=EnrollmentRead)
def get_enrollment(student_id: int, offering_id: int, session: SessionDep, current_user: CurrentUserDep):
    return enrollment_service.get(session=session, student_id=student_id, offering_id=offering_id)

# ИСПРАВЛЕНО: Добавлено право enrollments:write
@enrollment_router.post("/", response_model=EnrollmentRead, dependencies=[Depends(RequirePermission(["enrollments:write"]))])
def create_enrollment(obj_in: EnrollmentCreate, session: SessionDep, current_user: CurrentUserDep):
    return enrollment_service.register_student(
        session=session, 
        student_id=obj_in.student_id, 
        offering_id=obj_in.offering_id
    )

# ИСПРАВЛЕНО: Добавлено право enrollments:write
@enrollment_router.put("/{student_id}/{offering_id}", response_model=EnrollmentRead, dependencies=[Depends(RequirePermission(["enrollments:write"]))])
def update_enrollment(student_id: int, offering_id: int, obj_in: EnrollmentUpdate, session: SessionDep):
    return enrollment_service.update(session=session, student_id=student_id, offering_id=offering_id, obj_in=obj_in)

# ИСПРАВЛЕНО: Добавлено право enrollments:delete
@enrollment_router.delete("/{student_id}/{offering_id}", dependencies=[Depends(RequirePermission(["enrollments:delete"]))])
def delete_enrollment(student_id: int, offering_id: int, session: SessionDep):
    return enrollment_service.delete(session=session, student_id=student_id, offering_id=offering_id)

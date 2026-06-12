from src.core.uow import UnitOfWork
from sqlmodel import Session, select, func
from typing import List, Optional
from sqlalchemy import or_
from src.core.exceptions import EntityNotFoundError, CapacityExceededError, DuplicateEnrollmentError
from src.repositories.courses import course_catalog_repository, course_offering_repository, enrollment_repository
from src.models.course import (
    CourseCatalog, CourseCatalogCreate, CourseCatalogUpdate,
    CourseOffering, CourseOfferingCreate, CourseOfferingUpdate,
    Enrollment, EnrollmentCreate, EnrollmentUpdate,
)
from src.models.enums import EnrollmentStatus


class CourseCatalogService:
    def get_all(
        self, 
        session: Session, 
        q: Optional[str] = None,
        department_id: Optional[int] = None,
        credits: Optional[int] = None,
        is_active: Optional[bool] = True, # По умолчанию отдаем только активные курсы
        skip: int = 0, 
        limit: int = 100
    ) -> List[CourseCatalog]:
        statement = select(CourseCatalog)
        if q:
            statement = statement.where(
                or_(
                    CourseCatalog.title.ilike(f"%{q}%"),
                    CourseCatalog.code.ilike(f"%{q}%")
                )
            )
        if department_id is not None:
            statement = statement.where(CourseCatalog.department_id == department_id)
        if credits is not None:
            statement = statement.where(CourseCatalog.credits == credits)
        if is_active is not None:
            statement = statement.where(CourseCatalog.is_active == is_active)
        
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get(self, session: Session, id: int) -> CourseCatalog:
        obj = course_catalog_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("CourseCatalog", id)
        return obj

    def create(self, session: Session, obj_in: CourseCatalogCreate) -> CourseCatalog:
        with UnitOfWork(session):
            return course_catalog_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: CourseCatalogUpdate) -> CourseCatalog:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return course_catalog_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            # Soft delete: переводим в неактивный статус вместо удаления из БД
            course_catalog_repository.update(session=session, db_obj=db_obj, obj_in={"is_active": False})
            return {"Success": "Course catalog entry archived (Soft Deleted)"}


class CourseOfferingService:
    def get_all(
        self, 
        session: Session, 
        term_id: Optional[int] = None,
        catalog_id: Optional[int] = None,
        primary_instructor_id: Optional[int] = None,
        room_id: Optional[int] = None,
        is_active: Optional[bool] = True, # По умолчанию отдаем только активные
        skip: int = 0, 
        limit: int = 100
    ) -> List[CourseOffering]:
        statement = select(CourseOffering)
        if term_id is not None:
            statement = statement.where(CourseOffering.term_id == term_id)
        if catalog_id is not None:
            statement = statement.where(CourseOffering.catalog_id == catalog_id)
        if primary_instructor_id is not None:
            statement = statement.where(CourseOffering.primary_instructor_id == primary_instructor_id)
        if room_id is not None:
            statement = statement.where(CourseOffering.room_id == room_id)
        if is_active is not None:
            statement = statement.where(CourseOffering.is_active == is_active)
            
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get(self, session: Session, id: int) -> CourseOffering:
        obj = course_offering_repository.get(session=session, id=id)
        if not obj:
            raise EntityNotFoundError("CourseOffering", id)
        return obj

    def create(self, session: Session, obj_in: CourseOfferingCreate) -> CourseOffering:
        with UnitOfWork(session):
            return course_offering_repository.create(session=session, obj_in=obj_in)

    def update(self, session: Session, id: int, obj_in: CourseOfferingUpdate) -> CourseOffering:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            return course_offering_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, id=id)
            # Soft delete
            course_offering_repository.update(session=session, db_obj=db_obj, obj_in={"is_active": False})
            return {"Success": "Course offering archived (Soft Deleted)"}


class EnrollmentService:
    def get_all(
        self, 
        session: Session, 
        student_id: Optional[int] = None,
        offering_id: Optional[int] = None,
        status: Optional[EnrollmentStatus] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Enrollment]:
        statement = select(Enrollment)
        if student_id is not None:
            statement = statement.where(Enrollment.student_id == student_id)
        if offering_id is not None:
            statement = statement.where(Enrollment.offering_id == offering_id)
        if status is not None:
            statement = statement.where(Enrollment.status == status)
            
        statement = statement.offset(skip).limit(limit)
        return session.exec(statement).all()

    def get(self, session: Session, student_id: int, offering_id: int) -> Enrollment:
        obj = enrollment_repository.get(
            session=session, 
            student_id=student_id, 
            offering_id=offering_id
        )
        if not obj:
            raise EntityNotFoundError("Enrollment", f"{student_id}-{offering_id}")
        return obj

    def update(self, session: Session, student_id: int, offering_id: int, obj_in: EnrollmentUpdate) -> Enrollment:
        with UnitOfWork(session):
            db_obj = self.get(session=session, student_id=student_id, offering_id=offering_id)
            return enrollment_repository.update(session=session, db_obj=db_obj, obj_in=obj_in)

    def delete(self, session: Session, student_id: int, offering_id: int) -> dict:
        with UnitOfWork(session):
            db_obj = self.get(session=session, student_id=student_id, offering_id=offering_id)
            
            # 1. Проверка идемпотентности: если уже отменен, ничего не делаем
            if db_obj.status == EnrollmentStatus.Dropped:
                return {"Success": "Enrollment is already cancelled."}
            
            # 2. Формируем данные для обновления (Soft Delete)
            # Если твой репозиторий принимает словари:
            update_data = {
                "status": EnrollmentStatus.Dropped,
                "grade": None,            # Очищаем оценку
                "credits_earned": None    # Очищаем кредиты
            }
            
            # Если репозиторий требует строго EnrollmentUpdate:
            # update_data = EnrollmentUpdate(status=EnrollmentStatus.Dropped, grade=None, credits_earned=None)
            
            enrollment_repository.update(
                session=session, 
                db_obj=db_obj, 
                obj_in=update_data
            )
            
            return {"Success": "Enrollment cancelled (Soft Deleted)"}

    def register_student(self, session: Session, student_id: int, offering_id: int) -> Enrollment:
        with UnitOfWork(session) as uow:
            
            # 1. БЛОКИРОВКА (FOR UPDATE)
            offering = session.exec(
                select(CourseOffering)
                .where(CourseOffering.id == offering_id)
                .with_for_update() 
            ).one_or_none()

            if not offering:
                raise EntityNotFoundError("CourseOffering", offering_id)

            # Проверка: нельзя записаться на удаленный (архивный) курс
            if not getattr(offering, "is_active", True):
                raise ValueError("Cannot enroll in an inactive course offering")

            # 2. Проверка дубликатов или восстановление (Soft Undelete)
            existing_enrollment = session.exec(
                select(Enrollment)
                .where(Enrollment.student_id == student_id)
                .where(Enrollment.offering_id == offering_id)
            ).one_or_none()

            if existing_enrollment:
                # Если студент был "мягко удален" (Dropped), восстанавливаем его запись
                if existing_enrollment.status != EnrollmentStatus.Enrolled:
                    return enrollment_repository.update(
                        session=session, 
                        db_obj=existing_enrollment, 
                        obj_in={"status": EnrollmentStatus.Enrolled}
                    )
                # Если статус и так Enrolled, бросаем ошибку дубликата
                raise DuplicateEnrollmentError(student_id=student_id, course_id=offering_id)

            # 3. Проверка мест (считаем только тех, кто реально записан)
            current_count = session.exec(
                select(func.count())
                .select_from(Enrollment)
                .where(Enrollment.offering_id == offering_id)
                .where(Enrollment.status == EnrollmentStatus.Enrolled)
            ).one()

            if current_count >= offering.max_capacity:
                raise CapacityExceededError(course_id=offering_id)

            # 4. Все проверки пройдены! Создаем запись
            new_enrollment = Enrollment(
                student_id=student_id,
                offering_id=offering_id,
                status=EnrollmentStatus.Enrolled
            )
            
            session.add(new_enrollment)
            session.flush() 
            
            return new_enrollment

course_catalog_service = CourseCatalogService()
course_offering_service = CourseOfferingService()
enrollment_service = EnrollmentService()
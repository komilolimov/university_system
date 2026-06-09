from typing import List, Optional
from sqlmodel import Session, select
from src.repositories.base import BaseRepository
from src.models import CourseCatalog, CourseOffering, Enrollment

class CourseCatalogRepository(BaseRepository[CourseCatalog]):
    def __init__(self):
        super().__init__(CourseCatalog)

class CourseOfferingRepository(BaseRepository[CourseOffering]):
    def __init__(self):
        super().__init__(CourseOffering)

class EnrollmentRepository(BaseRepository[Enrollment]):
    def __init__(self):
        super().__init__(Enrollment)

    def get(self, session: Session, student_id: int, offering_id: int) -> Optional[Enrollment]:
        return session.get(Enrollment, (student_id, offering_id))

    def delete(self, session: Session, student_id: int, offering_id: int) -> bool:
        obj = self.get(session, student_id, offering_id)
        if obj:
            session.delete(obj)
            session.flush()
            return True
        return False

course_catalog_repository = CourseCatalogRepository()
course_offering_repository = CourseOfferingRepository()
enrollment_repository = EnrollmentRepository()
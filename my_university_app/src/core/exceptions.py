class UniversityBaseException(Exception):
    """Базовый класс для всех доменных ошибок нашего приложения"""
    pass

class EntityNotFoundError(UniversityBaseException):
    def __init__(self, entity_name: str, entity_id: int | str = None):
        self.entity_name = entity_name
        self.entity_id = entity_id
        self.message = f"{entity_name} with id {entity_id} not found" if entity_id else f"{entity_name} not found"
        super().__init__(self.message)

class CapacityExceededError(UniversityBaseException):
    def __init__(self, course_id: int):
        self.message = f"Course {course_id} has reached its maximum capacity."
        super().__init__(self.message)

class DuplicateEnrollmentError(UniversityBaseException):
    def __init__(self, student_id: int, course_id: int):
        self.message = f"Student {student_id} is already enrolled in course {course_id}."
        super().__init__(self.message)

class InvalidCredentialsError(UniversityBaseException):
    def __init__(self):
        self.message = "Incorrect email or password"
        super().__init__(self.message)
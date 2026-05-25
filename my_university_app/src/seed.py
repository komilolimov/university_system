import random
from datetime import date, timedelta
from decimal import Decimal
from sqlmodel import Session, select
from passlib.context import CryptContext
from faker import Faker

from src.core.db import engine
from src.models import (
    School, Department, ResearchLab, 
    Building, Room, Role, Employee, EmployeeExperience, 
    Student, AcademicTerm, DegreeProgram, ProgramRequirement, 
    CourseCatalog, CourseOffering, Enrollment, StudentProgram
)
from src.models.enums import ProgramType, EnrollmentStatus, RoomType, RegionType

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Настраиваем Faker на Италию для аутентичности Университета Мессины!
fake = Faker('it_IT')

def get_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_data():
    with Session(engine) as session:
        if session.exec(select(School)).first():
            print("База данных уже содержит данные. Очистите базу перед масштабным сидингом.")
            return

        print("Начинаю МАСШТАБНОЕ заполнение базы данных (University of Messina)...")
        print("Генерирую хэш пароля (это займет пару секунд)...")
        # Генерируем один хэш для всех массовых пользователей, чтобы скрипт не работал полчаса
        bulk_password_hash = get_hash("password123")

        # ==========================================
        # УРОВЕНЬ 0
        # ==========================================
        print("-> Уровень 0: Школы, Здания, Роли, Семестры...")
        schools = [School(name=f"School of {fake.unique.job()}") for _ in range(5)]
        buildings = [Building(code=f"BLDG-{i}", name=fake.company()) for i in range(10)]
        
        role_admin = Role(title="Administrator", is_faculty=False)
        role_prof = Role(title="Professor", is_faculty=True)
        
        terms = [
            AcademicTerm(name="Fall 2025", start_date=date(2025, 9, 1), end_date=date(2025, 12, 20)),
            AcademicTerm(name="Spring 2026", start_date=date(2026, 2, 1), end_date=date(2026, 5, 30)),
            AcademicTerm(name="Fall 2026", start_date=date(2026, 9, 1), end_date=date(2026, 12, 20))
        ]
        
        session.add_all(schools + buildings + [role_admin, role_prof] + terms)
        session.commit()

        # ==========================================
        # УРОВЕНЬ 1
        # ==========================================
        print("-> Уровень 1: Кафедры, Аудитории...")
        departments = []
        for school in schools:
            for _ in range(4): # По 4 кафедры на школу (всего 20)
                dept = Department(name=f"Department of {fake.unique.bs().title()}", school_id=school.id)
                departments.append(dept)
        
        rooms = []
        for building in buildings:
            for i in range(10): # По 10 аудиторий в здании (всего 100)
                room = Room(room_number=f"{building.code}-{i}00", capacity=random.choice([20, 50, 100, 200]), 
                            type=random.choice(list(RoomType)), building_id=building.id)
                rooms.append(room)

        session.add_all(departments + rooms)
        session.commit()

        # ==========================================
        # УРОВЕНЬ 2
        # ==========================================
        print("-> Уровень 2: Сотрудники (100), Программы (50), Каталог курсов (200)...")
        employees = []
        # Наши хардкодные пользователи
        admin_user = Employee(first_name="Admin", last_name="User", email="admin@unime.it", role_id=role_admin.id, department_id=departments[0].id, hire_date=date(2020, 1, 1), hashed_password=get_hash("admin123"))
        prof_turing = Employee(first_name="Alan", last_name="Turing", email="alan.turing@unime.it", role_id=role_prof.id, department_id=departments[0].id, hire_date=date(2022, 5, 10), hashed_password=get_hash("prof123"))
        employees.extend([admin_user, prof_turing])

        # Массовка преподавателей
        for _ in range(98):
            emp = Employee(
                first_name=fake.first_name(), last_name=fake.last_name(),
                email=fake.unique.company_email(), role_id=role_prof.id,
                department_id=random.choice(departments).id, office_room_id=random.choice(rooms).id,
                region=random.choice(list(RegionType)), hire_date=fake.date_between(start_date='-10y', end_date='today'),
                hashed_password=bulk_password_hash
            )
            employees.append(emp)

        programs = [DegreeProgram(title=f"{random.choice(['B.S.', 'M.S.', 'Ph.D.'])} in {fake.job()}", degree_level=random.choice(["Bachelor", "Master", "PhD"]), total_credits_required=random.choice([120, 60, 90]), department_id=random.choice(departments).id) for _ in range(50)]
        catalog = [CourseCatalog(code=f"CRS-{fake.unique.random_int(min=1000, max=9999)}", title=fake.catch_phrase(), credits=random.choice([3, 4, 6]), department_id=random.choice(departments).id) for _ in range(200)]
        
        session.add_all(employees + programs + catalog)
        session.commit()

        # ==========================================
        # УРОВЕНЬ 3
        # ==========================================
        print("-> Уровень 3: Студенты (500), Предложения курсов (300)...")
        students = []
        student_ivan = Student(first_name="Ivan", last_name="Ivanov", email="student@unime.it", region=RegionType.Non_EU, enrollment_date=date(2026, 9, 1), advisor_id=prof_turing.id, hashed_password=get_hash("student123"))
        students.append(student_ivan)

        for _ in range(499):
            student = Student(
                first_name=fake.first_name(), last_name=fake.last_name(),
                email=fake.unique.ascii_safe_email(), region=random.choice(list(RegionType)),
                enrollment_date=fake.date_between(start_date='-4y', end_date='today'),
                advisor_id=random.choice(employees).id, hashed_password=bulk_password_hash
            )
            students.append(student)

        offerings = []
        for _ in range(300):
            offering = CourseOffering(
                max_capacity=random.choice([30, 50, 100]), catalog_id=random.choice(catalog).id,
                term_id=random.choice(terms).id, primary_instructor_id=random.choice(employees).id,
                room_id=random.choice(rooms).id
            )
            offerings.append(offering)

        session.add_all(students + offerings)
        session.commit()

        # ==========================================
        # УРОВЕНЬ 4
        # ==========================================
        print("-> Уровень 4: Зачисления (Enrollments) и Программы студентов...")
        enrollments = []
        student_programs = []

        # Каждому студенту даем программу и записываем на 3 случайных курса
        for student in students:
            # Программа
            sp = StudentProgram(student_id=student.id, program_id=random.choice(programs).id, type=ProgramType.Primary_Major, declared_date=student.enrollment_date)
            student_programs.append(sp)
            
            # Курсы (выбираем 3 уникальных)
            student_offerings = random.sample(offerings, 3)
            for off in student_offerings:
                status = random.choice(list(EnrollmentStatus))
                grade = Decimal(str(round(random.uniform(2.0, 4.0), 2))) if status == EnrollmentStatus.Completed else None
                enr = Enrollment(student_id=student.id, offering_id=off.id, status=status, grade=grade)
                enrollments.append(enr)

        session.add_all(enrollments + student_programs)
        session.commit()

        print("\n✅ УНИВЕРСИТЕТ УСПЕШНО СГЕНЕРИРОВАН!")
        print(f"Добавлено: 5 Школ, 20 Кафедр, 100 Аудиторий, 100 Преподавателей, 500 Студентов, ~1500 Зачислений.")
        print("=========================================")
        print("Хардкодные доступы работают как раньше:")
        print(f"Админ:   admin@unime.it   | admin123")
        print(f"Студент: student@unime.it | student123")
        print("Остальные 499 студентов имеют пароль: password123")
        print("=========================================\n")

if __name__ == "__main__":
    seed_data()
import random
from datetime import date
from decimal import Decimal
from sqlmodel import Session, select
from passlib.context import CryptContext
from faker import Faker

from src.core.db import engine
from src.models import (
    School, Department, Building, Room, Role, Employee, 
    Student, AcademicTerm, DegreeProgram, CourseCatalog, CourseOffering, 
    Enrollment, StudentProgram, Permission, RolePermissionLink
)
from src.models.enums import ProgramType, EnrollmentStatus, RoomType, RegionType

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
        bulk_password_hash = get_hash("password123")

        # ==========================================
        # УРОВЕНЬ 0: Базовые роли
        # ==========================================
        print("-> Уровень 0: Роли...")
        role_admin = Role(title="Administrator", is_faculty=False)
        role_prof = Role(title="Professor", is_faculty=True)
        role_advisor = Role(title="Academic Advisor", is_faculty=False)
        role_student = Role(title="Student", is_faculty=False)
        
        session.add_all([role_admin, role_prof, role_advisor, role_student])
        session.commit()

        # ==========================================
        # УРОВЕНЬ 0.5: Разрешения (Permissions) и Матрица
        # ==========================================
        print("-> Уровень 0.5: Разрешения (Permissions)...")
        
        all_permissions = [
            "roles:read", "roles:write", "roles:delete",
            "permissions:read", "permissions:assign", "permissions:write", "permissions:delete",
            "schools:read", "schools:write", "schools:delete",
            "departments:read", "departments:write", "departments:delete",
            "buildings:read", "buildings:write", "buildings:delete",
            "rooms:read", "rooms:write", "rooms:delete",
            "employees:read", "employees:write", "employees:delete",
            "students:read", "students:write", "students:delete",
            "academic_terms:read", "academic_terms:write", "academic_terms:delete",
            "degree_programs:read", "degree_programs:write", "degree_programs:delete",
            "course_catalog:read", "course_catalog:write", "course_catalog:delete",
            "course_offerings:read", "course_offerings:write", "course_offerings:delete",
            "enrollments:read", "enrollments:write", "enrollments:delete",
            "student_programs:read", "student_programs:write", "student_programs:delete",
            "documents:read", "documents:write", "documents:delete",
            "research_labs:read", "research_labs:write", "research_labs:delete",
            "program_requirements:read", "program_requirements:write", "program_requirements:delete",
            "employee_experience:read", "employee_experience:write"
        ]

        # Создаем сущности Permission
        permission_objects = {
            perm_name: Permission(name=perm_name, description=f"Allows {perm_name}")
            for perm_name in all_permissions
        }
        session.add_all(permission_objects.values())
        session.commit() # Сохраняем, чтобы получить ID

        # Формируем матрицу доступов
        matrix = [
            (role_admin, all_permissions),  # Admin получает все
            (role_prof, [
                "enrollments:read", "enrollments:write",
                "course_offerings:read",
                "students:read",
                "course_catalog:read", "degree_programs:read",
                "schools:read", "departments:read", "buildings:read", "rooms:read",
                "academic_terms:read"
            ]),
            (role_advisor, [
                "students:read", "students:write",
                "student_programs:read", "student_programs:write",
                "enrollments:read", "enrollments:write",
                "course_catalog:read", "degree_programs:read",
                "course_offerings:read",
                "schools:read", "departments:read",
                "academic_terms:read"
            ]),
            (role_student, [
                "enrollments:read",
                "student_programs:read",
                "course_catalog:read", "degree_programs:read",
                "course_offerings:read",
                "schools:read", "departments:read", "buildings:read", "rooms:read",
                "academic_terms:read"
            ])
        ]

        # Привязываем права
        role_permission_links = []
        for role, perm_names in matrix:
            for perm_name in perm_names:
                p_obj = permission_objects[perm_name]
                role_permission_links.append(
                    RolePermissionLink(role_id=role.id, permission_id=p_obj.id)
                )
        session.add_all(role_permission_links)
        session.commit()

        # ==========================================
        # УРОВЕНЬ 1: Школы, Здания, Семестры, Кафедры, Аудитории
        # ==========================================
        print("-> Уровень 1: Школы, Здания, Семестры, Кафедры, Аудитории...")
        schools = [School(name=f"School of {fake.unique.job()}") for _ in range(5)]
        buildings = [Building(code=f"BLDG-{i}", name=fake.company()) for i in range(10)]
        terms = [
            AcademicTerm(name="Fall 2025", start_date=date(2025, 9, 1), end_date=date(2025, 12, 20)),
            AcademicTerm(name="Spring 2026", start_date=date(2026, 2, 1), end_date=date(2026, 5, 30)),
            AcademicTerm(name="Fall 2026", start_date=date(2026, 9, 1), end_date=date(2026, 12, 20))
        ]
        session.add_all(schools + buildings + terms)
        session.commit()

        departments = []
        for school in schools:
            for _ in range(4):
                dept = Department(name=f"Department of {fake.unique.bs().title()}", school_id=school.id)
                departments.append(dept)
        
        rooms = []
        for building in buildings:
            for i in range(10):
                room = Room(room_number=f"{building.code}-{i}00", capacity=random.choice([20, 50, 100, 200]), 
                            type=random.choice(list(RoomType)), building_id=building.id)
                rooms.append(room)

        session.add_all(departments + rooms)
        session.commit()

        # ==========================================
        # УРОВЕНЬ 2: Сотрудники, Программы, Каталог курсов
        # ==========================================
        print("-> Уровень 2: Сотрудники (100), Программы (50), Каталог курсов (200)...")
        employees = []
        admin_user = Employee(first_name="Admin", last_name="User", email="admin@unime.it", role_id=role_admin.id, department_id=departments[0].id, hire_date=date(2020, 1, 1), hashed_password=get_hash("admin123"))
        prof_turing = Employee(first_name="Alan", last_name="Turing", email="alan.turing@unime.it", role_id=role_prof.id, department_id=departments[0].id, hire_date=date(2022, 5, 10), hashed_password=get_hash("prof123"))
        advisor_user = Employee(first_name="Jane", last_name="Advisor", email="advisor@unime.it", role_id=role_advisor.id, department_id=departments[0].id, hire_date=date(2021, 3, 15), hashed_password=get_hash("advisor123"))
        employees.extend([admin_user, prof_turing, advisor_user])

        for _ in range(97):
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
        # УРОВЕНЬ 3: Студенты (500), Предложения курсов (300)
        # ==========================================
        print("-> Уровень 3: Студенты (500), Предложения курсов (300)...")
        students = []
        student_ivan = Student(first_name="Ivan", last_name="Ivanov", email="student@unime.it", region=RegionType.Non_EU, enrollment_date=date(2026, 9, 1), advisor_id=advisor_user.id, hashed_password=get_hash("student123"))
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
        # УРОВЕНЬ 4: Зачисления и Программы студентов
        # ==========================================
        print("-> Уровень 4: Зачисления (Enrollments) и Программы студентов...")
        enrollments = []
        student_programs = []

        for student in students:
            sp = StudentProgram(student_id=student.id, program_id=random.choice(programs).id, type=ProgramType.Primary_Major, declared_date=student.enrollment_date)
            student_programs.append(sp)
            
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
        print(f"RBAC: Создана полная Role-Permission Matrix. Разрешения выданы ролям.")
        print("=========================================")
        print("Хардкодные доступы:")
        print(f"Админ:    admin@unime.it       | admin123")
        print(f"Куратор:  advisor@unime.it     | advisor123")
        print(f"Профессор:alan.turing@unime.it | prof123")
        print(f"Студент:  student@unime.it     | student123")
        print("Остальные 499 студентов имеют пароль: password123")
        print("=========================================\n")

if __name__ == "__main__":
    seed_data()
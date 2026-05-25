# University System API

> **FastAPI + SQLModel + PostgreSQL + Redis**  
> Version 3.0.0 — Fullstack University Management System

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
  - [Enum Types](#enum-types)
  - [Tables](#tables)
  - [Foreign Key Graph](#foreign-key-graph)
  - [Initialization Order](#initialization-order)
- [Authentication](#authentication)
- [Seeding the Database](#seeding-the-database)

---

## Tech Stack

| Layer        | Technology                          |
|--------------|--------------------------------------|
| Framework    | FastAPI 0.100+                       |
| ORM          | SQLModel 0.0.14+                     |
| Database     | PostgreSQL (psycopg2-binary)         |
| Migrations   | Alembic 1.12+                        |
| Auth         | PyJWT + passlib[bcrypt]              |
| Cache/Token  | Redis 5.0+                           |
| Server       | Uvicorn (standard)                   |
| Settings     | pydantic-settings                    |

---

## Project Structure

```
my_university_app/
├── alembic/                  # Migration scripts
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/    # Route handlers (auth, students, employees, ...)
│   │       └── api.py        # Unified v1 router
│   ├── core/                 # Config, security utils
│   ├── models/               # SQLModel table definitions
│   │   ├── enums.py
│   │   ├── school.py
│   │   ├── department.py
│   │   ├── room.py
│   │   ├── employee.py
│   │   ├── student.py
│   │   ├── program.py
│   │   └── course.py
│   ├── repositories/         # DB query layer
│   ├── services/             # Business logic layer
│   ├── database.py           # Engine + Session
│   ├── main.py               # App entry point
│   └── seed.py               # Database seeder
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
└── alembic.ini
```

---

## Getting Started

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd my_university_app
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 2. Start services (Docker)

```bash
docker-compose up -d
```

### 3. Apply migrations

```bash
alembic upgrade head
```

### 4. Seed the database

```bash
python -m src.seed
```

### 5. Run the development server

```bash
uvicorn src.main:app --reload
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/university_db
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
```

---

## Database Schema

### Enum Types

#### `RegionType`
| Value      | String      |
|------------|-------------|
| `EU`       | `"EU"`      |
| `Non_EU`   | `"Non-EU"`  |
| `USA`      | `"USA"`     |
| `Domestic` | `"Domestic"`|

#### `RoomType`
| Value          | String          |
|----------------|-----------------|
| `Lecture_Hall` | `"Lecture Hall"`|
| `Seminar_Room` | `"Seminar Room"`|
| `Wet_Lab`      | `"Wet Lab"`     |
| `Computer_Lab` | `"Computer Lab"`|
| `Office`       | `"Office"`      |

#### `ProgramType`
| Value             | String             |
|-------------------|--------------------|
| `Primary_Major`   | `"Primary Major"`  |
| `Secondary_Major` | `"Secondary Major"`|
| `Minor`           | `"Minor"`          |

#### `EnrollmentStatus`
| Value       | String        |
|-------------|---------------|
| `Enrolled`  | `"Enrolled"`  |
| `Waitlisted`| `"Waitlisted"`|
| `Dropped`   | `"Dropped"`   |
| `Completed` | `"Completed"` |

---

### Tables

#### `schools`
| Column | Type          | Constraints        |
|--------|---------------|--------------------|
| `id`   | `int`         | PK, auto-increment |
| `name` | `str`         | NOT NULL, UNIQUE   |

---

#### `buildings`
| Column | Type          | Constraints        |
|--------|---------------|--------------------|
| `id`   | `int`         | PK, auto-increment |
| `code` | `str`         | NOT NULL, UNIQUE   |
| `name` | `str \| None` | OPTIONAL           |

---

#### `roles`
| Column       | Type   | Constraints        |
|--------------|--------|--------------------|
| `id`         | `int`  | PK, auto-increment |
| `title`      | `str`  | NOT NULL, UNIQUE   |
| `is_faculty` | `bool` | NOT NULL, default `False` |

---

#### `academic_terms`
| Column       | Type   | Constraints        |
|--------------|--------|--------------------|
| `id`         | `int`  | PK, auto-increment |
| `name`       | `str`  | NOT NULL, UNIQUE   |
| `start_date` | `date` | NOT NULL           |
| `end_date`   | `date` | NOT NULL           |

---

#### `departments`
| Column      | Type  | Constraints                    |
|-------------|-------|--------------------------------|
| `id`        | `int` | PK, auto-increment             |
| `name`      | `str` | NOT NULL                       |
| `school_id` | `int` | NOT NULL, FK → `schools.id`    |

---

#### `rooms`
| Column        | Type       | Constraints                    |
|---------------|------------|--------------------------------|
| `id`          | `int`      | PK, auto-increment             |
| `room_number` | `str`      | NOT NULL                       |
| `capacity`    | `int`      | NOT NULL                       |
| `type`        | `RoomType` | NOT NULL                       |
| `building_id` | `int`      | NOT NULL, FK → `buildings.id`  |

---

#### `employees`
| Column            | Type           | Constraints                        |
|-------------------|----------------|------------------------------------|
| `id`              | `int`          | PK, auto-increment                 |
| `first_name`      | `str`          | NOT NULL                           |
| `last_name`       | `str`          | NOT NULL                           |
| `email`           | `str`          | NOT NULL, UNIQUE                   |
| `role_id`         | `int`          | NOT NULL, FK → `roles.id`          |
| `department_id`   | `int \| None`  | OPTIONAL, FK → `departments.id`    |
| `office_room_id`  | `int \| None`  | OPTIONAL, FK → `rooms.id`          |
| `region`          | `RegionType`   | NOT NULL, default `Domestic`       |
| `hire_date`       | `date`         | NOT NULL                           |
| `is_active`       | `bool`         | NOT NULL, default `True`           |
| `hashed_password` | `str`          | NOT NULL — bcrypt hash             |

> **Relationship:** `advisees → Student[]` (back_populates `advisor`)

---

#### `research_labs`
| Column          | Type  | Constraints                      |
|-----------------|-------|----------------------------------|
| `id`            | `int` | PK, auto-increment               |
| `name`          | `str` | NOT NULL                         |
| `department_id` | `int` | NOT NULL, FK → `departments.id`  |

---

#### `employee_experience`
| Column         | Type          | Constraints                    |
|----------------|---------------|--------------------------------|
| `id`           | `int`         | PK, auto-increment             |
| `company_name` | `str`         | NOT NULL                       |
| `job_title`    | `str`         | NOT NULL                       |
| `start_date`   | `date`        | NOT NULL                       |
| `end_date`     | `date \| None`| OPTIONAL                       |
| `description`  | `str \| None` | OPTIONAL                       |
| `employee_id`  | `int`         | NOT NULL, FK → `employees.id`  |

---

#### `students`
| Column             | Type           | Constraints                        |
|--------------------|----------------|------------------------------------|
| `id`               | `int`          | PK, auto-increment                 |
| `first_name`       | `str`          | NOT NULL                           |
| `last_name`        | `str`          | NOT NULL                           |
| `email`            | `str`          | NOT NULL, UNIQUE                   |
| `region`           | `RegionType`   | NOT NULL, default `Domestic`       |
| `enrollment_date`  | `date`         | NOT NULL                           |
| `advisor_id`       | `int \| None`  | OPTIONAL, FK → `employees.id`      |
| `graduation_date`  | `date \| None` | OPTIONAL                           |
| `is_active`        | `bool`         | NOT NULL, default `True`           |
| `hashed_password`  | `str`          | NOT NULL — bcrypt hash             |

> **Relationship:** `advisor → Employee` (back_populates `advisees`)

---

#### `degree_programs`
| Column                   | Type  | Constraints                      |
|--------------------------|-------|----------------------------------|
| `id`                     | `int` | PK, auto-increment               |
| `title`                  | `str` | NOT NULL                         |
| `degree_level`           | `str` | NOT NULL (e.g. `Bachelor`)       |
| `total_credits_required` | `int` | NOT NULL                         |
| `department_id`          | `int` | NOT NULL, FK → `departments.id`  |

---

#### `course_catalog`
| Column          | Type          | Constraints                      |
|-----------------|---------------|----------------------------------|
| `id`            | `int`         | PK, auto-increment               |
| `code`          | `str`         | NOT NULL, UNIQUE (e.g. `CS101`)  |
| `title`         | `str`         | NOT NULL                         |
| `credits`       | `int`         | NOT NULL                         |
| `description`   | `str \| None` | OPTIONAL                         |
| `is_active`     | `bool`        | NOT NULL, default `True`         |
| `department_id` | `int`         | NOT NULL, FK → `departments.id`  |

---

#### `course_offerings`
| Column                   | Type          | Constraints                           |
|--------------------------|---------------|---------------------------------------|
| `id`                     | `int`         | PK, auto-increment                    |
| `schedule_blocks`        | `str \| None` | OPTIONAL (e.g. `"MWF 09:00-10:00"`)  |
| `max_capacity`           | `int`         | NOT NULL                              |
| `catalog_id`             | `int`         | NOT NULL, FK → `course_catalog.id`    |
| `term_id`                | `int`         | NOT NULL, FK → `academic_terms.id`    |
| `primary_instructor_id`  | `int`         | NOT NULL, FK → `employees.id`         |
| `room_id`                | `int \| None` | OPTIONAL, FK → `rooms.id`             |

---

#### `program_requirements`
> ⚠️ **Composite PK** — no separate `id` column

| Column                | Type   | Constraints                           |
|-----------------------|--------|---------------------------------------|
| `program_id` (PK)     | `int`  | FK → `degree_programs.id`             |
| `catalog_id` (PK)     | `int`  | FK → `course_catalog.id`              |
| `is_core`             | `bool` | NOT NULL, default `True`              |
| `semester_recommended`| `int \| None` | OPTIONAL                       |

---

#### `enrollments`
> ⚠️ **Composite PK** — no separate `id` column

| Column           | Type              | Constraints                          |
|------------------|-------------------|--------------------------------------|
| `student_id` (PK)| `int`             | FK → `students.id`                   |
| `offering_id` (PK)| `int`            | FK → `course_offerings.id`           |
| `status`         | `EnrollmentStatus`| NOT NULL                             |
| `grade`          | `Decimal \| None` | OPTIONAL (`decimal.Decimal`)         |
| `credits_earned` | `int \| None`     | OPTIONAL                             |

---

#### `student_programs`
> ⚠️ **Composite PK** — no separate `id` column

| Column             | Type          | Constraints                     |
|--------------------|---------------|---------------------------------|
| `student_id` (PK)  | `int`         | FK → `students.id`              |
| `program_id` (PK)  | `int`         | FK → `degree_programs.id`       |
| `type`             | `ProgramType` | NOT NULL                        |
| `declared_date`    | `date`        | NOT NULL                        |

---

### Foreign Key Graph

| Table                | Column                    | References               |
|----------------------|---------------------------|--------------------------|
| `departments`        | `school_id`               | `schools.id`             |
| `research_labs`      | `department_id`           | `departments.id`         |
| `rooms`              | `building_id`             | `buildings.id`           |
| `employees`          | `role_id`                 | `roles.id`               |
| `employees`          | `department_id` (opt)     | `departments.id`         |
| `employees`          | `office_room_id` (opt)    | `rooms.id`               |
| `employee_experience`| `employee_id`             | `employees.id`           |
| `students`           | `advisor_id` (opt)        | `employees.id`           |
| `degree_programs`    | `department_id`           | `departments.id`         |
| `course_catalog`     | `department_id`           | `departments.id`         |
| `course_offerings`   | `catalog_id`              | `course_catalog.id`      |
| `course_offerings`   | `term_id`                 | `academic_terms.id`      |
| `course_offerings`   | `primary_instructor_id`   | `employees.id`           |
| `course_offerings`   | `room_id` (opt)           | `rooms.id`               |
| `program_requirements`| `program_id` (PK)        | `degree_programs.id`     |
| `program_requirements`| `catalog_id` (PK)        | `course_catalog.id`      |
| `enrollments`        | `student_id` (PK)         | `students.id`            |
| `enrollments`        | `offering_id` (PK)        | `course_offerings.id`    |
| `student_programs`   | `student_id` (PK)         | `students.id`            |
| `student_programs`   | `program_id` (PK)         | `degree_programs.id`     |

---

### Initialization Order

Create records in this order to satisfy all foreign key constraints:

```
Level 0 — No dependencies:
  1. schools
  2. buildings
  3. roles
  4. academic_terms

Level 1 — Depend on Level 0:
  5. departments          →  schools
  6. rooms                →  buildings

Level 2 — Depend on Levels 0–1:
  7. employees            →  roles, departments (opt), rooms (opt)
  8. degree_programs      →  departments
  9. course_catalog       →  departments
  10. research_labs       →  departments

Level 3 — Depend on Levels 0–2:
  11. students            →  employees (advisor, opt)
  12. course_offerings    →  course_catalog, academic_terms, employees, rooms (opt)
  13. program_requirements →  degree_programs, course_catalog
  14. employee_experience →  employees

Level 4 — Depend on Level 3:
  15. enrollments         →  students, course_offerings
  16. student_programs    →  students, degree_programs
```

---

## Authentication

The API uses **JWT Bearer tokens** with Redis-based token revocation.

| Endpoint        | Method | Description                  |
|-----------------|--------|------------------------------|
| `/api/v1/login` | POST   | Returns JWT access token     |
| `/api/v1/logout`| POST   | Revokes token (stored in Redis)|

**Login request body:**
```json
{
  "email": "user@example.com",
  "password": "plaintext_password"
}
```

Both `Employee` and `Student` records support login. Passwords are stored as **bcrypt hashes** (`hashed_password` column). Never store plain-text passwords.

---

## Seeding the Database

Run the seed script after applying migrations:

```bash
python -m src.seed
```

**Key rules for `seed.py`:**

1. **Hash passwords** before inserting:
   ```python
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   hashed = pwd_context.hash("plain_password")
   ```

2. **Use Enum members**, not raw strings:
   ```python
   status=EnrollmentStatus.Enrolled   # ✓
   status="Enrolled"                  # ✗
   ```

3. **Use `Decimal`** for grades:
   ```python
   from decimal import Decimal
   grade=Decimal("3.75")
   ```

4. **Flush before referencing auto-generated IDs:**
   ```python
   session.add(school)
   session.flush()        # assigns school.id
   dept = Department(school_id=school.id, ...)
   ```

5. **Composite PK tables** (`enrollments`, `student_programs`, `program_requirements`) have no `id` field — do not set one.
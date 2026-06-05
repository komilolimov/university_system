git add frontend/src/features/student frontend/src/widgets/student
git commit -m "refactor(students): unify activation and soft-delete logic"

git add frontend/src/features/employee frontend/src/widgets/employee
git commit -m "refactor(employees): update ActionCellRenderer and payload for PATCH semantics"

git add frontend/src/features/role frontend/src/widgets/role
git commit -m "refactor(roles): add onActivate context and fix PUT payloads"

git add frontend/src/features/permission frontend/src/widgets/permission
git commit -m "feat(permission): implement permission ui with correct semantics"

git add frontend/src/entities
git commit -m "refactor(entities): enforce type safety and optional fields for partial updates"

git add frontend/src/shared/ui frontend/src/app frontend/src/middleware.ts
git commit -m "refactor(ui): ensure consistent DataGrid and UI patterns"

git add frontend/src/features/auth frontend/src/shared/api frontend/src/shared/lib
git commit -m "refactor(auth): fix missing context handlers and update schema"

git add frontend
git commit -m "refactor(frontend): final code cleanup and ui fixes"

git add my_university_app/src/models
git commit -m "refactor(models): unify soft delete vs is_active toggle across entities"

git add my_university_app/src/services/students.py my_university_app/src/services/employees.py
git commit -m "refactor(services): implement consistent soft-delete and activation logic for users"

git add my_university_app/src/services/roles.py my_university_app/src/services/permission.py my_university_app/src/services/auth.py
git commit -m "refactor(services): update RBAC services to match PUT vs PATCH semantics"

git add my_university_app/src/api/v1/endpoints/students.py my_university_app/src/api/v1/endpoints/employees.py
git commit -m "refactor(api): fix missing fields in user update payloads"

git add my_university_app/src/api/v1/endpoints/roles.py my_university_app/src/api/v1/endpoints/permission.py my_university_app/src/api/v1/endpoints/auth.py my_university_app/src/api/v1/api.py
git commit -m "refactor(api): ensure consistent RBAC update/create/delete endpoints"

git add my_university_app/src/repositories my_university_app/src/core
git commit -m "refactor(core): eliminate duplicated logic and potential runtime bugs"

git add my_university_app/alembic my_university_app/openapi.json my_university_app/requirements.txt my_university_app/skill-creator
git commit -m "chore(db): update migrations and openapi schema for soft-delete logic"

git add -A
git commit -m "chore(deps): update python dependencies and clean up venv"

git push origin HEAD

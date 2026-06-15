git add my_university_app/
git commit -m "feat(backend): update core endpoints, models, and repositories for courses, employees, and terms"

git add -u frontend/src/app/(dashboard)/courses/
git add -u frontend/src/entities/course/
git add -u frontend/src/features/course-registration/
git add -u frontend/src/widgets/course-list/
git add -u frontend/src/widgets/course/
git commit -m "refactor(frontend): remove legacy course components and pages"

git add frontend/src/middleware.ts frontend/src/shared/api/schema.d.ts frontend/src/shared/ui/navigation-link.tsx
git add frontend/src/entities/auth/ frontend/src/features/auth/
git add frontend/src/app/(dashboard)/layout.tsx frontend/src/app/(dashboard)/permissions/page.tsx frontend/src/app/(dashboard)/roles/page.tsx frontend/src/app/(dashboard)/students/page.tsx frontend/src/app/(dashboard)/employees/page.tsx
git add frontend/src/widgets/sidebar/ui/Sidebar.tsx frontend/src/widgets/student/ frontend/src/widgets/employee/ frontend/src/widgets/dev-tools/
git commit -m "feat(frontend): update base layouts, core data grids, auth logic, and sidebar navigation"

git add frontend/
git commit -m "feat(frontend): implement comprehensive CRUD feature modules (buildings, rooms, documents, enrollments, etc.)"

git push origin main

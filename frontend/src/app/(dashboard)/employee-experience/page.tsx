"use client";

import { EmployeeExperienceDataGrid } from "@/widgets/employee-experience";
import { usePermissions } from "@/entities/session";

export default function EmployeeExperiencePage() {
  const { hasPermission } = usePermissions();

  const canWrite = hasPermission("employee_experience:write");
  const canDelete = hasPermission("employee_experience:delete");

  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      {/* Заголовок страницы */}
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Employee Experience
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Manage work history and previous positions for university staff.
          </p>
        </div>
      </header>

      {/* Контейнер для виджета (таблицы) */}
      <div className="flex-1 min-h-[600px] w-full">
        <EmployeeExperienceDataGrid canWrite={canWrite} canDelete={canDelete} />
      </div>
    </main>
  );
}
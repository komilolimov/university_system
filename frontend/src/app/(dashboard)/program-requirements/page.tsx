"use client";

import { ProgramRequirementsDataGrid } from "@/widgets/program-requirement";
import { usePermissions } from "@/entities/session";

export default function ProgramRequirementsPage() {
  const { hasPermission } = usePermissions();

  const canWrite = hasPermission("program_requirements:write");
  const canDelete = hasPermission("program_requirements:delete");

  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Program Requirements
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Manage academic program requirements, including mandatory courses, electives, and credit criteria necessary for graduation.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <ProgramRequirementsDataGrid canWrite={canWrite} canDelete={canDelete} />
      </div>
    </main>
  );
}
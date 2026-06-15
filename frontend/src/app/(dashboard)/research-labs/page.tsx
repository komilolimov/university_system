"use client";

import { ResearchLabsDataGrid } from "@/widgets/research-lab";
import { usePermissions } from "@/entities/session";

export default function ResearchLabsPage() {
  const { hasPermission } = usePermissions();

  const canWrite = hasPermission("research_labs:write");
  const canDelete = hasPermission("research_labs:delete");

  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Research Labs
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Manage research laboratories and innovation centers, supporting
            academic research, collaboration, and scientific advancement across
            the university.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <ResearchLabsDataGrid canWrite={canWrite} canDelete={canDelete} />
      </div>
    </main>
  );
}
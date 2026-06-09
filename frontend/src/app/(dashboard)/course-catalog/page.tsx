import React from "react";
import { Metadata } from "next";
import { CourseCatalogDataGrid } from "@/widgets/course-catalog";

export const metadata: Metadata = {
  title: "Course Catalog | University System",
  description: "Manage university courses and catalog.",
};

export default function CourseCatalogPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Course Catalog Management
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Create, edit, and manage courses offered by the university.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        {/* Если CourseCatalogDataGrid поддерживает пропс canMutate, можешь добавить canMutate={true} */}
        <CourseCatalogDataGrid />
      </div>
    </main>
  );
}
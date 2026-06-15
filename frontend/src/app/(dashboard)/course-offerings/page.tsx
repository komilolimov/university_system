"use client";

import React from "react";
import { CourseOfferingsDataGrid } from "@/widgets/course-offerings";
import { usePermissions } from "@/entities/session";

export default function CourseOfferingsPage() {
  const { hasPermission } = usePermissions();

  const canWrite = hasPermission("course_offerings:write");
  const canDelete = hasPermission("course_offerings:delete");

  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Course Offerings Management
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Create, edit, and schedule offerings across different academic terms.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <CourseOfferingsDataGrid canWrite={canWrite} canDelete={canDelete} />
      </div>
    </main>
  );
}
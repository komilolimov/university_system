import React from "react";
import { RecentActivityFeed } from "@/widgets/dashboard";
import { FacultyClassesList } from "./FacultyClassesList";

export const FacultyDashboard = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          Professor Dashboard
        </h1>
        <p className="text-neutral-500 font-medium">
          Manage your courses, view assigned schedules, and oversee your students.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 flex flex-col gap-8">
          <FacultyClassesList />
        </section>
        <aside className="lg:col-span-1 flex flex-col gap-8">
          <RecentActivityFeed />
        </aside>
      </div>
    </div>
  );
};

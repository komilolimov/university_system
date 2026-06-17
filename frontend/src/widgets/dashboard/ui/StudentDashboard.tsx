import React from "react";
import { StudentProfileOverview } from "@/widgets/student-profile";
import { EnrollmentList } from "@/widgets/my-enrollments";

export const StudentDashboard = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          Student Dashboard
        </h1>
        <p className="text-neutral-500 font-medium">
          Welcome back. Manage your course enrollments and track your progress.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 flex flex-col gap-8">
          <EnrollmentList />
        </section>
        <aside className="lg:col-span-1 flex flex-col gap-8">
          <StudentProfileOverview />
        </aside>
      </div>
    </div>
  );
};

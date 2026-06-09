import { Metadata } from "next";
import { EnrollmentsDataGrid } from "@/widgets/enrollment";

export const metadata: Metadata = {
  title: "Course Enrollments | University System",
  description: "Manage student enrollments, grading, and course progress.",
};

export default function EnrollmentsPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Course Enrollments
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Manage student course enrollments, track academic progress, and update enrollment statuses.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <EnrollmentsDataGrid canMutate={true} />
      </div>
    </main>
  );
}
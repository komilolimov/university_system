import { Metadata } from "next";
import { StudentsDataGrid } from "@/widgets/student";

export const metadata: Metadata = {
  title: "Students | University System",
  description: "Manage student records, enrollment data, and advisor assignments.",
};

export default function StudentsPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Students
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Manage student records, enrollment information, and advisor assignments.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <StudentsDataGrid canMutate={true} />
      </div>
    </main>
  );
}
import { Metadata } from "next";
import { DegreeProgramsDataGrid } from "@/widgets/degree-program";

export const metadata: Metadata = {
  title: "Degree Programs | University System",
  description:
    "Manage academic degree programs and their structure across the university.",
};

export default function DegreeProgramsPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Degree Programs
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Manage academic degree programs, defining the educational pathways
            that guide students from enrollment to graduation.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <DegreeProgramsDataGrid canMutate={true} />
      </div>
    </main>
  );
}
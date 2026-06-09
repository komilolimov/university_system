import { Metadata } from "next";
import { SchoolDataGrid } from "@/widgets/school";

export const metadata: Metadata = {
  title: "Schools | University System",
  description:
    "Oversee the university's academic schools and faculties, maintaining a clear organizational structure across all educational units.",
};

export default function SchoolsPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Schools
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Oversee the university&apos;s academic schools and faculties,
            maintaining a clear organizational structure across all educational
            units.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <SchoolDataGrid canMutate={true} />
      </div>
    </main>
  );
}
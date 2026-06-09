import { Metadata } from "next";
import { ResearchLabsDataGrid } from "@/widgets/research-lab";

export const metadata: Metadata = {
  title: "Research Labs | University System",
  description:
    "Manage research laboratories and innovation centers across the university.",
};

export default function ResearchLabsPage() {
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
        <ResearchLabsDataGrid canMutate={true} />
      </div>
    </main>
  );
}
import React from "react";
import { StudentsDataGrid } from "@/widgets/student";

export default function StudentsPage() {
  return (
    <main className="fsd-container mx-auto my-8 flex flex-col gap-8 px-6 font-sans">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          Student Directory Management
        </h1>
        <p className="text-neutral-500 font-medium">
          Administer, register, and update student profiles with the interactive AG Grid panel.
        </p>
      </header>
      <section className="w-full h-full">
        <StudentsDataGrid />
      </section>
    </main>
  );
}

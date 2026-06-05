import React from "react";
import { Metadata } from "next";
import { RolesDataGrid } from "@/widgets/role";

export const metadata: Metadata = {
  title: "Roles & Access | University System",
  description: "Manage system roles and permissions.",
};

export default function RolesPage() {
  return (
    <main className="fsd-container mx-auto my-8 flex flex-col gap-8 px-6 font-sans">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          Role Management
        </h1>
        <p className="text-neutral-500 font-medium">
          Administer system roles, define faculty status, and manage access levels with the interactive AG Grid panel.
        </p>
      </header>
      <section className="w-full h-full">
        <RolesDataGrid />
      </section>
    </main>
  );
}
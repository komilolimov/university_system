import React from "react";
import { Metadata } from "next";
import { PermissionsManager } from "@/widgets/permission";

export const metadata: Metadata = {
  title: "Permissions | System",
  description: "Manage system permissions and access levels.",
};

export default function PermissionsPage() {
  return (
    <main className="fsd-container mx-auto my-8 flex flex-col gap-8 px-6 font-sans">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          System Permissions
        </h1>
        <p className="text-neutral-500 font-medium">
          Control global system access rights. Activate or deactivate permissions across modules using the matrix.
        </p>
      </header>
      <section className="w-full h-full">
        <PermissionsManager />
      </section>
    </main>
  );
}

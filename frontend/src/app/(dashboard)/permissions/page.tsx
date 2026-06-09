import { Metadata } from "next";
import { PermissionsManager } from "@/widgets/permission";

export const metadata: Metadata = {
  title: "Permissions | System",
  description: "Manage system permissions and access levels.",
};

export default function PermissionsPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            System Permissions
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Control global system access rights. Activate or deactivate permissions across modules using the matrix.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <PermissionsManager />
      </div>
    </main>
  );
}
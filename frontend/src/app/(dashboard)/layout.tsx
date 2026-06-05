import React from "react";
import { Sidebar } from "@/widgets/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen relative">
        {children}
      </main>
    </div>
  );
}

"use client";

import React from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useSidebar } from "./SidebarContext";

interface SidebarLayoutProps {
  children: React.ReactNode;
  payload: {
    role?: string;
    email?: string;
    name?: string;
    [key: string]: any;
  } | null;
}

export const SidebarLayout = ({ children, payload }: SidebarLayoutProps) => {
  const { setMobileOpen, isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent font-sans">
      <Sidebar payload={payload} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-neutral-200 shrink-0">
          <span className="text-sm font-semibold text-neutral-900 tracking-tight">
            University System
          </span>
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-1.5 -mr-1.5 text-neutral-500 hover:text-neutral-900 transition-colors rounded-md hover:bg-neutral-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto h-full p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

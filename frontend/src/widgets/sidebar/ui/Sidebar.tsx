"use client";

import React from "react";
import { GraduationCap, ChevronLeft, ChevronRight, X } from "lucide-react";
import { LogoutButton } from "@/features/auth/logout";
import { SidebarNav } from "./SidebarNav";
import { useSidebar } from "./SidebarContext";

interface SidebarProps {
  payload: {
    role?: string;
    email?: string;
    name?: string;
    [key: string]: any;
  } | null;
}

export const Sidebar = ({ payload }: SidebarProps) => {
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebar();

  const role = payload?.role || "Student";
  const email = payload?.email || "user@unime.it";
  const nameFromPayload = typeof payload?.name === "string" ? payload.name : undefined;
  
  const name =
    nameFromPayload ||
    email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
      
  const initials =
    typeof name === "string" && name.length > 0
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "US";

  // Base classes for the sidebar
  const sidebarClasses = `
    flex flex-col h-screen border-r border-neutral-200 bg-white font-sans shrink-0 select-none
    transition-all duration-300 ease-in-out z-50
  `;

  // On mobile, if the drawer is open, we NEVER want to show the collapsed state.
  const effectiveIsCollapsed = isCollapsed && !isMobileOpen;

  // Desktop widths
  const desktopWidth = effectiveIsCollapsed ? "w-[72px]" : "w-64";
  
  // Mobile drawer logic
  const mobileClasses = isMobileOpen 
    ? "fixed inset-y-0 left-0 translate-x-0 w-64" 
    : "fixed inset-y-0 left-0 -translate-x-full md:relative md:translate-x-0 " + desktopWidth;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`${sidebarClasses} ${mobileClasses}`}>
        {/* Toggle Button (Desktop Only) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3.5 top-6 h-7 w-7 bg-white border border-neutral-200 rounded-full items-center justify-center text-neutral-500 hover:text-neutral-900 shadow-sm z-10 transition-colors"
        >
          {effectiveIsCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Header */}
        <div className={`h-14 flex items-center border-b border-neutral-200 ${effectiveIsCollapsed ? 'justify-center px-0' : 'px-6 gap-3'} md:transition-all`}>
          <GraduationCap className={`h-6 w-6 text-neutral-900 shrink-0 ${effectiveIsCollapsed ? 'ml-0' : ''}`} />
          {!effectiveIsCollapsed && (
            <span className="text-sm font-semibold text-neutral-900 tracking-tight whitespace-nowrap overflow-hidden">
              University System
            </span>
          )}
          {/* Mobile Close Button */}
          <button 
            className="md:hidden ml-auto mr-4 text-neutral-500 hover:text-neutral-900"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <SidebarNav isCollapsed={effectiveIsCollapsed} />

        {/* Footer */}
        <div className={`p-4 border-t border-neutral-200 flex items-center ${effectiveIsCollapsed ? 'flex-col gap-3' : 'justify-between gap-3'}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${effectiveIsCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="h-9 w-9 rounded-md border border-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-900 shrink-0 uppercase tracking-wider bg-neutral-50">
              {initials}
            </div>
            {!effectiveIsCollapsed && (
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-sm font-medium text-neutral-900 truncate">
                  {name}
                </span>
                <span className="text-[11px] text-neutral-500 truncate">
                  {role}
                </span>
              </div>
            )}
          </div>
          <LogoutButton variant="icon" />
        </div>
      </aside>
    </>
  );
};
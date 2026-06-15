import { GraduationCap } from "lucide-react";
import { getJwtPayload } from "@/shared/auth/jwt";
import { LogoutButton } from "@/features/auth/logout";
import { SidebarNav } from "./SidebarNav";

export const Sidebar = async () => {
  // 1. Fetch user session information from JWT token
  const payload = await getJwtPayload();
  const role = payload?.role || "Student";
  const email = payload?.email || "user@unime.it";
  
  // Ensure payload.name is a string to avoid TS errors
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

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-neutral-200 bg-transparent font-sans shrink-0 select-none">
      {/* Header */}
      <div className="h-14 px-6 flex items-center border-b border-neutral-200 gap-3">
        <GraduationCap className="h-5 w-5 text-neutral-900" />
        <span className="text-sm font-semibold text-neutral-900 tracking-tight">
          University System
        </span>
      </div>

      {/* Navigation Sections */}
      <SidebarNav />

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-md border border-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-900 shrink-0 uppercase tracking-wider">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-sm font-medium text-neutral-900 truncate">
              {name}
            </span>
            <span className="text-[11px] text-neutral-500 truncate">
              {role}
            </span>
          </div>
        </div>
        <LogoutButton variant="icon" />
      </div>
    </aside>
  );
};
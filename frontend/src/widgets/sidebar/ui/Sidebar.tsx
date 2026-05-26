import React from "react";
import { GraduationCap } from "lucide-react";
import { NavigationLink, IconName } from "@/shared/ui";
import { getJwtPayload } from "@/shared/auth/jwt";
import { LogoutButton } from "@/features/auth/logout";

interface SidebarSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: IconName;
    exact?: boolean;
  }[];
}

export const Sidebar = async () => {
  // 1. Fetch user session information from JWT token
  const payload = await getJwtPayload();
  const role = payload?.role || "Student";
  const email = payload?.email || "user@unime.it";
  // Ensure payload.name is a string to avoid TS errors (e.g. when it's an object)
  const nameFromPayload =
    typeof payload?.name === "string" ? payload.name : undefined;
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

  const isAdmin = role === "Admin";
  const canManage = role !== "Student";

  const sections: SidebarSection[] = [
    {
      title: "Academic",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: "LayoutDashboard",
          exact: true,
        },
        { href: "/courses", label: "Courses", icon: "BookOpen" },
      ],
    },
    {
      title: "Management",
      items: [
        { href: "/students", label: "Students", icon: "GraduationCap" }
      ],
    },
  ];

  // 2. Filter sections based on Role-Based Access Control (RBAC)
  const visibleSections = sections.filter((section) => {
    if (section.title === "Management" && !canManage) {
      return false;
    }
    return true;
  });

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-neutral-200/60 bg-white font-sans shrink-0 select-none">
      {/* Header */}
      <div className="h-14 px-6 flex items-center border-b border-neutral-200/60 gap-2.5">
        <GraduationCap className="h-5 w-5 text-neutral-900" />
        <span className="text-sm font-semibold text-neutral-900 tracking-tight">
          University System
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        {visibleSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1.5">
            <h3 className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavigationLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  exact={item.exact}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600 shrink-0 uppercase">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-xs font-medium text-neutral-900 truncate">
              {name}
            </span>
            <span className="text-[10px] text-neutral-500 truncate">
              {email}
            </span>
          </div>
        </div>
        <LogoutButton variant="icon" />
      </div>
    </aside>
  );
};

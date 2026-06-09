import { GraduationCap } from "lucide-react";
import { NavigationLink, IconName } from "@/shared/ui";
import { getJwtPayload } from "@/shared/auth/jwt";
import { LogoutButton } from "@/features/auth/logout";

interface SidebarSection {
  title: string;
  managementOnly?: boolean; // Добавлен флаг для управления доступом
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

  const isAdmin = role === "Admin";
  const canManage = role !== "Student";

  // 2. Новая структура навигации (разбитая по доменам)
  const sections: SidebarSection[] = [
    {
      title: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", exact: true },
      ],
    },
    {
      title: "Academics",
      items: [
        { href: "/degree-programs", label: "Degree Programs", icon: "Award" },
        { href: "/program-requirements", label: "Program Reqs", icon: "ClipboardList" },
        { href: "/course-catalog", label: "Course Catalog", icon: "BookOpen" },
        { href: "/course-offerings", label: "Course Offerings", icon: "CalendarCheck" },
        { href: "/terms", label: "Terms", icon: "CalendarDays" },
      ],
    },
    {
      title: "Students",
      managementOnly: true,
      items: [
        { href: "/students", label: "Directory", icon: "GraduationCap" },
        { href: "/student-programs", label: "Programs", icon: "BookUser" },
        { href: "/enrollments", label: "Enrollments", icon: "FileSignature" },
        { href: "/documents", label: "Documents", icon: "FileText" },
      ],
    },
    {
      title: "Faculty & Staff",
      managementOnly: true,
      items: [
        { href: "/employees", label: "Directory", icon: "Users" },
        { href: "/employee-experience", label: "Experience", icon: "Briefcase" },
      ],
    },
    {
      title: "Campus",
      managementOnly: true,
      items: [
        { href: "/schools", label: "Schools", icon: "School" },
        { href: "/departments", label: "Departments", icon: "Building" },
        { href: "/research-labs", label: "Research Labs", icon: "Microscope" },
        { href: "/buildings", label: "Buildings", icon: "Building2" },
        { href: "/rooms", label: "Rooms", icon: "DoorOpen" },
      ],
    },
    {
      title: "System Admin",
      managementOnly: true,
      items: [
        { href: "/roles", label: "Roles", icon: "ShieldCheck" },
        { href: "/permissions", label: "Permissions", icon: "Key" },
      ],
    },
  ];

  // 3. Filter sections based on Role-Based Access Control (RBAC)
  const visibleSections = sections.filter((section) => {
    if (section.managementOnly && !canManage) {
      return false;
    }
    return true;
  });

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-neutral-200 bg-transparent font-sans shrink-0 select-none">
      {/* Header */}
      <div className="h-14 px-6 flex items-center border-b border-neutral-200 gap-3">
        <GraduationCap className="h-5 w-5 text-neutral-900" />
        <span className="text-sm font-semibold text-neutral-900 tracking-tight">
          University System
        </span>
      </div>

      {/* Navigation Sections со скрытым нативным скроллбаром */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-8 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
        {visibleSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <h3 className="px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {section.title}
            </h3>
            <div className="flex flex-col gap-1">
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
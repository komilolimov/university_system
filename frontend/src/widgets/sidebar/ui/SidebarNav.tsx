"use client";

import React, { useMemo } from "react";
import { NavigationLink, type IconName } from "@/shared/ui";
import { usePermissions } from "@/entities/session";

interface SidebarItem {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
  permission?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const SidebarNav = () => {
  const { hasPermission } = usePermissions();

  const sections: SidebarSection[] = useMemo(
    () => [
      {
        title: "Overview",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", exact: true },
        ],
      },
      {
        title: "Academics",
        items: [
          { href: "/degree-programs", label: "Degree Programs", icon: "Award", permission: "degree_programs:read" },
          { href: "/program-requirements", label: "Program Reqs", icon: "ClipboardList", permission: "program_requirements:read" },
          { href: "/course-catalog", label: "Course Catalog", icon: "BookOpen", permission: "course_catalog:read" },
          { href: "/course-offerings", label: "Course Offerings", icon: "CalendarCheck", permission: "course_offerings:read" },
          { href: "/terms", label: "Terms", icon: "CalendarDays", permission: "terms:read" },
        ],
      },
      {
        title: "Students",
        items: [
          { href: "/students", label: "Directory", icon: "GraduationCap", permission: "students:read" },
          { href: "/student-programs", label: "Programs", icon: "BookUser", permission: "student_programs:read" },
          { href: "/enrollments", label: "Enrollments", icon: "FileSignature", permission: "enrollments:read" },
          { href: "/documents", label: "Documents", icon: "FileText", permission: "documents:read" },
        ],
      },
      {
        title: "Faculty & Staff",
        items: [
          { href: "/employees", label: "Directory", icon: "Users", permission: "employees:read" },
          { href: "/employee-experience", label: "Experience", icon: "Briefcase", permission: "employee_experience:read" },
        ],
      },
      {
        title: "Campus",
        items: [
          { href: "/schools", label: "Schools", icon: "School", permission: "schools:read" },
          { href: "/departments", label: "Departments", icon: "Building", permission: "departments:read" },
          { href: "/research-labs", label: "Research Labs", icon: "Microscope", permission: "research_labs:read" },
          { href: "/buildings", label: "Buildings", icon: "Building2", permission: "buildings:read" },
          { href: "/rooms", label: "Rooms", icon: "DoorOpen", permission: "rooms:read" },
        ],
      },
      {
        title: "System Admin",
        items: [
          { href: "/roles", label: "Roles", icon: "ShieldCheck", permission: "roles:read" },
          { href: "/permissions", label: "Permissions", icon: "Key", permission: "permissions:read" },
        ],
      },
    ],
    []
  );

  const visibleSections = useMemo(() => {
    return sections
      .map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.permission || hasPermission(item.permission)
        );
        return { ...section, items: visibleItems };
      })
      .filter((section) => section.items.length > 0);
  }, [sections, hasPermission]);

  return (
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
  );
};

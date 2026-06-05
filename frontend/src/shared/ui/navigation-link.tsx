"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Users, 
  Settings, 
  Key, 
  User,
  GraduationCap,
  ShieldCheck
} from "lucide-react";

const iconMap = {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  Settings,
  Key,
  User,
  GraduationCap,
  ShieldCheck
};

export type IconName = keyof typeof iconMap;

interface NavigationLinkProps {
  href: string;
  label: string;
  icon?: IconName;
  exact?: boolean;
}

export const NavigationLink = ({ href, label, icon, exact = false }: NavigationLinkProps) => {
  const pathname = usePathname();
  const Icon = icon ? iconMap[icon] : undefined;
  
  const isActive = exact 
    ? pathname === href 
    : pathname === href || (href !== "/" && !!pathname && pathname.startsWith(href));

  return (
    <Link
      href={href as React.ComponentProps<typeof Link>["href"]}
      className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-150 ease-in-out cursor-pointer select-none ${
        isActive
          ? "bg-neutral-100 text-neutral-900 font-medium"
          : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
      }`}
    >
      {Icon && (
        <Icon 
          className={`h-4 w-4 shrink-0 transition-colors ${
            isActive ? "text-neutral-900" : "text-neutral-400 group-hover:text-neutral-900"
          }`} 
        />
      )}
      <span>{label}</span>
    </Link>
  );
};


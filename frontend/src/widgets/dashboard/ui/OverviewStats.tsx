import React from "react";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  ClipboardCheck 
} from "lucide-react";

interface OverviewStatsProps {
  stats: {
    coursesCount: number;
    studentsCount: number;
    enrollmentsCount: number;
    schoolsCount: number;
  };
}

export const OverviewStats = ({ stats }: OverviewStatsProps) => {
  const cards = [
    {
      label: "Total Courses",
      value: stats.coursesCount,
      icon: BookOpen,
      desc: "Available catalog offerings",
    },
    {
      label: "Total Students",
      value: stats.studentsCount,
      icon: Users,
      desc: "Registered portal members",
    },
    {
      label: "Active Enrollments",
      value: stats.enrollmentsCount,
      icon: ClipboardCheck,
      desc: "Confirmed course registrations",
    },
    {
      label: "Academic Schools",
      value: stats.schoolsCount,
      icon: GraduationCap,
      desc: "Active academic departments",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full font-sans select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.label} 
            className="bg-white border border-neutral-200/60 p-6 rounded-xl shadow-sm flex flex-col gap-3 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {card.label}
              </span>
              <Icon className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-neutral-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {card.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

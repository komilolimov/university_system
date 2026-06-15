import React from "react";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  ClipboardCheck,
  TrendingUp
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
      trend: "+4.5%",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Students",
      value: stats.studentsCount,
      icon: Users,
      trend: "+12.2%",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Enrollments",
      value: stats.enrollmentsCount,
      icon: ClipboardCheck,
      trend: "+8.1%",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Academic Schools",
      value: stats.schoolsCount,
      icon: GraduationCap,
      trend: "Stable",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full font-sans select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.label} 
            className="bg-white border border-neutral-200/60 p-5 rounded-2xl shadow-sm flex flex-col gap-4 transition-all hover:shadow-md hover:border-neutral-300 group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {card.trend !== "Stable" && <TrendingUp className="w-3 h-3" strokeWidth={3} />}
                {card.trend}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[13px] font-semibold text-neutral-500">
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

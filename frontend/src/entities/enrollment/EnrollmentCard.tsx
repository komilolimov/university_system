import React from "react";
import { BookOpen, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import type { components } from "@/shared/api/schema";

type Enrollment = components["schemas"]["EnrollmentRead"];
type CourseOffering = components["schemas"]["CourseOfferingRead"];
type CourseCatalog = components["schemas"]["CourseCatalogRead"];

export interface EnrollmentCardProps {
  enrollment: Enrollment;
  offering: CourseOffering;
  course: CourseCatalog;
}

export const EnrollmentCard = ({ enrollment, offering, course }: EnrollmentCardProps) => {
  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "enrolled":
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "waitlisted":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "dropped":
      case "withdrawn":
        return "bg-red-50 text-red-700 border-red-200/60";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200/60";
    }
  };

  const StatusIcon = enrollment.status?.toLowerCase() === 'enrolled' ? CheckCircle2 : Clock;

  return (
    <div className="bg-white border border-neutral-200/60 p-6 rounded-xl shadow-sm flex flex-col gap-5 w-full transition-all hover:shadow-md hover:border-neutral-300 group">
      <div className="flex flex-col gap-1.5 border-b border-neutral-100 pb-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[17px] leading-snug font-semibold text-neutral-900 tracking-tight group-hover:text-neutral-700 transition-colors">
            {course.title}
          </h3>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide uppercase ${getStatusColor(enrollment.status)} shrink-0`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {enrollment.status}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[13px] font-medium text-neutral-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-neutral-400" />
            {course.code}
          </span>
          <span className="w-1 h-1 rounded-full bg-neutral-300" />
          <span>{course.credits} Credits</span>
        </div>
      </div>
      
      {offering.schedule_blocks && (
        <div className="flex items-start gap-2.5 pt-1">
          <CalendarDays className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">
              Schedule
            </span>
            <span className="text-sm font-medium text-neutral-700 leading-relaxed">
              {offering.schedule_blocks}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

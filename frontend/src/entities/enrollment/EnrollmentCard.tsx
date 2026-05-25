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
  return (
    <div className="border border-gray-200 p-6 flex flex-col gap-4 w-full transition-colors hover:border-gray-400">
      <div className="flex flex-col gap-1 border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">{course.title}</h3>
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-500">{course.code} вЂў {course.credits} Credits</p>
      </div>
      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</span>
        <span className="text-xs font-bold tracking-widest uppercase text-gray-900 border border-gray-900 px-3 py-1">
          {enrollment.status}
        </span>
      </div>
      {offering.schedule_blocks && (
        <div className="flex flex-col gap-1 pt-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Schedule</span>
          <span className="text-sm font-medium text-gray-700">{offering.schedule_blocks}</span>
        </div>
      )}
    </div>
  );
};

import type { components } from "@/shared/api/schema";

type Course = components["schemas"]["CourseCatalogRead"];

interface CourseCardProps {
  actionSlot?: React.ReactNode;
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-tight">{course.title}</h3>
        <p className="text-sm font-medium text-gray-500">{course.code} вЂў {course.credits} Credits</p>
      </div>
      {course.description && (
        <p className="text-sm text-gray-700 leading-relaxed">{course.description}</p>
      )}
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Dept ID: {course.department_id}
      </div>
    </div>
  );
};

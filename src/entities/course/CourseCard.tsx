import type { components } from "@/shared/api/schema";

type Course = components["schemas"]["CourseCatalogRead"];

interface CourseCardProps {
  course: Course;
  actionSlot?: React.ReactNode;
}

export const CourseCard = ({ course, actionSlot }: CourseCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 flex flex-col gap-6 h-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold tracking-tight text-gray-900">{course.title}</h3>
          <p className="text-sm font-semibold tracking-wider uppercase text-gray-500">{course.code} вЂў {course.credits} Credits</p>
        </div>
        {course.description && (
          <p className="text-sm text-gray-700 leading-relaxed">{course.description}</p>
        )}
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Dept ID: {course.department_id}
        </div>
      </div>
      {actionSlot && (
        <div className="pt-4 border-t border-gray-100 mt-auto">
          {actionSlot}
        </div>
      )}
    </div>
  );
};

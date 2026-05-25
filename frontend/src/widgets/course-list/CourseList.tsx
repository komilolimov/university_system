import { apiClient } from "@/shared/api/client";
import { CourseCard } from "@/entities/course";
import { EnrollButton } from "@/features/course-registration";

export const CourseList = async () => {
  const { data, error } = await apiClient.GET("/api/v1/course-catalog/");

  if (error) {
    return <div className="p-4 border border-red-200 text-red-600 rounded-lg">Failed to load courses</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4 border border-gray-200 rounded-lg">No courses found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((course) => (
        <CourseCard key={course.code} course={course} actionSlot={<EnrollButton courseId={course.id} />} />
      ))}
    </div>
  );
};

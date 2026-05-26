import React from "react";
import { CourseCard } from "@/entities/course";
import { EnrollButton } from "@/features/course-registration";

import type { components } from "@/shared/api/schema";

type Course = components["schemas"]["CourseCatalogRead"];

interface CourseListProps {
  courses?: Course[] | null;
  error?: unknown;
}

export const CourseList = ({ courses, error }: CourseListProps) => {
  if (error) {
    return (
      <div className="p-6 border border-neutral-200 bg-white rounded-xl text-red-500 font-medium text-sm shadow-sm select-none">
        Failed to load course catalog. Please check backend connection.
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="p-6 border border-neutral-200 bg-white rounded-xl text-neutral-500 text-sm shadow-sm select-none">
        No courses found in the catalog.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard 
          key={course.code} 
          course={course} 
          actionSlot={<EnrollButton courseId={course.id} />} 
        />
      ))}
    </div>
  );
};

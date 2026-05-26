import React from "react";
import { apiClient } from "@/shared/api/client";
import { CourseCatalogTable } from "./CourseCatalogTable";
import { Course } from "@/entities/course";

export const CourseCatalog = async () => {
  // Fetch courses via predefined API client
  const { data, error } = await apiClient.GET("/api/v1/courses");

  if (error) {
    return <div className="text-red-500">Failed to load courses.</div>;
  }

  const courses: Course[] = data || [];

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-bold text-gray-800">Course Catalog</h2>
      <CourseCatalogTable courses={courses} />
    </div>
  );
};

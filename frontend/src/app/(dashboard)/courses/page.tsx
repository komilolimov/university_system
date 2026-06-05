import React from "react";
import { CourseList } from "@/widgets/course";
import { apiClient } from "@/shared/api/client";

export default async function CoursesPage() {
  // Fetch real data from the API endpoint using apiClient
  const { data, error } = await apiClient.GET("/api/v1/course-catalog/");

  return (
    <main className="fsd-container mx-auto my-8 flex flex-col gap-8 px-6 font-sans">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          University Course Catalog
        </h1>
        <p className="text-neutral-500 font-medium">
          Browse and discover all available degree courses.
        </p>
      </header>
      <section>
        <CourseList courses={data} error={error} />
      </section>
    </main>
  );
}

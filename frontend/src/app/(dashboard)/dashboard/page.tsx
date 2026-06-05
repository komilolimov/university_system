import React from "react";
import { StudentProfileOverview } from "@/widgets/student-profile";
import { EnrollmentList } from "@/widgets/my-enrollments";
import { AdminOverview } from "@/widgets/admin-dashboard";
import { OverviewStats } from "@/widgets/dashboard";
import { getJwtPayload } from "@/shared/auth/jwt";
import { apiClient } from "@/shared/api/client";

export default async function DashboardPage() {
  const payload = await getJwtPayload();
  const role = payload?.role || "Student";
  const isAdminOrFaculty = role === "Admin" || role === "Faculty";

  // Concurrent dynamic fetching for actual counts to fuel OverviewStats
  const [coursesRes, studentsRes, enrollmentsRes, schoolsRes, meRes] = await Promise.all([
    apiClient.GET("/api/v1/course-catalog/").catch(() => ({ data: [] })),
    apiClient.GET("/api/v1/students/").catch(() => ({ data: [] })),
    apiClient.GET("/api/v1/enrollments/").catch(() => ({ data: [] })),
    apiClient.GET("/api/v1/schools/").catch(() => ({ data: [] })),
    apiClient.GET("/api/v1/auth/me", {}).catch((err) => ({ data: null, error: err })),
  ]);

  console.log("🔥 ДАННЫЕ ПОЛЬЗОВАТЕЛЯ (/me):", meRes?.data);

  const stats = {
    coursesCount: coursesRes?.data?.length || 0,
    studentsCount: studentsRes?.data?.length || 0,
    enrollmentsCount: enrollmentsRes?.data?.length || 0,
    schoolsCount: schoolsRes?.data?.length || 0,
  };

  return (
    <main className="w-full flex flex-col gap-8 px-6 py-8 sm:px-10 font-sans">
      {/* Dynamic Header */}
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          {isAdminOrFaculty ? "Administrator Dashboard" : "Student Dashboard"}
        </h1>
        <p className="text-neutral-500 font-medium">
          {isAdminOrFaculty ? "Manage curriculum and students." : "Welcome to your university portal."}
        </p>
      </header>

      {/* Dynamic Stats Grid */}
      <section>
        <OverviewStats stats={stats} />
      </section>

      {/* Role-Based Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isAdminOrFaculty ? (
          <section className="md:col-span-3">
            <AdminOverview />
          </section>
        ) : (
          <>
            <aside className="md:col-span-1">
              <StudentProfileOverview />
            </aside>
            <section className="md:col-span-2">
              <EnrollmentList />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

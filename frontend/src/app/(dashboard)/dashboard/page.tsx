import React from "react";
import { StudentProfileOverview } from "@/widgets/student-profile";
import { EnrollmentList } from "@/widgets/my-enrollments";
import { AdminOverview } from "@/widgets/admin-dashboard";
import { OverviewStats, EnrollmentTrendsChart, RecentActivityFeed } from "@/widgets/dashboard";
import { getJwtPayload } from "@/shared/auth/jwt";
import { apiClient } from "@/shared/api/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const payload = await getJwtPayload();
  const role = payload?.role || "Student";
  const isAdminOrFaculty = role === "Admin" || role === "Faculty";

  // Interface for the new dashboard stats API (until OpenAPI is re-synced)
  interface OverviewStatsType {
    coursesCount: number;
    studentsCount: number;
    enrollmentsCount: number;
    schoolsCount: number;
    employeesCount: number;
    activeProgramsCount: number;
  }

  // Fetch actual counts using the new lightweight statistics endpoint
  // Use `as any` to bypass openapi-fetch strict path typing temporarily
  const overviewRes = await apiClient.GET("/api/v1/dashboard/stats/overview" as any, {}).catch(() => ({ data: null }));
  const trendsRes = await apiClient.GET("/api/v1/dashboard/stats/enrollment-trends" as any, {}).catch(() => ({ data: [] }));
  const demoRes = await apiClient.GET("/api/v1/dashboard/stats/demographics" as any, {}).catch(() => ({ data: [] }));

  const stats: OverviewStatsType = (overviewRes?.data as OverviewStatsType) || {
    coursesCount: 0,
    studentsCount: 0,
    enrollmentsCount: 0,
    schoolsCount: 0,
    employeesCount: 0,
    activeProgramsCount: 0
  };

  const trendsData = (trendsRes?.data as any[]) || [];

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAdminOrFaculty ? (
          <>
            <section className="lg:col-span-2 flex flex-col gap-8">
              <EnrollmentTrendsChart data={trendsData} />
              <AdminOverview />
            </section>
            <aside className="lg:col-span-1 flex flex-col gap-8">
              <RecentActivityFeed />
            </aside>
          </>
        ) : (
          <>
            <section className="lg:col-span-2 flex flex-col gap-8">
              <EnrollmentTrendsChart data={trendsData} />
              <EnrollmentList />
            </section>
            <aside className="lg:col-span-1 flex flex-col gap-8">
              <StudentProfileOverview />
              <RecentActivityFeed />
            </aside>
          </>
        )}
      </div>
    </main>
  );
}

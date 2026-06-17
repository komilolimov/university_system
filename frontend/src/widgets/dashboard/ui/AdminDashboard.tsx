import React from "react";
import { OverviewStats, EnrollmentTrendsChart, RecentActivityFeed } from "@/widgets/dashboard";
import { AdminOverview } from "@/widgets/admin-dashboard";
import { apiClient } from "@/shared/api/client";

// Interface for the new dashboard stats API
interface OverviewStatsType {
  coursesCount: number;
  studentsCount: number;
  enrollmentsCount: number;
  schoolsCount: number;
  employeesCount: number;
  activeProgramsCount: number;
}

export const AdminDashboard = async () => {
  // Fetch actual counts using the new lightweight statistics endpoint
  const overviewRes = await apiClient.GET("/api/v1/dashboard/stats/overview" as any, {}).catch(() => ({ data: null }));
  const trendsRes = await apiClient.GET("/api/v1/dashboard/stats/enrollment-trends" as any, {}).catch(() => ({ data: [] }));

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
    <div className="flex flex-col gap-8 w-full">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4 select-none">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          Administrator Dashboard
        </h1>
        <p className="text-neutral-500 font-medium">
          Manage curriculum, users, and overall university statistics.
        </p>
      </header>

      <section>
        <OverviewStats stats={stats} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 flex flex-col gap-8">
          <EnrollmentTrendsChart data={trendsData} />
          <AdminOverview />
        </section>
        <aside className="lg:col-span-1 flex flex-col gap-8">
          <RecentActivityFeed />
        </aside>
      </div>
    </div>
  );
};

import React from 'react';
import apiClient from '@/shared/api/client';

export async function CourseAnalyticsOverview() {
  // Fetch metrics via shared API client (Server Component)
  const { data, error } = await apiClient.GET('/analytics/overview');

  if (error || !data) {
    return (
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500">
        Unable to load analytics data.
      </div>
    );
  }

  const metrics = [
    {
      id: 'total_enrollment',
      label: 'Total Enrollment',
      value: data.totalEnrollment,
      trend: data.enrollmentTrend,
    },
    {
      id: 'completion_rate',
      label: 'Completion Rate',
      value: `${data.completionRate}%`,
      trend: data.completionTrend,
    },
    {
      id: 'average_score',
      label: 'Average Score',
      value: data.averageScore,
      trend: data.scoreTrend,
    },
    {
      id: 'active_sessions',
      label: 'Active Sessions',
      value: data.activeSessions,
      trend: data.sessionsTrend,
    },
  ];

  return (
    <section className="w-full geistSans">
      <div className="mb-6">
        <h2 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
          Course Analytics
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Overview of key performance metrics for the current semester.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {metric.label}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                {metric.value}
              </span>
              {metric.trend !== undefined && (
                <span
                  className={`text-xs font-medium ${
                    metric.trend >= 0
                      ? 'text-neutral-600 dark:text-neutral-300'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {metric.trend > 0 ? '+' : ''}
                  {metric.trend}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

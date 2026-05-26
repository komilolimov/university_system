import { apiClient } from '@/shared/api/apiClient';

interface CourseMetrics {
  totalStudents: number;
  activeCourses: number;
  averageCompletionRate: number;
  averageGrade: number;
}

export async function CourseAnalyticsOverview() {
  // Fetch metrics as a Server Component
  const metrics: CourseMetrics = await apiClient.get('/api/metrics/course');

  return (
    <section 
      className="w-full antialiased" 
      style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={metrics.totalStudents.toLocaleString()} />
        <StatCard title="Active Courses" value={metrics.activeCourses.toLocaleString()} />
        <StatCard title="Completion Rate" value={`${metrics.averageCompletionRate}%`} />
        <StatCard title="Avg. Grade" value={`${metrics.averageGrade}%`} />
      </div>
    </section>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-black dark:hover:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
        {value}
      </p>
    </div>
  );
}

export default CourseAnalyticsOverview;

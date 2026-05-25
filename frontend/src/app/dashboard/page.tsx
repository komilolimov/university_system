import { LogoutButton } from "@/features/auth/logout";
import { StudentProfileOverview } from "@/widgets/student-profile";

export default function DashboardPage() {
  return (
    <main className="fsd-container mx-auto my-16 max-w-5xl flex flex-col gap-8">
      <header className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 font-medium">Welcome to your university portal.</p>
        </div>
        <LogoutButton />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="md:col-span-1">
          <StudentProfileOverview />
        </aside>
        <section className="md:col-span-2 flex flex-col gap-4 border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Your Enrolled Courses</h2>
          <p className="text-gray-500 font-medium">Course data will be displayed here in the future.</p>
        </section>
      </div>
    </main>
  );
}

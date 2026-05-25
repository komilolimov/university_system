import { LogoutButton } from "@/features/auth/logout";
import { StudentProfileOverview } from "@/widgets/student-profile";
import { EnrollmentList } from "@/widgets/my-enrollments";

export default function DashboardPage() {
  return (
    <main className="fsd-container mx-auto my-16 max-w-6xl flex flex-col gap-8 px-4">
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
        <section className="md:col-span-2">
          <EnrollmentList />
        </section>
      </div>
    </main>
  );
}

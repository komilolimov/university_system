import { LogoutButton } from "@/features/auth/logout";
import { StudentProfileOverview } from "@/widgets/student-profile";
import { EnrollmentList } from "@/widgets/my-enrollments";
import { AdminOverview } from "@/widgets/admin-dashboard";
import { getJwtPayload } from "@/shared/auth/jwt";

export default async function DashboardPage() {
  const payload = await getJwtPayload();
  const role = payload?.role || "Student";
  const isAdminOrFaculty = role === "Admin" || role === "Faculty";

  return (
    <main className="fsd-container mx-auto my-16 max-w-6xl flex flex-col gap-10 px-4">
      <header className="flex justify-between items-end border-b border-gray-300 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900">
            {isAdminOrFaculty ? "Administrator Dashboard" : "Student Dashboard"}
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">
            {isAdminOrFaculty ? "Manage curriculum and students." : "Welcome to your university portal."}
          </p>
        </div>
        <LogoutButton />
      </header>
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

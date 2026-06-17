import { getJwtPayload } from "@/shared/auth/jwt";
import { AdminDashboard, StudentDashboard, FacultyDashboard } from "@/widgets/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const payload = await getJwtPayload();
  const role = payload?.role || "Student";

  return (
    <main className="w-full flex flex-col gap-8 px-6 py-8 sm:px-10 font-sans">
      {(role === "Admin" || role === "Administrator") && <AdminDashboard />}
      {role === "Faculty" && <FacultyDashboard />}
      {(role === "Student" || !role) && <StudentDashboard />}
    </main>
  );
}

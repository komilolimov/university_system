import { LogoutButton } from "@/features/auth/logout";

export default function DashboardPage() {
  return (
    <main className="fsd-container mx-auto my-16 max-w-5xl flex flex-col gap-8">
      <div className="flex justify-end">
        <LogoutButton />
      </div>
      <div>Dashboard Content</div>
    </main>
  );
}

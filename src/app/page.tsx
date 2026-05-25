import Link from "next/link";

export default function Home() {
  return (
    <main className="fsd-container mx-auto my-16 max-w-5xl flex flex-col gap-16">
      <header className="flex flex-col gap-4 border-b border-gray-300 pb-8 text-center">
        <h1 className="text-5xl font-bold tracking-tighter text-gray-900">
          University Management System
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
          An advanced, strictly typed educational platform.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <Link href="/courses" className="border border-gray-300 p-6 flex flex-col gap-2 transition-colors">
          <h2 className="text-2xl font-bold">Course Catalog</h2>
          <p className="text-gray-500 font-medium">Browse available degree programs.</p>
        </Link>
        <Link href="/login" className="border border-gray-300 p-6 flex flex-col gap-2 transition-colors">
          <h2 className="text-2xl font-bold">Student Portal Login</h2>
          <p className="text-gray-500 font-medium">Access your protected dashboard.</p>
        </Link>
        <Link href="/dashboard" className="border border-gray-300 p-6 flex flex-col gap-2 transition-colors">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-500 font-medium">View your profile and active enrollments.</p>
        </Link>
      </section>
    </main>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="fsd-container mx-auto my-16 max-w-6xl flex flex-col gap-16 px-4">
      <header className="flex flex-col gap-6 border-b border-gray-300 pb-12 text-center">
        <h1 className="text-6xl font-extrabold tracking-tighter text-gray-900">
          University Management System
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
          An advanced, strictly typed educational platform engineered for modern students.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/courses" className="border border-gray-300 p-8 flex flex-col gap-3 hover:border-black focus:border-black outline-none transition-colors group">
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-black transition-colors">Course Catalog</h2>
          <p className="text-gray-500 font-medium">Browse and discover available degree programs and offerings.</p>
        </Link>
        <Link href="/login" className="border border-gray-300 p-8 flex flex-col gap-3 hover:border-black focus:border-black outline-none transition-colors group">
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-black transition-colors">Student Login</h2>
          <p className="text-gray-500 font-medium">Securely access your protected academic profile and records.</p>
        </Link>
        <Link href="/dashboard" className="border border-gray-300 p-8 flex flex-col gap-3 hover:border-black focus:border-black outline-none transition-colors group">
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-black transition-colors">Your Dashboard</h2>
          <p className="text-gray-500 font-medium">View your active enrollments and manage your education.</p>
        </Link>
      </section>
    </main>
  );
}

import { LoginForm } from "@/features/auth/login-by-email";

export default function LoginPage() {
  return (
    <main className="fsd-container mx-auto my-16 max-w-md flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-gray-300 pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign In</h1>
        <p className="text-gray-500 font-medium">Access the University System</p>
      </header>
      <section>
        <LoginForm />
      </section>
    </main>
  );
}

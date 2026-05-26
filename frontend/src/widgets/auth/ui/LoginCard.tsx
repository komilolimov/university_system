import { LoginForm } from "@/features/auth/login-by-email";

export const LoginCard = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-transparent relative z-10">
      <div className="w-full max-w-sm border border-neutral-200/60 bg-white p-10 shadow-sm flex flex-col gap-6 rounded-xl">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[16px] font-medium tracking-[-0.016em] text-neutral-900">
            Sign In
          </h1>
          <p className="text-sm text-neutral-500">
            Access the University System
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};


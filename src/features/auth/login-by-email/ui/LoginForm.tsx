"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "../actions";
import { useRouter } from "next/navigation";

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/courses");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-gray-300 p-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-bold text-gray-900">Email</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          className="border border-gray-300 p-2 text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-bold text-gray-900">Password</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          className="border border-gray-300 p-2 text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 font-bold">{state.error}</p>
      )}
      <button 
        type="submit" 
        disabled={isPending}
        className="mt-4 border border-gray-900 font-bold text-gray-900 p-2 hover:border-black hover:text-black focus:border-black focus:outline-none transition-colors disabled:opacity-50"
      >
        {isPending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
};

"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { loginAction } from "../actions";
import { AuthInput } from "@/entities/auth";

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error("Sign In Failed", {
        description: state.error,
      });
    } else if (state && !state.error) {
      toast.success("Welcome back!");
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
        />
        <AuthInput
          id="password"
          name="password"
          type="password"
          label="Password"
          required
          autoComplete="current-password"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full h-10 px-4 py-2 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};
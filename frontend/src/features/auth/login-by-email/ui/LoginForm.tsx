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
    }
  }, [state]);

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
        />

        {/* НИКАКИХ relative И ДОПОЛНИТЕЛЬНЫХ КНОПОК ЗДЕСЬ! 
            Просто вызываем AuthInput, он всё сделает сам. */}
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
        className="h-10 w-full cursor-pointer rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};
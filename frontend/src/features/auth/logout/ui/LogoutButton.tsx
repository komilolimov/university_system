"use client";

import { logoutAction } from "../actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "icon";
}

export const LogoutButton = ({ variant = "default" }: LogoutButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
    });
  };

  if (variant === "icon") {
    return (
      <button 
        onClick={handleLogout}
        disabled={isPending}
        className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="border border-gray-300 font-medium text-gray-900 px-4 py-2 hover:border-black hover:text-black focus:border-black focus:outline-none transition-colors disabled:opacity-50"
    >
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
};

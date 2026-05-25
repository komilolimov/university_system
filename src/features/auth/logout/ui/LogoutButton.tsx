"use client";

import { logoutAction } from "../actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export const LogoutButton = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
    });
  };

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

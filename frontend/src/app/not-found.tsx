import React from "react";
import Link from "next/link";
import { BackgroundGlow } from "@/shared/ui";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-transparent font-sans overflow-hidden">
      {/* Background glow animation */}
      <BackgroundGlow />

      {/* Centered container layered above background */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Next.js-style error stack */}
        <div className="flex items-center gap-5 justify-center">
          <h1 className="text-[24px] font-semibold text-neutral-900 tracking-tighter pr-5 border-r border-neutral-300 select-none">
            404
          </h1>
          <p className="text-sm text-neutral-500 font-normal select-none">
            This page could not be found.
          </p>
        </div>

        {/* Vercel-style Action Button */}
        <Link 
          href="/dashboard"
          className="mt-8 h-9 px-4 inline-flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-black cursor-pointer select-none"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}

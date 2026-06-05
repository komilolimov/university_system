import React from "react";

export default function DashboardLoading() {
  return (
    <div className="fsd-container mx-auto my-8 max-w-5xl flex flex-col gap-8 px-6 font-sans select-none animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4">
        <div className="h-8 w-64 bg-neutral-200 rounded-md" />
        <div className="h-4 w-96 bg-neutral-200 rounded-md" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200/60 p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-neutral-200 rounded-md" />
              <div className="h-4 w-4 bg-neutral-200 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-6 w-12 bg-neutral-200 rounded-md" />
              <div className="h-3.5 w-32 bg-neutral-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="h-64 w-full bg-neutral-100 border border-neutral-200/60 rounded-xl" />
    </div>
  );
}

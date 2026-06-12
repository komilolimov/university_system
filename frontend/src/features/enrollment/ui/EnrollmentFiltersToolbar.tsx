"use client";

import React from "react";
import { Search, X } from "lucide-react";
import type { EnrollmentStatus } from "@/entities/enrollment";

export interface EnrollmentFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: EnrollmentStatus | "";
  onStatusFilterChange: (val: EnrollmentStatus | "") => void;
}

export const EnrollmentFiltersToolbar: React.FC<
  EnrollmentFiltersToolbarProps
> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const hasActiveFilters = Boolean(searchQuery) || Boolean(statusFilter);

  const clearFilters = () => {
    onSearchChange("");
    onStatusFilterChange("");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full p-3 rounded-lg border border-neutral-200 select-none">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter enrollments..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>
      
      {/* Status Filter */}
      <div className="flex bg-neutral-100 p-0.5 rounded-md border border-neutral-200">
        {(["", "Enrolled", "Waitlisted", "Completed", "Dropped"] as const).map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status as EnrollmentStatus | "")}
            className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
              statusFilter === status
                ? "bg-white text-black shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {status === "" ? "All" : status}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-200 text-neutral-600 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
        >
          <X className="w-3.5 h-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  );
};

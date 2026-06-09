"use client";

import React from "react";
import { Search } from "lucide-react";

interface TermsFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: "all" | "active" | "inactive";
  onStatusChange: (status: "all" | "active" | "inactive") => void;
}

export const TermsFiltersToolbar = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: TermsFiltersToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full bg-white p-3 rounded-lg border border-neutral-200 shadow-sm select-none">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by term name..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>

      {/* Status */}
      <div className="flex bg-neutral-100 p-0.5 rounded-md border border-neutral-200">
        {(["all", "active", "inactive"] as const).map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`px-3 py-1 text-xs font-semibold rounded-sm capitalize transition-colors ${
              selectedStatus === status
                ? "bg-white text-black shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

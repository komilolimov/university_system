"use client";

import React from "react";
import { Search, X } from "lucide-react";

export interface ProgramRequirementFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const ProgramRequirementFiltersToolbar: React.FC<
  ProgramRequirementFiltersToolbarProps
> = ({
  searchQuery,
  onSearchChange,
}) => {
  const hasActiveFilters = Boolean(searchQuery);

  const clearFilters = () => {
    onSearchChange("");
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
          placeholder="Filter requirements..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-200 text-neutral-600 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
        >
          <X className="w-3.5 h-3.5" />
          Clear Filter
        </button>
      )}
    </div>
  );
};

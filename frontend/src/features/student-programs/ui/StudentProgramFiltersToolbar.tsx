"use client";

import React from "react";
import { Search, X } from "lucide-react";
import type { ProgramType } from "@/entities/student-programs";

export interface StudentProgramFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedType: ProgramType | "all";
  onTypeChange: (val: ProgramType | "all") => void;
}

export const StudentProgramFiltersToolbar: React.FC<StudentProgramFiltersToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
}) => {
  const hasActiveFilters = Boolean(searchQuery) || selectedType !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onTypeChange("all");
  };

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
          placeholder="Filter programs..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>

      {/* Type */}
      <div className="flex bg-neutral-100 p-0.5 rounded-md border border-neutral-200">
        {(["all", "Major", "Minor", "Certificate"] as const).map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type as ProgramType | "all")}
            className={`px-3 py-1 text-xs font-semibold rounded-sm capitalize transition-colors ${
              selectedType === type
                ? "bg-white text-black shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-white hover:text-black transition-colors"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
};

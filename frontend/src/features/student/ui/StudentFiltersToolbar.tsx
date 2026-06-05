"use client";

import React from "react";
import { Search, X } from "lucide-react";
import type { Employee, RegionType } from "@/entities/student";

export interface StudentFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedRegion: RegionType | "";
  onRegionChange: (val: RegionType | "") => void;
  selectedAdvisor: string;
  onAdvisorChange: (val: string) => void;
  selectedStatus: "all" | "active" | "inactive";
  onStatusChange: (val: "all" | "active" | "inactive") => void;
  advisors: Employee[];
}

export const StudentFiltersToolbar: React.FC<
  StudentFiltersToolbarProps
> = ({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedAdvisor,
  onAdvisorChange,
  selectedStatus,
  onStatusChange,
  advisors,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedRegion) ||
    Boolean(selectedAdvisor) ||
    selectedStatus !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onRegionChange("");
    onAdvisorChange("");
    onStatusChange("all");
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
          placeholder="Search students..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>

      {/* Region */}
      <div className="w-full md:w-44">
        <select
          value={selectedRegion}
          onChange={(e) =>
            onRegionChange(e.target.value as RegionType | "")
          }
          className="block w-full px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors cursor-pointer appearance-none text-black"
        >
          <option value="">All Regions</option>
          <option value="Domestic">Domestic</option>
          <option value="EU">EU</option>
          <option value="Non-EU">Non-EU</option>
          <option value="USA">USA</option>
        </select>
      </div>

      {/* Advisor */}
      <div className="w-full md:w-56">
        <select
          value={selectedAdvisor}
          onChange={(e) => onAdvisorChange(e.target.value)}
          className="block w-full px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors cursor-pointer appearance-none text-black"
        >
          <option value="">All Advisors</option>

          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.first_name} {advisor.last_name}
            </option>
          ))}
        </select>
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
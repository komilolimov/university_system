"use client";

import React from "react";
import { Search, ChevronDown, X } from "lucide-react";
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

export const StudentFiltersToolbar: React.FC<StudentFiltersToolbarProps> = ({
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
  const hasActiveFilters = Boolean(
    searchQuery || selectedRegion || selectedAdvisor || selectedStatus !== "all"
  );

  const clearFilters = () => {
    onSearchChange("");
    onRegionChange("");
    onAdvisorChange("");
    onStatusChange("all");
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 select-none">
      {/* Search Input */}
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search students..."
          className="w-full sm:w-64 h-9 pl-9 pr-3 text-sm font-medium bg-white text-neutral-900 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-shadow placeholder:text-neutral-400 placeholder:font-normal"
        />
      </div>

      {/* Region Select */}
      <div className="relative w-full sm:w-auto min-w-[130px]">
        <select
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value as RegionType | "")}
          className="w-full h-9 pl-3 pr-8 text-sm font-medium bg-white text-neutral-900 border border-neutral-200 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 cursor-pointer"
        >
          <option value="">All Regions</option>
          <option value="Domestic">Domestic</option>
          <option value="EU">EU</option>
          <option value="Non-EU">Non-EU</option>
          <option value="USA">USA</option>
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>

      {/* Advisor Select */}
      <div className="relative w-full sm:w-auto min-w-[160px]">
        <select
          value={selectedAdvisor}
          onChange={(e) => onAdvisorChange(e.target.value)}
          className="w-full h-9 pl-3 pr-8 text-sm font-medium bg-white text-neutral-900 border border-neutral-200 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 cursor-pointer"
        >
          <option value="">All Advisors</option>
          {advisors.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>

      {/* Status Select */}
      <div className="relative w-full sm:w-auto min-w-[140px]">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as "all" | "active" | "inactive")}
          className="w-full h-9 pl-3 pr-8 text-sm font-medium bg-white text-neutral-900 border border-neutral-200 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium text-neutral-600 bg-neutral-100 border border-transparent hover:bg-neutral-200 hover:text-neutral-900 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 mr-1.5" />
          Clear
        </button>
      )}
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Search, X, Filter } from "lucide-react";
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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full bg-white p-3 rounded-lg border border-neutral-200 shadow-sm select-none">
      
      {/* Search Bar & Mobile Filter Toggle */}
      <div className="flex items-center gap-2 w-full md:flex-1">
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
        
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="md:hidden flex items-center justify-center p-1.5 text-neutral-600 border border-neutral-200 rounded-md bg-neutral-50 hover:bg-neutral-100 transition-colors"
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileFiltersOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/40 z-40 md:hidden"
          onClick={() => setIsMobileFiltersOpen(false)}
        />
      )}

      {/* Filters Container (Desktop inline, Mobile Drawer) */}
      <div className={`
        ${isMobileFiltersOpen ? 'fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-full duration-200' : 'hidden'}
        md:relative md:flex md:flex-row md:items-center md:gap-3 md:bg-transparent md:p-0 md:shadow-none md:z-auto md:w-auto
      `}>
        
        {/* Mobile Drawer Header */}
        <div className="md:hidden flex items-center justify-between pb-2 border-b border-neutral-100 mb-1">
          <h3 className="font-semibold text-neutral-900 text-lg">Filters</h3>
          <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 bg-neutral-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Region */}
        <div className="w-full md:w-44">
          <label className="md:hidden text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) =>
              onRegionChange(e.target.value as RegionType | "")
            }
            className="block w-full px-3 py-2 md:py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors cursor-pointer appearance-none text-black"
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
          <label className="md:hidden text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Advisor</label>
          <select
            value={selectedAdvisor}
            onChange={(e) => onAdvisorChange(e.target.value)}
            className="block w-full px-3 py-2 md:py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors cursor-pointer appearance-none text-black"
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
        <div className="w-full md:w-auto">
          <label className="md:hidden text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Status</label>
          <div className="flex bg-neutral-100 p-1 md:p-0.5 rounded-md border border-neutral-200 w-full md:w-auto justify-between md:justify-start">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`flex-1 md:flex-none px-3 py-1.5 md:py-1 text-sm md:text-xs font-semibold rounded-sm capitalize transition-colors ${
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

        {/* Mobile Action Buttons (Clear & Apply) */}
        <div className="md:hidden flex gap-3 mt-4 pt-4 border-t border-neutral-100">
          <button
            onClick={clearFilters}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setIsMobileFiltersOpen(false)}
            className="flex-[2] py-2.5 text-sm font-semibold rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Show Results
          </button>
        </div>

        {/* Desktop Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-white hover:text-black transition-colors ml-auto"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
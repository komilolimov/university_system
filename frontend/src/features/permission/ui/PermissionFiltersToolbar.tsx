"use client";

import React from "react";
import { Search, Layers, X } from "lucide-react";

interface PermissionFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatus: "all" | "active" | "inactive";
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  selectedModule: string;
  onModuleChange: (module: string) => void;
  availableModules: string[];
}

export const PermissionFiltersToolbar = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedModule,
  onModuleChange,
  availableModules,
}: PermissionFiltersToolbarProps) => {
  const hasActiveFilters = Boolean(searchQuery) || selectedStatus !== "all" || selectedModule !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("all");
    onModuleChange("all");
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3 w-full p-3 rounded-lg border border-neutral-200 select-none bg-white shadow-sm">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter permissions..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Module Filter */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-200 h-[34px]">
          <Layers className="h-4 w-4 text-neutral-400" />
          <span className="font-semibold text-xs uppercase tracking-wider">Module:</span>
          <select
            value={selectedModule}
            onChange={(e) => onModuleChange(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-neutral-900 font-semibold text-xs cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Modules</option>
            {availableModules.map((mod) => (
              <option key={mod} value={mod}>
                {mod.charAt(0).toUpperCase() + mod.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter (Segmented Control) */}
        <div className="flex bg-neutral-100 p-0.5 rounded-md border border-neutral-200 h-[34px]">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
                selectedStatus === status
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 h-[34px] text-xs font-semibold rounded-md border border-neutral-200 text-neutral-600 hover:text-black transition-colors cursor-pointer whitespace-nowrap bg-white hover:bg-neutral-50"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

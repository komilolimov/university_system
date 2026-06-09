"use client";

import React from "react";
import { Search, X } from "lucide-react";
import type { Employee } from "@/entities/employee";

interface EmployeeExperienceFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedEmployee: string;
  onEmployeeChange: (empId: string) => void;
  employees: Employee[];
}

export const EmployeeExperienceFiltersToolbar = ({
  searchQuery,
  onSearchChange,
  selectedEmployee,
  onEmployeeChange,
  employees,
}: EmployeeExperienceFiltersToolbarProps) => {
  const hasActiveFilters = Boolean(searchQuery) || Boolean(selectedEmployee);

  const clearFilters = () => {
    onSearchChange("");
    onEmployeeChange("");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full bg-white p-3 rounded-lg border border-neutral-200 shadow-sm select-none">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by company or job title..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>

      {/* Employee Filter */}
      <div className="w-full md:w-56">
        <select
          value={selectedEmployee}
          onChange={(e) => onEmployeeChange(e.target.value)}
          className="block w-full px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors cursor-pointer appearance-none text-black"
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id.toString()}>
              {emp.first_name} {emp.last_name}
            </option>
          ))}
        </select>
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

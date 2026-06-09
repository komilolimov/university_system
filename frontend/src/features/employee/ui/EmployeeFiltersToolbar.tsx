"use client";
import React from "react";
import { Search, X } from "lucide-react";
import type { Role } from "@/entities/role";
import type { Department } from "@/entities/department";

interface EmployeeFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: string;
  onRoleChange: (roleId: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (deptId: string) => void;
  selectedStatus: "all" | "active" | "inactive";
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  roles: Role[];
  departments: Department[];
}

export const EmployeeFiltersToolbar = ({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  roles,
  departments,
}: EmployeeFiltersToolbarProps) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedRole) ||
    Boolean(selectedDepartment) ||
    selectedStatus !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onRoleChange("");
    onDepartmentChange("");
    onStatusChange("all");
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
          placeholder="Search employees by name or email..."
          className="block w-full pl-9 pr-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-500"
        />
      </div>

      {/* Role Filter */}
      <div className="w-full md:w-48">
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="block w-full px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors cursor-pointer appearance-none text-black"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id.toString()}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      {/* Department Filter */}
      <div className="w-full md:w-56">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="block w-full px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors cursor-pointer appearance-none text-black"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id.toString()}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Toggle */}
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

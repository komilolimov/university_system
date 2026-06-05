"use client";

import { Search } from "lucide-react";

interface PermissionSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const PermissionSearch = ({ searchQuery, onSearchChange }: PermissionSearchProps) => {
  return (
    <div className="relative w-full md:w-96">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-neutral-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search permissions by name or module..."
        className="block w-full pl-9 pr-3 py-2 text-sm font-medium border border-neutral-200 rounded-md bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors text-black placeholder:text-neutral-400 shadow-sm"
      />
    </div>
  );
};

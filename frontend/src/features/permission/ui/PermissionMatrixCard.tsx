"use client";

import { ShieldCheck } from "lucide-react";
import type { Permission } from "@/entities/permission";

interface PermissionMatrixCardProps {
  groupName: string;
  permissions: Permission[];
  onToggle: (permission: Permission) => void;
  disabled?: boolean;
}

export const PermissionMatrixCard = ({
  groupName,
  permissions,
  onToggle,
  disabled = false,
}: PermissionMatrixCardProps) => {
  return (
    <div className="flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-neutral-300">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
        <ShieldCheck className="w-5 h-5 text-neutral-400" />
        <h3 className="text-sm font-semibold tracking-wide text-neutral-900 capitalize">
          {groupName}
        </h3>
      </div>
      <div className="flex flex-col p-2">
        {permissions.map((perm) => {
          const actionName = perm.name.split(":").pop() || perm.name;
          return (
            <label
              key={perm.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-50"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-900 capitalize">
                  {actionName}
                </span>
                {perm.description && (
                  <span className="text-xs text-neutral-500 mt-0.5">
                    {perm.description}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={perm.is_active}
                  disabled={disabled}
                  onChange={() => onToggle(perm)}
                  className="w-4 h-4 bg-white border-neutral-300 rounded text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black checked:text-white transition-all cursor-pointer disabled:cursor-not-allowed appearance-none flex items-center justify-center relative 
                  before:content-[''] checked:before:content-['✓'] before:text-white before:text-[10px] before:font-bold before:absolute"
                />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

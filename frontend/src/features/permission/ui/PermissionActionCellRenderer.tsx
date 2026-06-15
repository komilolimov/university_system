"use client";

import React, { useTransition } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { Permission } from "@/entities/permission";

export const PermissionActionCellRenderer = (params: ICellRendererParams<Permission> & {
  context: {
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (permission: Permission) => void;
    onToggleActive: (id: number, active: boolean) => void;
  }
}) => {
  const [isPending, startTransition] = useTransition();

  if (!params.data) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (params.context && params.context.onEdit) {
      params.context.onEdit(params.data!);
    }
  };

  const handleActivateToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const permId = params.data?.id;
    const currentActive = params.data?.is_active;
    if (!permId) return;
    
    startTransition(() => {
      if (params.context && params.context.onToggleActive) {
        params.context.onToggleActive(permId, !currentActive);
      }
    });
  };

  return (
    <div className="h-full flex items-center gap-2">
      {params.context.canEdit && (
        <button
          onClick={handleEdit}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer select-none"
        >
          Edit
        </button>
      )}

      {params.context.canDelete && (
        params.data.is_active ? (
          <button
            onClick={handleActivateToggle}
            disabled={isPending}
            className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-red-600 hover:text-red-700 hover:bg-red-50/50 hover:border-red-100 active:bg-red-100 transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            {isPending ? "..." : "Deactivate"}
          </button>
        ) : (
          <button
            onClick={handleActivateToggle}
            disabled={isPending}
            className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 hover:border-emerald-100 active:bg-emerald-100 transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            {isPending ? "..." : "Activate"}
          </button>
        )
      )}
    </div>
  );
};

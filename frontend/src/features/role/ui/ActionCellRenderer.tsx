"use client";

import React, { useTransition } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { Role } from "@/entities/role";

export const ActionCellRenderer = (params: ICellRendererParams<Role> & {
  context: {
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (role: Role) => void;
    onDelete: (id: number) => void;
    onActivate: (id: number) => void;
    onManagePermissions: (id: number) => void;
  }
}) => {
  const [isPending, startTransition] = useTransition();

  if (!params.data) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    params.context.onEdit(params.data!);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const roleId = params.data?.id;
    if (!roleId) return;
    startTransition(() => {
      params.context.onDelete(roleId);
    });
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const roleId = params.data?.id;
    if (!roleId) return;
    startTransition(() => {
      params.context.onActivate(roleId);
    });
  };

  const handleManagePermissions = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (params.context.onManagePermissions && params.data) {
      params.context.onManagePermissions(params.data.id);
    }
  };

  return (
    <div className="h-full flex items-center gap-2">
      {params.context.canEdit && (
        <>
          <button
            onClick={handleManagePermissions}
            className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-100 active:bg-indigo-100 transition-colors cursor-pointer select-none"
          >
            Permissions
          </button>

          <button
            onClick={handleEdit}
            className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer select-none"
          >
            Edit
          </button>
        </>
      )}

      {params.context.canDelete && (
        params.data.is_active ? (
          // Кнопка Archive (если активен)
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-red-600 hover:text-red-700 hover:bg-red-50/50 hover:border-red-100 active:bg-red-100 transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            {isPending ? "..." : "Archive"}
          </button>
        ) : (
          // Кнопка Activate (если не активен)
          <button
            onClick={handleActivate}
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
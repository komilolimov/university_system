"use client";

import React, { useTransition } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { CourseCatalog } from "@/entities/course-catalog";

export const ActionCellRenderer = (
  params: ICellRendererParams<CourseCatalog> & {
    context: {
      canMutate?: boolean;
      onEdit: (course: CourseCatalog) => void;
      onDelete: (id: number) => void;
      onActivate: (id: number) => void;
    };
  }
) => {
  const { data, context } = params;
  const [isPending, startTransition] = useTransition();

  if (!data || context?.canMutate === false) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    context.onEdit(data);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(() => {
      context.onDelete(data.id);
    });
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(() => {
      context.onActivate(data.id);
    });
  };

  return (
    <div className="h-full flex items-center gap-2">
      <button
        onClick={handleEdit}
        className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer select-none"
      >
        Edit
      </button>

      {data.is_active ? (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-red-600 hover:text-red-700 hover:bg-red-50/50 hover:border-red-100 active:bg-red-100 transition-colors cursor-pointer select-none disabled:opacity-50"
        >
          {isPending ? "..." : "Archive"}
        </button>
      ) : (
        <button
          onClick={handleActivate}
          disabled={isPending}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 hover:border-emerald-100 active:bg-emerald-100 transition-colors cursor-pointer select-none disabled:opacity-50"
        >
          {isPending ? "..." : "Activate"}
        </button>
      )}
    </div>
  );
};

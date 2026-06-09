"use client";

import React, { useTransition } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { CourseOffering } from "@/entities/course-offerings";

export const ActionCellRenderer = (
  params: ICellRendererParams<CourseOffering> & {
    context: {
      canMutate?: boolean;
      onEdit: (offering: CourseOffering) => void;
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
        className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-400 transition-colors cursor-pointer select-none bg-transparent"
      >
        Edit
      </button>

      {data.is_active ? (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer select-none disabled:opacity-50 bg-transparent"
        >
          {isPending ? "..." : "Archive"}
        </button>
      ) : (
        <button
          onClick={handleActivate}
          disabled={isPending}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer select-none disabled:opacity-50 bg-transparent"
        >
          {isPending ? "..." : "Activate"}
        </button>
      )}
    </div>
  );
};

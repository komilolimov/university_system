"use client";

import React, { useTransition } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import type { Term } from "@/entities/terms";

export const ActionCellRenderer = (
  props: CustomCellRendererProps<Term>
) => {
  const term = props.data;
  const { onEdit, onDelete, onActivate } = props.context || {};
  const [isPending, startTransition] = useTransition();

  if (!term) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(term);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!onDelete) return;

    startTransition(() => {
      onDelete(term.id);
    });
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!onActivate) return;

    startTransition(() => {
      onActivate(term.id);
    });
  };

  return (
    <div className="h-full flex items-center gap-2">
      {props.context?.canEdit && (
        <button
          onClick={handleEdit}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-400 transition-colors cursor-pointer select-none bg-transparent"
        >
          Edit
        </button>
      )}

      {props.context?.canDelete && (
        term.is_active !== false ? (
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
        )
      )}
    </div>
  );
};

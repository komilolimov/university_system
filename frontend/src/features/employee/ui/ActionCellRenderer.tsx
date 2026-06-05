"use client";

import React, { useTransition } from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { Employee } from "@/entities/employee";

export const ActionCellRenderer = (
  params: ICellRendererParams<Employee> & {
    context: {
      canMutate: boolean;
      onEdit: (employee: Employee) => void;
      onDelete: (id: number) => void;
      onActivate: (id: number) => void;
    };
  }
) => {
  const { data, context } = params;
  const [isPending, startTransition] = useTransition();

  if (!data || !context?.canMutate) return null;

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
        className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-50"
      >
        Edit
      </button>

      {data.is_active ? (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? "..." : "Archive"}
        </button>
      ) : (
        <button
          onClick={handleActivate}
          disabled={isPending}
          className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
        >
          {isPending ? "..." : "Activate"}
        </button>
      )}
    </div>
  );
};
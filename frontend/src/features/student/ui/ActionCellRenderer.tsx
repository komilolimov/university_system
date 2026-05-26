"use client";

import React, { useTransition } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { type Student } from "@/entities/student";

export const ActionCellRenderer = (props: CustomCellRendererProps<Student>) => {
  const student = props.data;
  const { onEdit, onDelete } = props.context || {};
  const [isPending, startTransition] = useTransition();

  if (!student) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(student);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${student.first_name} ${student.last_name}? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      startTransition(async () => {
        try {
          await onDelete(student.id);
        } catch (err: any) {
          alert(err.message || "Failed to delete student profile.");
        }
      });
    }
  };

  return (
    <div className="h-full flex items-center gap-2">
      <button
        onClick={handleEdit}
        className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer select-none"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="h-7 px-2.5 text-xs font-semibold rounded border border-neutral-200 bg-white text-red-600 hover:text-red-700 hover:bg-red-50/50 hover:border-red-100 active:bg-red-100 transition-colors cursor-pointer select-none disabled:opacity-50"
      >
        {isPending ? "..." : "Delete"}
      </button>
    </div>
  );
};

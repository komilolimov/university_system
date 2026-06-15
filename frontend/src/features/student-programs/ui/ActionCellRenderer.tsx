"use client";

import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import type { ICellRendererParams } from "ag-grid-community";
import type { StudentProgram } from "@/entities/student-programs";

export const ActionCellRenderer = (params: ICellRendererParams<StudentProgram>) => {
  const data = params.data;
  const canEdit = params.context?.canEdit;
  const canDelete = params.context?.canDelete;

  if (!data) return null;

  return (
    <div className="flex items-center gap-2 h-full">
      {canEdit && (
        <button
          onClick={() => params.context?.onEdit?.(data)}
          className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-md transition-colors"
          title="Edit Program"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {canDelete && (
        <button
          onClick={() => params.context?.onDelete?.(data.student_id, data.program_id)}
          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete Program"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

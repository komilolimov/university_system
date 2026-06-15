import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { Edit2, Trash2 } from "lucide-react";
import type { Building } from "@/entities/buildings";

interface ActionCellRendererProps extends ICellRendererParams<Building> {
  onEdit: (building: Building) => void;
  onDelete: (id: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ActionCellRenderer: React.FC<ActionCellRendererProps> = (params) => {
  if (!params.data) return null;

  return (
    <div className="flex items-center gap-3 h-full">
      {params.canEdit && (
        <button
          onClick={() => params.onEdit(params.data!)}
          className="text-neutral-400 hover:text-neutral-900 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      {params.canDelete && (
        <button
          onClick={() => params.onDelete(params.data!.id)}
          className="text-neutral-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

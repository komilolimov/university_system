import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import { Edit2, Trash2 } from "lucide-react";
import type { Room } from "@/entities/rooms";

interface ActionCellRendererProps extends ICellRendererParams<Room> {
  onEdit: (room: Room) => void;
  onDelete: (id: number) => void;
}

export const ActionCellRenderer: React.FC<ActionCellRendererProps> = (params) => {
  if (!params.data) return null;

  return (
    <div className="flex items-center gap-3 h-full">
      <button
        onClick={() => params.onEdit(params.data!)}
        className="text-neutral-400 hover:text-neutral-900 transition-colors"
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => params.onDelete(params.data!.id)}
        className="text-neutral-400 hover:text-red-600 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

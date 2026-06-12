"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getResearchLabs, 
  deleteResearchLab, 
  type ResearchLab 
} from "@/entities/research-lab";
import { ActionCellRenderer, ResearchLabFiltersToolbar, ResearchLabForm } from "@/features/research-lab";
import type { ColDef } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";
import { Plus } from "lucide-react";
import type { components } from "@/shared/api/schema";

type Department = components["schemas"]["DepartmentRead"];

interface ResearchLabsDataGridProps {
  canMutate?: boolean;
}

export const ResearchLabsDataGrid = ({ canMutate = true }: ResearchLabsDataGridProps) => {

  const [labs, setLabs] = useState<ResearchLab[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<ResearchLab | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load departments for grid rendering
  useEffect(() => {
    import("@/entities/department/api/api").then(({ getDepartments }) => {
      getDepartments({ limit: 1000 })
        .then((data) => {
          setDepartments(data);
        })
        .catch((err: unknown) => {
          console.error("Failed to load departments for grid:", err);
        });
    });
  }, []);

  const fetchRecords = () => {
    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);
    
    getResearchLabs({
      q: debouncedSearch.trim() || null,
      limit: 1000 
    })
      .then((data) => {
        clearTimeout(timer);
        setLabs(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error(
            "Failed to load research labs",
            err.message
          );
        }
      })
      .finally(() => setLoading(false));
  };

  // Trigger load on filter modifications
  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleEdit = (lab: ResearchLab) => {
    setEditingLab(lab);
    setIsFormOpen(true);
  };

  const executeDelete = async (id: number) => {
    const toastId = toast.loading("Deleting research lab...", "This might take a second.");
    
    try {
      await deleteResearchLab(id);
      fetchRecords();
      toast.dismiss(toastId);
      toast.success(
        "Research lab deleted",
        "The research lab has been successfully deleted."
      );
    } catch (err: unknown) {
      toast.dismiss(toastId);
      if (err instanceof Error) {
        toast.error(
          "Failed to delete research lab",
          err.message
        );
      } else {
        toast.error(
          "Error",
          "Unexpected error occurred."
        );
      }
    }
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Delete Research Lab",
      "Are you sure you want to delete this research lab? This action cannot be undone.",
      () => {
        startTransition(() => {
          executeDelete(id);
        });
      }
    );
  };

  const gridContext = useMemo(() => ({
    onEdit: handleEdit,
    onDelete: handleDelete,
  }), [labs]);

  const columnDefs = useMemo<ColDef<ResearchLab>[]>(() => {
    const cols: ColDef<ResearchLab>[] = [
      {
        field: "name",
        headerName: "Lab Name",
        flex: 2,
      },
      {
        headerName: "Department",
        flex: 1.5,
        valueGetter: (params) => {
          const data = params.data;
          if (!data?.department_id) return "Unassigned";

          const dept = departments.find(
            (d) => d.id === data.department_id
          );

          return dept ? dept.name : "Unknown";
        },
      },
    ];

    if (canMutate) {
      cols.push({
        headerName: "Actions",
        width: 150,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
      });
    }

    return cols;
  }, [canMutate, departments]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Research Labs
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage university research laboratories and centers.
          </p>
        </div>

        {canMutate && (
          <button
            onClick={() => {
              setEditingLab(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lab
          </button>
        )}
      </div>

      <ResearchLabFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={labs}
          columnDefs={columnDefs}
          context={gridContext}
          height={600}
        />
      </div>

      <ResearchLabForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        lab={editingLab}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};

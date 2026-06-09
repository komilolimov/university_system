"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getSchools, 
  deleteSchool, 
  type School 
} from "@/entities/school";
import { ActionCellRenderer, SchoolFiltersToolbar, SchoolForm } from "@/features/school";
import type { ColDef } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";
import { Plus } from "lucide-react";

interface SchoolDataGridProps {
  canMutate?: boolean;
}

export const SchoolDataGrid = ({ canMutate = true }: SchoolDataGridProps) => {

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchRecords = () => {
    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);
    
    getSchools({
      q: debouncedSearch.trim() || null,
      limit: 100 
    })
      .then((data) => {
        clearTimeout(timer);
        setSchools(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error(
            "Failed to load schools",
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

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setIsFormOpen(true);
  };

  const executeDelete = async (id: number) => {
    const toastId = toast.loading("Deleting school...", "This might take a second.");
    
    try {
      await deleteSchool(id);
      fetchRecords();
      toast.dismiss(toastId);
      toast.success(
        "School deleted",
        "The school has been successfully deleted."
      );
    } catch (err: unknown) {
      toast.dismiss(toastId);
      if (err instanceof Error) {
        toast.error(
          "Failed to delete school",
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
      "Delete School",
      "Are you sure you want to delete this school? This action cannot be undone.",
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
  }), [schools]);

  const columnDefs = useMemo<ColDef<School>[]>(() => {
    const cols: ColDef<School>[] = [
      {
        field: "name",
        headerName: "School Name",
        flex: 1,
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
  }, [canMutate]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Schools Directory
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage university schools and faculties.
          </p>
        </div>

        {canMutate && (
          <button
            onClick={() => {
              setEditingSchool(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add School
          </button>
        )}
      </div>

      <SchoolFiltersToolbar
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
          rowData={schools}
          columnDefs={columnDefs}
          context={gridContext}
          height={600}
        />
      </div>

      <SchoolForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        school={editingSchool}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};

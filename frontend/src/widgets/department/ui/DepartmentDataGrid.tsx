"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getDepartments, 
  deleteDepartment, 
  type Department 
} from "@/entities/department";
import { ActionCellRenderer, DepartmentFiltersToolbar, DepartmentForm } from "@/features/department";
import type { ColDef } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";
import { Plus } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

type School = components["schemas"]["SchoolRead"];

interface DepartmentDataGridProps {
  canMutate?: boolean;
}

export const DepartmentDataGrid = ({ canMutate = true }: DepartmentDataGridProps) => {

  const [departments, setDepartments] = useState<Department[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load schools for grid rendering
  useEffect(() => {
    import("@/entities/school").then(({ getSchools }) => {
      getSchools()
        .then((data) => {
          setSchools(data);
        })
        .catch((err: unknown) => {
          console.error("Failed to load schools for grid:", err);
        });
    });
  }, []);

  const fetchRecords = () => {
    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);
    
    getDepartments({
      q: debouncedSearch.trim() || null,
      limit: 1000 
    })
      .then((data) => {
        clearTimeout(timer);
        setDepartments(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error(
            "Failed to load departments",
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

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const executeDelete = async (id: number) => {
    const toastId = toast.loading("Deleting department...", "This might take a second.");
    
    try {
      await deleteDepartment(id);
      fetchRecords();
      toast.dismiss(toastId);
      toast.success(
        "Department deleted",
        "The department has been successfully deleted."
      );
    } catch (err: unknown) {
      toast.dismiss(toastId);
      if (err instanceof Error) {
        toast.error(
          "Failed to delete department",
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
      "Delete Department",
      "Are you sure you want to delete this department? This action cannot be undone.",
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
  }), [departments]);

  const columnDefs = useMemo<ColDef<Department>[]>(() => {
    const cols: ColDef<Department>[] = [
      {
        field: "name",
        headerName: "Department Name",
        flex: 2,
      },
      {
        headerName: "School / Faculty",
        flex: 1.5,
        valueGetter: (params) => {
          const data = params.data;
          if (!data?.school_id) return "Unassigned";

          const school = schools.find(
            (s) => s.id === data.school_id
          );

          return school ? school.name : "Unknown";
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
  }, [canMutate, schools]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Departments Directory
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage university departments and their associated schools.
          </p>
        </div>

        {canMutate && (
          <button
            onClick={() => {
              setEditingDepartment(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      <DepartmentFiltersToolbar
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
          rowData={departments}
          columnDefs={columnDefs}
          context={gridContext}
          height={600}
        />
      </div>

      <DepartmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        department={editingDepartment}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};

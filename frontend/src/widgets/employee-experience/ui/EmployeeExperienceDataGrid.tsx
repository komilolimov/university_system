"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { Plus } from "lucide-react";
import { toast } from "@/shared/lib/toast";

import { 
  getEmployeeExperiences, 
  deleteEmployeeExperience,
  type EmployeeExperience 
} from "@/entities/employee-experience";

import { 
  getEmployees,
  type Employee 
} from "@/entities/employee";

import { 
  EmployeeExperienceForm, 
  ActionCellRenderer, 
  EmployeeExperienceFiltersToolbar 
} from "@/features/employee-experience";

import type { ColDef } from "ag-grid-community";

interface EmployeeExperienceDataGridProps {
  canMutate?: boolean;
}

export const EmployeeExperienceDataGrid = ({ canMutate = true }: EmployeeExperienceDataGridProps) => {
  const [experiences, setExperiences] = useState<EmployeeExperience[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [experienceToEdit, setExperienceToEdit] = useState<EmployeeExperience | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Reference Data (Employees)
  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => console.error("Failed to load reference data", err));
  }, []);

  // Fetch Experiences
  const fetchExperiences = () => {
    // Schedule loading state update asynchronously to avoid the
    // "Calling setState synchronously within an effect" linter warning.
    const timer = setTimeout(() => setLoading(true), 0);
    
    getEmployeeExperiences()
      .then((data) => {
        clearTimeout(timer);
        setExperiences(data);
      })
      .catch((err) => {
        if (err instanceof Error) {
          toast.error("Failed to load experiences", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  // Filter logic applied on the client side
  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const lowerQuery = debouncedSearch.toLowerCase();
      const matchesSearch = 
        !debouncedSearch || 
        exp.company_name.toLowerCase().includes(lowerQuery) ||
        exp.job_title.toLowerCase().includes(lowerQuery);
        
      const matchesEmployee = !selectedEmployee || exp.employee_id.toString() === selectedEmployee;

      return matchesSearch && matchesEmployee;
    });
  }, [experiences, debouncedSearch, selectedEmployee]);

  // Handlers
  const handleEdit = (exp: EmployeeExperience) => {
    setExperienceToEdit(exp);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Delete Experience",
      "Are you sure you want to delete this experience? This action cannot be undone.",
      () => {
        startTransition(() => {
          deleteEmployeeExperience(id)
            .then(() => {
              toast.success("Experience deleted");
              fetchExperiences();
            })
            .catch((err: unknown) => {
              if (err instanceof Error) {
                toast.error("Failed to delete", err.message);
              }
            });
        });
      }
    );
  };

  // AG Grid Columns
  const columnDefs = useMemo<ColDef<EmployeeExperience>[]>(() => {
    const cols: ColDef<EmployeeExperience>[] = [
      {
        field: "employee_id",
        headerName: "Employee",
        flex: 1.5,
        valueFormatter: (params) => {
          if (!params.value) return "-";
          const emp = employees.find((e) => e.id === params.value);
          return emp ? `${emp.first_name} ${emp.last_name}` : `ID: ${params.value}`;
        },
      },
      {
        field: "company_name",
        headerName: "Company",
        flex: 1,
      },
      {
        field: "job_title",
        headerName: "Job Title",
        flex: 1,
      },
      {
        field: "start_date",
        headerName: "Start Date",
        flex: 1,
      },
      {
        field: "end_date",
        headerName: "End Date",
        flex: 1,
        valueFormatter: (params) => params.value || "Present",
      },
    ];

    if (canMutate) {
      cols.push({
        headerName: "Actions",
        flex: 1,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
      });
    }

    return cols;
  }, [canMutate, employees]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Employee Experience
          </h2>
          <p className="text-sm text-neutral-500">
            Manage staff work history and previous positions
          </p>
        </div>
        {canMutate && (
          <button
            onClick={() => {
              setExperienceToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        )}
      </div>

      {/* Toolbar */}
      <EmployeeExperienceFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        employees={employees}
      />

      {/* Grid */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={filteredExperiences}
          columnDefs={columnDefs}
          context={{
            canMutate,
            onEdit: handleEdit,
            onDelete: handleDelete,
          }}
          height={600}
        />
      </div>

      {/* Form Modal */}
      <EmployeeExperienceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        experience={experienceToEdit}
        employees={employees}
        onSubmitSuccess={fetchExperiences}
      />
    </div>
  );
};

"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getStudents, 
  deleteStudent, 
  getAdvisors,
  updateStudent,
  type Student, 
  type Employee, 
  type RegionType 
} from "@/entities/student";
import { StudentForm, ActionCellRenderer, StudentFiltersToolbar } from "@/features/student";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";

export const StudentsDataGrid = () => {

  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionType | "">("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("active");

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isPending, startTransition] = useTransition();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load advisors once
  useEffect(() => {
    getAdvisors()
      .then(setAdvisors)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          console.error("Failed to load advisors for grid filter:", err.message);
        }
      });
  }, []);

  // Fetch student records based on filter metrics
  const fetchRecords = () => {
    // Schedule state updates asynchronously to avoid the
    // "Calling setState synchronously within an effect" linter warning.
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);
    
    const parsedAdvisorId = selectedAdvisor ? parseInt(selectedAdvisor, 10) : null;
    const parsedIsActive = selectedStatus === "all" ? null : selectedStatus === "active";
    
    getStudents({
      q: debouncedSearch.trim() || null,
      region: selectedRegion || null,
      advisor_id: parsedAdvisorId,
      is_active: parsedIsActive,
    })
      .then((data) => {
        clearTimeout(timer);
        setStudents(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message || "Failed to load students.");
        } else {
          setError("An unexpected error occurred while loading students.");
        }
      })
      .finally(() => setLoading(false));
  };

  // Trigger load on filter modifications
  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedRegion, selectedAdvisor, selectedStatus]);

  // Handle Edit Action from Cell Renderer
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  // 1. Фактическое удаление (вызывается только после подтверждения)
  const executeDelete = async (id: number) => {
    const toastId = toast.loading("Archiving student...", "This might take a second.");
    
    try {
      await deleteStudent(id);
      fetchRecords();
      
      toast.dismiss(toastId);
      toast.success("Student archived", "The record has been moved to inactive status.");
    } catch (err: unknown) {
      toast.dismiss(toastId);
      if (err instanceof Error) {
        toast.error("Failed to archive student", err.message);
      } else {
        toast.error("Error", "An unexpected error occurred.");
      }
    }
  };

  // 2. Показ тоста с подтверждением при клике на корзину
  const handleDelete = (id: number) => {
    toast.confirm(
      "Are you sure?", 
      "This will move the student to the inactive list.", 
      () => executeDelete(id)
    );
  };

const handleActivate = (id: number) => {
  const student = students.find((s) => s.id === id);

  if (!student) {
    toast.error("Student not found");
    return;
  }

  startTransition(() => {
    updateStudent(id, {
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      region: student.region,
      enrollment_date: student.enrollment_date,
      advisor_id: student.advisor_id,
      is_active: true,
    })
      .then(() => {
        toast.success("Student activated");
        fetchRecords();
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error("Failed to activate student", err.message);
        }
      });
  });
};

  // Context passed to AG Grid cell renderers
  const gridContext = useMemo(() => ({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onActivate: handleActivate,
  }), [students]);

  // Column definitions for AG Grid
  const columnDefs = useMemo<ColDef<Student>[]>(() => [
    {
      field: "id",
      headerName: "ID",
      maxWidth: 80,
      filter: "agNumberColumnFilter",
      sort: "asc",
    },
    {
      headerName: "Full Name",
      valueGetter: (params) => {
        if (!params.data) return "";
        return `${params.data.first_name} ${params.data.last_name}`;
      },
      minWidth: 160,
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 200,
    },
    {
      field: "region",
      headerName: "Region",
      maxWidth: 120,
    },
    {
      field: "enrollment_date",
      headerName: "Enrollment Date",
      maxWidth: 150,
      valueFormatter: (params) => params.value || "N/A",
    },
    {
      headerName: "Academic Advisor",
      minWidth: 180,
      valueGetter: (params) => {
        const data = params.data;
        if (!data || !data.advisor_id) return "Unassigned";
        const advisor = advisors.find((a) => a.id === data.advisor_id);
        return advisor ? `${advisor.first_name} ${advisor.last_name}` : `ID: ${data.advisor_id}`;
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams<Student>) => {
        const active = params.value as boolean;
        return (
          <div className="h-full flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none transition-colors border ${
              active 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-neutral-100 text-neutral-500 border-neutral-200"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${active ? "bg-green-500" : "bg-neutral-400"}`} />
              {active ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Actions",
      maxWidth: 160,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: ActionCellRenderer,
    }
  ], [advisors]);

  // Open creation modal
  const handleAddNew = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Action Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <h2 className="text-lg font-semibold tracking-tighter text-neutral-900">
          Student Registrations ({students.length})
        </h2>
        <button
          onClick={handleAddNew}
          className="h-9 px-4 text-sm font-semibold rounded-md bg-black text-neutral-50 hover:bg-neutral-900 active:bg-black transition-colors cursor-pointer select-none"
        >
          Add Student
        </button>
      </div>

      {/* Filter Toolbar */}
      <StudentFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedAdvisor={selectedAdvisor}
        onAdvisorChange={setSelectedAdvisor}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        advisors={advisors}
      />

      {/* Main Grid Wrapper */}
      <div className="w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 bg-neutral-50/70 z-10 flex items-center justify-center backdrop-blur-3xs rounded-lg select-none">
            <div className="flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-neutral-100 rounded-md shadow-sm">
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-semibold text-neutral-700">Loading student directory...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-semibold select-none mb-4">
            Error: {error}
          </div>
        )}

        <DataGrid
          rowData={students}
          columnDefs={columnDefs}
          context={gridContext}
          height={540}
        />
      </div>

      {/* Shared Edit/Create Student Form Modal */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};
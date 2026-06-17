"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
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
import { Plus } from "lucide-react";

interface StudentsDataGridProps {
  canWrite?: boolean;
  canDelete?: boolean;
}

export const StudentsDataGrid = ({ canWrite = true, canDelete = true }: StudentsDataGridProps) => {

  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionType | "">("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isPending, startTransition] = useTransition();

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


  const fetchRecords = () => {
    const timer = setTimeout(() => {
      setLoading(true);
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
          toast.error(
            "Failed to load students",
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
    "Archive Student",
    "Are you sure you want to archive this student? They will no longer appear in the active directory.",
    () => {
      startTransition(() => {
        deleteStudent(id)
          .then(() => {
            toast.success("Student archived");
            fetchRecords();
          })
          .catch((err: unknown) => {
            if (err instanceof Error) {
              toast.error("Failed to archive", err.message);
            }
          });
      });
    }
  );
};

const handleActivate = (id: number) => {
  const student = students.find((s) => s.id === id);

  if (!student) {
    toast.error("Student not found");
    return;
  }

  startTransition(async () => {
    const toastId = toast.loading(
      "Activating student...",
      "Please wait."
    );

    try {
      await updateStudent(id, {
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        region: student.region,
        enrollment_date: student.enrollment_date,
        advisor_id: student.advisor_id,
        is_active: true,
      });

      fetchRecords();

      toast.dismiss(toastId);

      toast.success(
        "Student activated",
        "Student is now active."
      );
    } catch (err: unknown) {
      toast.dismiss(toastId);

      if (err instanceof Error) {
        toast.error(
          "Failed to activate student",
          err.message
        );
      } else {
        toast.error(
          "Error",
          "Unexpected error occurred."
        );
      }
    }
  });
};

  // Context passed to AG Grid cell renderers
  const gridContext = useMemo(() => ({
    canEdit: canWrite,
    canDelete: canDelete,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onActivate: handleActivate,
  }), [students, canWrite, canDelete]);

// Column definitions for AG Grid
const columnDefs = useMemo<ColDef<Student>[]>(() => {
  const cols: ColDef<Student>[] = [
    {
      field: "first_name",
      headerName: "First Name",
      flex: 1,
      minWidth: 140,
      pinned: "left",
      filter: false,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      flex: 1,
      minWidth: 140,
      filter: false,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 180,
      filter: false,
    },
    {
      field: "region",
      headerName: "Region",
      flex: 1,
      minWidth: 120,
      filter: false,
    },
    {
      field: "enrollment_date",
      headerName: "Enrollment Date",
      flex: 1,
      minWidth: 150,
      filter: false,
      valueFormatter: (params) => params.value || "-",
    },
    {
      headerName: "Advisor",
      flex: 1.5,
      minWidth: 160,
      filter: false,
      valueGetter: (params) => {
        const data = params.data;
        if (!data?.advisor_id) return "Unassigned";

        const advisor = advisors.find(
          (a) => a.id === data.advisor_id
        );

        return advisor
          ? `${advisor.first_name} ${advisor.last_name}`
          : "Unknown";
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
      minWidth: 120,
      filter: false,
      valueFormatter: (params) =>
        params.value ? "Active" : "Inactive",
      cellRenderer: (
        params: ICellRendererParams<Student, boolean>
      ) => {
        const isActive = params.value;

        return (
          <div className="h-full flex items-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none transition-colors border ${
                isActive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-neutral-100 text-neutral-500 border-neutral-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                  isActive
                    ? "bg-green-500"
                    : "bg-neutral-400"
                }`}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
  ];

  if (canWrite || canDelete) {
    cols.push({
      headerName: "Actions",
      width: 100,
      minWidth: 100,
      sortable: false,
      filter: false,
      pinned: "right",
      cellRenderer: ActionCellRenderer,
    });
  }

  return cols;
}, [advisors, canWrite, canDelete]);

  // Open creation modal
  const handleAddNew = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-4">  
      {/* Action Header bar */}
      <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
          Student Directory
        </h2>

        <p className="text-sm text-neutral-500">
          Manage student records and advisor assignments
        </p>
      </div>

      {canWrite && (
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      )}
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

      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={students}
          columnDefs={columnDefs}
          context={gridContext}
          height={600}
        />
      </div>
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        student={editingStudent}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};
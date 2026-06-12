"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getEnrollments, 
  updateEnrollment, 
  type Enrollment,
  type EnrollmentStatus
} from "@/entities/enrollment";
import { ActionCellRenderer, EnrollmentFiltersToolbar, EnrollmentForm, StatusCellRenderer } from "@/features/enrollment";
import type { ColDef } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";
import { Plus } from "lucide-react";
import type { components } from "@/shared/api/schema";
import { type CourseCatalog } from "@/entities/course-catalog";
import { type CourseOffering } from "@/entities/course-offerings";

type Student = components["schemas"]["StudentRead"];

interface EnrollmentsDataGridProps {
  canMutate?: boolean;
}

export const EnrollmentsDataGrid = ({ canMutate = true }: EnrollmentsDataGridProps) => {

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load programs and courses for grid rendering
  useEffect(() => {
    Promise.all([
      import("@/entities/student/api/api").then((mod) => mod.getStudents({ limit: 1000 })),
      import("@/entities/course-offerings/api/api").then((mod) => mod.getCourseOfferings()),
      import("@/entities/course-catalog/api/api").then((mod) => mod.getCourseCatalogs({ limit: 1000 }))
    ])
      .then(([studentsData, offeringsData, catalogsData]) => {
        setStudents(studentsData);
        setOfferings(offeringsData);
        setCatalogs(catalogsData);
      })
      .catch((err: unknown) => {
        console.error("Failed to load reference data for grid:", err);
      });
  }, []);

  const fetchRecords = () => {
    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);
    
    // The getEnrollments API doesn't support 'q' text search natively since it relies on student_id and offering_id
    // But we can filter by status. For search query, we will filter locally.
    getEnrollments({
      status: statusFilter || null,
      limit: 1000 
    })
      .then((data) => {
        clearTimeout(timer);
        
        let filtered = data;
        // Local text filtering if searchQuery is typed
        if (debouncedSearch.trim()) {
          const lowerSearch = debouncedSearch.toLowerCase();
          filtered = data.filter(e => {
            const stu = students.find(s => s.id === e.student_id);
            const off = offerings.find(o => o.id === e.offering_id);
            const cat = off ? catalogs.find(c => c.id === off.catalog_id) : null;
            
            const studentStr = stu ? `${stu.first_name} ${stu.last_name} ${stu.email}`.toLowerCase() : "";
            const courseStr = cat ? `${cat.code} ${cat.title}`.toLowerCase() : "";
            
            return studentStr.includes(lowerSearch) || courseStr.includes(lowerSearch) || e.status.toLowerCase().includes(lowerSearch);
          });
        }
        
        setEnrollments(filtered);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error(
            "Failed to load enrollments",
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
  }, [debouncedSearch, statusFilter]);

  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setIsFormOpen(true);
  };

  const handleChangeStatus = async (req: Enrollment, newStatus: EnrollmentStatus) => {
    const toastId = toast.loading("Updating status...", "Saving changes.");
    
    try {
      await updateEnrollment(req.student_id, req.offering_id, {
        status: newStatus,
        grade: newStatus === "Dropped" ? null : req.grade,
        credits_earned: newStatus === "Dropped" ? null : req.credits_earned
      });
      fetchRecords();
      toast.dismiss(toastId);
      toast.success("Status updated", `Enrollment status changed to ${newStatus}.`);
    } catch (err: unknown) {
      toast.dismiss(toastId);
      if (err instanceof Error) {
        toast.error("Failed to update status", err.message);
      } else {
        toast.error("Error", "Unexpected error occurred.");
      }
    }
  };

  const gridContext = useMemo(() => ({
    onEdit: handleEdit,
    onChangeStatus: handleChangeStatus,
  }), [enrollments]);

  const columnDefs = useMemo<ColDef<Enrollment>[]>(() => {
    const cols: ColDef<Enrollment>[] = [
      {
        headerName: "Student",
        flex: 2,
        valueGetter: (params) => {
          const data = params.data;
          if (!data?.student_id) return "Unknown";
          const stu = students.find((s) => s.id === data.student_id);
          return stu ? `${stu.first_name} ${stu.last_name}` : `Student #${data.student_id}`;
        },
      },
      {
        headerName: "Course",
        flex: 2,
        valueGetter: (params) => {
          const data = params.data;
          if (!data?.offering_id) return "Unknown";
          const off = offerings.find((o) => o.id === data.offering_id);
          const cat = off ? catalogs.find((c) => c.id === off.catalog_id) : null;
          return cat ? `${cat.code} - ${cat.title}` : `Offering #${data.offering_id}`;
        },
      },
      {
        headerName: "Status",
        field: "status",
        width: 150,
        cellRenderer: canMutate ? StatusCellRenderer : undefined,
      },
      {
        headerName: "Grade",
        field: "grade",
        width: 100,
        valueFormatter: (params) => params.value ? params.value : "-",
      },
      {
        headerName: "Credits",
        field: "credits_earned",
        width: 100,
        valueFormatter: (params) => params.value ? params.value.toString() : "-",
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
  }, [canMutate, students, offerings, catalogs]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Enrollments
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage student course registrations, waitlists, and grades.
          </p>
        </div>

        {canMutate && (
          <button
            onClick={() => {
              setEditingEnrollment(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Enrollment
          </button>
        )}
      </div>

      <EnrollmentFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={enrollments}
          columnDefs={columnDefs}
          context={gridContext}
          height={600}
        />
      </div>

      <EnrollmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        enrollment={editingEnrollment}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};

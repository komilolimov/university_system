"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { Plus } from "lucide-react";
import {
  getCourseCatalogs,
  deleteCourseCatalog,
  updateCourseCatalog,
  type CourseCatalog,
} from "@/entities/course-catalog";
import { CourseCatalogForm, ActionCellRenderer, CourseCatalogFiltersToolbar } from "@/features/course-catalog";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";

interface CourseCatalogDataGridProps {
  canWrite?: boolean;
  canDelete?: boolean;
}

export const CourseCatalogDataGrid = ({ canWrite = true, canDelete = true }: CourseCatalogDataGridProps) => {
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseCatalog | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Courses
  const fetchCourses = async (status: "all" | "active" | "inactive" = selectedStatus, searchStr: string = debouncedSearch) => {
    setLoading(true);
    const isActiveParam = status === "active" ? true : status === "inactive" ? false : undefined;
    
    try {
      const data = await getCourseCatalogs({ is_active: isActiveParam, q: searchStr, limit: 1000 });
      setCourses(data);
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to load courses", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const isActiveParam = selectedStatus === "active" ? true : selectedStatus === "inactive" ? false : undefined;
      
      try {
        const data = await getCourseCatalogs({ is_active: isActiveParam, q: debouncedSearch, limit: 1000 });
        setCourses(data);
      } catch (err) {
        if (err instanceof Error) {
          toast.error("Failed to load courses", err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedStatus, debouncedSearch]);

  // Handlers
  const handleEdit = (course: CourseCatalog) => {
    setCourseToEdit(course);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Archive Course",
      "Are you sure you want to archive this course? It will be deactivated.",
      () => {
        startTransition(() => {
          deleteCourseCatalog(id)
            .then(() => {
              toast.success("Course archived", "The course has been successfully archived.");
              fetchCourses(selectedStatus, debouncedSearch);
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
    const course = courses.find((c) => c.id === id);

    if (!course) {
      toast.error("Course not found");
      return;
    }

    startTransition(() => {
      // Just passing is_active: true to mirror the PATCH semantics
      updateCourseCatalog(id, {
        is_active: true,
      })
        .then(() => {
          toast.success("Course activated", "The course is now active.");
          fetchCourses(selectedStatus, debouncedSearch);
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            toast.error("Failed to activate course", err.message);
          }
        });
    });
  };

  // AG Grid Columns
  const columnDefs = useMemo<ColDef<CourseCatalog>[]>(() => {
    const cols: ColDef<CourseCatalog>[] = [
      {
        field: "code",
        headerName: "Code",
        flex: 1,
      },
      {
        field: "title",
        headerName: "Title",
        flex: 2,
      },
      {
        field: "credits",
        headerName: "Credits",
        flex: 1,
      },
      {
        field: "is_active",
        headerName: "Status",
        flex: 1,
        valueFormatter: (params) => (params.value ? "Active" : "Inactive"),
        cellRenderer: (params: ICellRendererParams<CourseCatalog, boolean>) => {
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
                    isActive ? "bg-green-500" : "bg-neutral-400"
                  }`}
                />
                {isActive ? "Active" : "Archived"}
              </span>
            </div>
          );
        },
      },
    ];

    if (canWrite || canDelete) {
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
  }, [canWrite, canDelete]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Course Catalog
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Create and manage university courses
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => {
              setCourseToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        )}
      </div>

      {/* Toolbar */}
      <CourseCatalogFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Grid */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={courses}
          columnDefs={columnDefs}
          context={{
            canEdit: canWrite,
            canDelete: canDelete,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onActivate: handleActivate,
          }}
          height={600}
        />
      </div>

      {/* Form Modal */}
      <CourseCatalogForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        course={courseToEdit}
        onSubmitSuccess={() => fetchCourses(selectedStatus, debouncedSearch)}
      />
    </div>
  );
};

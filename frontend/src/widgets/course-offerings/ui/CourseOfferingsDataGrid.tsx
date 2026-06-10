"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { Plus } from "lucide-react";
import {
  getCourseOfferings,
  deleteCourseOffering,
  updateCourseOffering,
  type CourseOffering,
} from "@/entities/course-offerings";
import { ActionCellRenderer, CourseOfferingForm, CourseOfferingsFiltersToolbar } from "@/features/course-offerings";
import { getCourseCatalogs, type CourseCatalog } from "@/entities/course-catalog";
import { getTerms, type Term } from "@/entities/terms";
import { getEmployees, type Employee } from "@/entities/employee";
import { getRooms, type Room } from "@/entities/rooms";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";

export const CourseOfferingsDataGrid = () => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [offeringToEdit, setOfferingToEdit] = useState<CourseOffering | null>(null);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOfferings = (status: "all" | "active" | "inactive" = selectedStatus) => {
    const timer = setTimeout(() => setLoading(true), 0);
    
    let isActiveParam: boolean | undefined = undefined;
    if (status === "active") isActiveParam = true;
    if (status === "inactive") isActiveParam = false;
    
    Promise.all([
      getCourseOfferings({ is_active: isActiveParam }),
      getCourseCatalogs({ limit: 100 }),
      getTerms(),
      getEmployees({ limit: 100 }),
      getRooms({ limit: 100 })
    ])
      .then(([data, catalogsData, termsData, employeesData, roomsData]) => {
        clearTimeout(timer);
        setOfferings(data);
        setCatalogs(catalogsData);
        setTerms(termsData);
        setEmployees(employeesData);
        setRooms(roomsData);
      })
      .catch((err) => {
        if (err instanceof Error) {
          toast.error("Failed to load offerings", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOfferings(selectedStatus);
  }, [selectedStatus]);

  // Filter Logic (Client-side search)
  const filteredOfferings = useMemo(() => {
    return offerings.filter((offering) => {
      const scheduleString = offering.schedule_blocks || "";
      return (
        scheduleString.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        offering.catalog_id.toString().includes(debouncedSearch) ||
        offering.term_id.toString().includes(debouncedSearch)
      );
    });
  }, [offerings, debouncedSearch]);

  // Handlers
  const handleEdit = (offering: CourseOffering) => {
    setOfferingToEdit(offering);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Archive Offering",
      "Are you sure you want to archive this offering?",
      () => {
        startTransition(() => {
          deleteCourseOffering(id)
            .then(() => {
              toast.success("Offering archived", "The offering has been successfully archived.");
              fetchOfferings(selectedStatus);
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
    const offering = offerings.find((o) => o.id === id);

    if (!offering) {
      toast.error("Offering not found");
      return;
    }

    startTransition(() => {
      updateCourseOffering(id, {
        is_active: true,
      })
        .then(() => {
          toast.success("Offering activated", "The offering is now active.");
          fetchOfferings(selectedStatus);
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            toast.error("Failed to activate offering", err.message);
          }
        });
    });
  };

  // AG Grid Columns
  const columnDefs = useMemo<ColDef<CourseOffering>[]>(() => {
    return [
      {
        headerName: "Course",
        field: "catalog_id",
        flex: 2,
        valueGetter: (params) => {
          if (!params.data) return "";
          const c = catalogs.find((cat) => cat.id === params.data?.catalog_id);
          return c ? `${c.code} - ${c.title}` : `Catalog #${params.data.catalog_id}`;
        }
      },
      {
        field: "term_id",
        headerName: "Term",
        flex: 1,
        valueGetter: (params) => {
          if (!params.data) return "";
          const t = terms.find((term) => term.id === params.data?.term_id);
          return t ? t.name : `Term #${params.data.term_id}`;
        }
      },
      {
        headerName: "Instructor",
        field: "primary_instructor_id",
        width: 150,
        valueGetter: (params) => {
          if (!params.data) return "";
          const e = employees.find((emp) => emp.id === params.data?.primary_instructor_id);
          return e ? `${e.first_name} ${e.last_name}` : "TBD";
        }
      },
      {
        headerName: "Room",
        field: "room_id",
        width: 130,
        valueGetter: (params) => {
          if (!params.data || !params.data.room_id) return "N/A";
          const r = rooms.find((rm) => rm.id === params.data?.room_id);
          return r ? `${r.room_number}` : `Room #${params.data.room_id}`;
        }
      },
      {
        headerName: "Schedule",
        field: "schedule_blocks",
        flex: 2,
        valueFormatter: (params) => params.value ? params.value : "TBD",
      },
      {
        headerName: "Capacity",
        flex: 1,
        valueGetter: (params) => {
          if (!params.data) return "";
          return `${params.data.max_capacity}`;
        },
      },
      {
        field: "is_active",
        headerName: "Status",
        flex: 1,
        valueFormatter: (params) => (params.value ? "Active" : "Inactive"),
        cellRenderer: (params: ICellRendererParams<CourseOffering, boolean>) => {
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
      {
        headerName: "Actions",
        flex: 1,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
      },
    ];
  }, []);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Course Offerings
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Manage terms, instructors, and capacities
          </p>
        </div>
        <button
          onClick={() => {
            setOfferingToEdit(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Offering
        </button>
      </div>

      {/* Toolbar */}
      <CourseOfferingsFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Grid */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden shadow-sm bg-transparent">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={filteredOfferings}
          columnDefs={columnDefs}
          context={{
            onEdit: handleEdit,
            onDelete: handleDelete,
            onActivate: handleActivate,
          }}
          height={600}
        />
      </div>

      {/* Form Modal */}
      <CourseOfferingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        offering={offeringToEdit}
        onSubmitSuccess={() => fetchOfferings(selectedStatus)}
      />
    </div>
  );
};
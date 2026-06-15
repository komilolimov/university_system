"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getProgramRequirements, 
  deleteProgramRequirement, 
  type ProgramRequirement 
} from "@/entities/program-requirement";
import { ActionCellRenderer, ProgramRequirementFiltersToolbar, ProgramRequirementForm } from "@/features/program-requirement";
import type { ColDef } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";
import { Plus } from "lucide-react";
import type { components } from "@/shared/api/schema";

import { type CourseCatalog } from "@/entities/course-catalog";
import { type Term } from "@/entities/terms";

type DegreeProgram = components["schemas"]["DegreeProgramRead"];

interface ProgramRequirementsDataGridProps {
  canWrite?: boolean;
  canDelete?: boolean;
}

export const ProgramRequirementsDataGrid = ({ canWrite = true, canDelete = true }: ProgramRequirementsDataGridProps) => {

  const [requirements, setRequirements] = useState<ProgramRequirement[]>([]);
  const [programs, setPrograms] = useState<DegreeProgram[]>([]);
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<ProgramRequirement | null>(null);
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
      import("@/entities/degree-program/api/api").then((mod) => mod.getDegreePrograms({ limit: 1000 })),
      import("@/entities/course-catalog/api/api").then((mod) => mod.getCourseCatalogs({ limit: 1000 })),
      import("@/entities/terms/api/api").then((mod) => mod.getTerms())
    ])
      .then(([programsData, coursesData, termsData]) => {
        setPrograms(programsData);
        setCourses(coursesData);
        setTerms(termsData);
      })
      .catch((err: unknown) => {
        console.error("Failed to load reference data for grid:", err);
      });
  }, []);

  const fetchRecords = () => {
    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);
    
    getProgramRequirements({
      q: debouncedSearch.trim() || null,
      limit: 1000 
    })
      .then((data) => {
        clearTimeout(timer);
        setRequirements(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error(
            "Failed to load requirements",
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

  const handleEdit = (requirement: ProgramRequirement) => {
    setEditingRequirement(requirement);
    setIsFormOpen(true);
  };

  const executeDelete = async (req: ProgramRequirement) => {
    const toastId = toast.loading("Deleting requirement...", "This might take a second.");
    
    try {
      await deleteProgramRequirement(req.program_id, req.catalog_id);
      fetchRecords();
      toast.dismiss(toastId);
      toast.success(
        "Requirement deleted",
        "The requirement mapping has been successfully deleted."
      );
    } catch (err: unknown) {
      toast.dismiss(toastId);
      if (err instanceof Error) {
        toast.error(
          "Failed to delete requirement",
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

  const handleDelete = (req: ProgramRequirement) => {
    toast.confirm(
      "Delete Program Requirement",
      "Are you sure you want to delete this requirement mapping? This action cannot be undone.",
      () => {
        startTransition(() => {
          executeDelete(req);
        });
      }
    );
  };

  const gridContext = useMemo(() => ({
    onEdit: handleEdit,
    onDelete: handleDelete,
    canEdit: canWrite,
    canDelete: canDelete,
  }), [requirements, canWrite, canDelete]);

  const columnDefs = useMemo<ColDef<ProgramRequirement>[]>(() => {
    const cols: ColDef<ProgramRequirement>[] = [
      {
        headerName: "Degree Program",
        flex: 2,
        valueGetter: (params) => {
          const data = params.data;
          if (!data?.program_id) return "Unknown";
          const prog = programs.find((p) => p.id === data.program_id);
          return prog ? `${prog.title} (${prog.degree_level})` : `Program #${data.program_id}`;
        },
      },
      {
        headerName: "Course",
        flex: 2,
        valueGetter: (params) => {
          const data = params.data;
          if (!data?.catalog_id) return "Unknown";
          const crs = courses.find((c) => c.id === data.catalog_id);
          return crs ? `${crs.code} - ${crs.title}` : `Course #${data.catalog_id}`;
        },
      },
      {
        headerName: "Type",
        field: "is_core",
        flex: 1,
        valueFormatter: (params) => (params.value ? "Core" : "Elective"),
      },
      {
        headerName: "Rec. Semester",
        field: "semester_recommended",
        flex: 1,
        valueGetter: (params) => {
          const data = params.data;
          if (!data?.semester_recommended) return "None";
          const term = terms.find((t) => t.id === data.semester_recommended);
          return term ? term.name : `Term #${data.semester_recommended}`;
        },
      },
    ];

    if (canWrite || canDelete) {
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
  }, [canWrite, canDelete, programs, courses, terms]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Program Requirements
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Map courses to degree programs and define core/elective requirements.
          </p>
        </div>

        {canWrite && (
          <button
            onClick={() => {
              setEditingRequirement(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Requirement
          </button>
        )}
      </div>

      <ProgramRequirementFiltersToolbar
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
          rowData={requirements}
          columnDefs={columnDefs}
          context={gridContext}
          height={600}
        />
      </div>

      <ProgramRequirementForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        requirement={editingRequirement}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};

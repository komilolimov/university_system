"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getTerms, 
  deleteTerm,
  updateTerm,
  type Term 
} from "@/entities/terms";
import { TermForm, ActionCellRenderer, TermsFiltersToolbar } from "@/features/terms";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";
import { Plus } from "lucide-react";

interface TermsDataGridProps {
  canMutate?: boolean;
}

export const TermsDataGrid = ({ canMutate = true }: TermsDataGridProps) => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
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
    
    const parsedIsActive = selectedStatus === "all" ? null : selectedStatus === "active";
    
    getTerms({
      q: debouncedSearch.trim() || null,
      is_active: parsedIsActive,
    })
      .then((data) => {
        clearTimeout(timer);
        if (debouncedSearch.trim()) {
          const lowerQuery = debouncedSearch.toLowerCase();
          setTerms(data.filter(t => t.name.toLowerCase().includes(lowerQuery)));
        } else {
          setTerms(data);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error("Failed to load terms", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedStatus]);

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Archive Academic Term",
      "Are you sure you want to archive this term? It will be moved to the inactive list.",
      () => {
        startTransition(() => {
          deleteTerm(id)
            .then(() => {
              toast.success("Term archived");
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
    const term = terms.find((t) => t.id === id);

    if (!term) {
      toast.error("Term not found");
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading("Activating term...", "Please wait.");

      try {
        await updateTerm(id, {
          is_active: true,
        });

        fetchRecords();

        toast.dismiss(toastId);
        toast.success("Term activated", "Term is now active.");
      } catch (err: unknown) {
        toast.dismiss(toastId);

        if (err instanceof Error) {
          toast.error("Failed to activate term", err.message);
        } else {
          toast.error("Error", "Unexpected error occurred.");
        }
      }
    });
  };

  const columnDefs = useMemo<ColDef<Term>[]>(() => {
    const cols: ColDef<Term>[] = [
      {
        field: "id",
        headerName: "ID",
        width: 100,
      },
      {
        field: "name",
        headerName: "Term Name",
        flex: 2,
      },
      {
        field: "start_date",
        headerName: "Start Date",
        flex: 1,
        valueFormatter: (params) => params.value || "-",
      },
      {
        field: "end_date",
        headerName: "End Date",
        flex: 1,
        valueFormatter: (params) => params.value || "-",
      },
      {
        field: "is_active",
        headerName: "Status",
        width: 120,
        valueFormatter: (params) => (params.value !== false ? "Active" : "Archived"),
        cellRenderer: (params: ICellRendererParams<Term, boolean>) => {
          const isActive = params.value !== false;
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
  }, [canMutate]);

  const handleAddNew = () => {
    setEditingTerm(null);
    setIsFormOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-4">  
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Academic Terms Directory
          </h2>
          <p className="text-sm text-neutral-500">
            Manage academic schedules and enrollment periods
          </p>
        </div>

        {canMutate && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Term
          </button>
        )}
      </div>

      <TermsFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <div className="relative border border-neutral-200 rounded-lg overflow-hidden shadow-sm bg-transparent">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <DataGrid
          rowData={terms}
          columnDefs={columnDefs}
          context={{
            canMutate,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onActivate: handleActivate,
          }}
          height={600}
        />
      </div>

      <TermForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        term={editingTerm}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};

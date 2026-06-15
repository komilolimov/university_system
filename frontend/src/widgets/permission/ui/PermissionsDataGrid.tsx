"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { Plus, Layers } from "lucide-react";
import {
  getPermissions,
  updatePermission,
  type Permission,
} from "@/entities/permission";
import { 
  PermissionForm, 
  PermissionActionCellRenderer, 
  PermissionFiltersToolbar 
} from "@/features/permission";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "sonner";

interface PermissionsDataGridProps {
  canWrite?: boolean;
  canDelete?: boolean;
}

export const PermissionsDataGrid = ({ canWrite = true, canDelete = true }: PermissionsDataGridProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [permissionToEdit, setPermissionToEdit] = useState<Permission | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Permissions
  const fetchPermissions = () => {
    const timer = setTimeout(() => setLoading(true), 0);
    
    getPermissions()
      .then((data) => {
        clearTimeout(timer);
        setPermissions(data);
      })
      .catch((err) => {
        if (err instanceof Error) {
          toast.error("Failed to load permissions", { description: err.message });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Compute available modules from permissions
  const availableModules = useMemo(() => {
    const modules = new Set<string>();
    permissions.forEach((perm) => {
      const mod = perm.name.includes(":") ? perm.name.split(":")[0] : "general";
      modules.add(mod);
    });
    return Array.from(modules).sort();
  }, [permissions]);

  // Filter Logic
  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      const matchesSearch = 
        perm.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        (perm.description && perm.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
        
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && perm.is_active) ||
        (selectedStatus === "inactive" && !perm.is_active);

      const mod = perm.name.includes(":") ? perm.name.split(":")[0] : "general";
      const matchesModule = selectedModule === "all" || mod === selectedModule;
      
      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [permissions, debouncedSearch, selectedStatus, selectedModule]);

  // Handlers
  const handleEdit = (perm: Permission) => {
    setPermissionToEdit(perm);
    setIsFormOpen(true);
  };

  const handleToggleActive = (id: number, newStatus: boolean) => {
    const perm = permissions.find((p) => p.id === id);
    if (!perm) return;

    startTransition(() => {
      updatePermission(id, {
        is_active: newStatus,
      })
        .then(() => {
          toast.success(`Permission ${newStatus ? 'activated' : 'deactivated'}`, {
            description: `Successfully ${newStatus ? 'activated' : 'deactivated'} ${perm.name}`
          });
          fetchPermissions();
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            toast.error("Status update failed", { description: err.message });
          }
        });
    });
  };

  // AG Grid Columns
  const columnDefs = useMemo<ColDef<Permission>[]>(() => {
    const cols: ColDef<Permission>[] = [
      {
        headerName: "Module",
        flex: 0.5,
        valueGetter: (params) => {
          if (!params.data) return "General";
          const name = params.data.name;
          const mod = name.includes(":") ? name.split(":")[0] : "General";
          return mod.charAt(0).toUpperCase() + mod.slice(1);
        },
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <div className="flex items-center gap-1.5 h-full">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-700">{params.value}</span>
            </div>
          );
        }
      },
      {
        field: "name",
        headerName: "Permission Name",
        flex: 1,
        cellRenderer: (params: ICellRendererParams<Permission, string>) => {
          return <span className="font-medium text-neutral-900">{params.value}</span>;
        }
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1.5,
        cellRenderer: (params: ICellRendererParams<Permission, string>) => {
          return <span className="text-neutral-500">{params.value || "-"}</span>;
        }
      },
      {
        field: "is_active",
        headerName: "Status",
        flex: 0.5,
        minWidth: 100,
        cellRenderer: (params: ICellRendererParams<Permission, boolean>) => {
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
        flex: 1,
        sortable: false,
        filter: false,
        cellRenderer: PermissionActionCellRenderer,
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
            System Permissions Registry
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Manage system-wide permissions and their descriptions
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => {
              setPermissionToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Permission
          </button>
        )}
      </div>

      {/* Toolbar */}
      <PermissionFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedModule={selectedModule}
        onModuleChange={setSelectedModule}
        availableModules={availableModules}
      />

      {/* Grid */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={filteredPermissions}
          columnDefs={columnDefs}
          context={{
            canEdit: canWrite,
            canDelete: canDelete,
            onEdit: handleEdit,
            onToggleActive: handleToggleActive,
          }}
          height={600}
        />
      </div>

      {/* Form Modal */}
      <PermissionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        permission={permissionToEdit}
        onSubmitSuccess={fetchPermissions}
      />
    </div>
  );
};

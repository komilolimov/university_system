"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { Plus } from "lucide-react";
import {
  getRoles,
  deleteRole,
  updateRole,
  type Role,
} from "@/entities/role";
import { RoleForm, ActionCellRenderer, RoleFiltersToolbar, RolePermissionsDrawer } from "@/features/role";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";

interface RolesDataGridProps {
  canWrite?: boolean;
  canDelete?: boolean;
}

export const RolesDataGrid = ({ canWrite = true, canDelete = true }: RolesDataGridProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "faculty" | "non-faculty">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  // Drawer State
  const [isPermissionsDrawerOpen, setIsPermissionsDrawerOpen] = useState(false);
  const [roleToManagePermissions, setRoleToManagePermissions] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Roles
  const fetchRoles = (status: "all" | "active" | "inactive" = selectedStatus) => {
    // Schedule loading state update asynchronously to avoid the
    // "Calling setState synchronously within an effect" linter warning.
    const timer = setTimeout(() => setLoading(true), 0);
    const isActiveParam = status === "active" ? true : status === "inactive" ? false : undefined;
    
    getRoles({ is_active: isActiveParam })
      .then((data) => {
        clearTimeout(timer);
        setRoles(data);
      })
      .catch((err) => {
        if (err instanceof Error) {
          toast.error("Failed to load roles", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoles(selectedStatus);
  }, [selectedStatus]);

  // Filter Logic
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch = role.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType =
        selectedType === "all" ||
        (selectedType === "faculty" && role.is_faculty) ||
        (selectedType === "non-faculty" && !role.is_faculty);
      
      return matchesSearch && matchesType;
    });
  }, [roles, debouncedSearch, selectedType]);

  // Handlers
  const handleEdit = (role: Role) => {
    setRoleToEdit(role);
    setIsFormOpen(true);
  };

  const handleManagePermissions = (roleId: number) => {
    setRoleToManagePermissions(roleId);
    setIsPermissionsDrawerOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Archive Role",
      "Are you sure you want to archive this role? It will be deactivated.",
      () => {
        startTransition(() => {
          deleteRole(id)
            .then(() => {
              toast.success("Role archived");
              fetchRoles(selectedStatus);
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
    const role = roles.find((r) => r.id === id);

    if (!role) {
      toast.error("Role not found");
      return;
    }

    startTransition(() => {
      updateRole(id, {
        title: role.title,
        is_faculty: role.is_faculty,
        is_active: true,
      })
        .then(() => {
          toast.success("Role activated");
          fetchRoles(selectedStatus);
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            toast.error("Failed to activate role", err.message);
          }
        });
    });
  };

  // AG Grid Columns
  const columnDefs = useMemo<ColDef<Role>[]>(() => {
    const cols: ColDef<Role>[] = [
      {
        field: "title",
        headerName: "Role Title",
        flex: 1,
      },
      {
        field: "is_faculty",
        headerName: "Type",
        flex: 1,
        valueFormatter: (params) => (params.value ? "Faculty" : "Non-Faculty"),
        cellRenderer: (params: ICellRendererParams<Role, boolean>) => {
          const isFaculty = params.value;
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isFaculty
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isFaculty ? "Faculty" : "Non-Faculty"}
            </span>
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
            Role Management
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Create and manage access roles and faculty status
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => {
              setRoleToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        )}
      </div>

      {/* Toolbar */}
      <RoleFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
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
          rowData={filteredRoles}
          columnDefs={columnDefs}
          context={{
            canEdit: canWrite,
            canDelete: canDelete,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onActivate: handleActivate,
            onManagePermissions: handleManagePermissions,
          }}
          height={600}
        />
      </div>

      {/* Form Modal */}
      <RoleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        role={roleToEdit}
        onSubmitSuccess={fetchRoles}
      />

      {/* Permissions Drawer */}
      <RolePermissionsDrawer
        isOpen={isPermissionsDrawerOpen}
        onClose={() => setIsPermissionsDrawerOpen(false)}
        roleId={roleToManagePermissions}
      />
    </div>
  );
};
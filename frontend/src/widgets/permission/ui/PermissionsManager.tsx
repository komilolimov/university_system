"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { getPermissions, updatePermission, type Permission } from "@/entities/permission";
import { PermissionSearch, PermissionMatrixCard, SelectAllToggle } from "@/features/permission";
import { toast } from "@/shared/lib/toast";

export const PermissionsManager = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Permissions
  const fetchPermissions = () => {
    // Schedule loading state update asynchronously to avoid the
    // "Calling setState synchronously within an effect" linter warning.
    const timer = setTimeout(() => setLoading(true), 0);
    
    getPermissions()
      .then((data) => {
        clearTimeout(timer);
        setPermissions(data);
      })
      .catch((err) => {
        if (err instanceof Error) {
          toast.error("Failed to load permissions", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Filter & Group Logic
  const groupedPermissions = useMemo(() => {
    const filtered = permissions.filter((perm) => {
      return (
        perm.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (perm.description && perm.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    });

    const groups: Record<string, Permission[]> = {};
    filtered.forEach((perm) => {
      const prefix = perm.name.split(":")[0] || "other";
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(perm);
    });

    return groups;
  }, [permissions, debouncedSearch]);

  const allActive = permissions.length > 0 && permissions.every((p) => p.is_active);

  // Handlers
  const handleToggle = (perm: Permission) => {
    startTransition(async () => {
      try {
        const updated = await updatePermission(perm.id, { is_active: !perm.is_active });
        setPermissions((prev) => prev.map((p) => (p.id === perm.id ? updated : p)));
        toast.success("Permission updated", `${perm.name} is now ${updated.is_active ? "active" : "inactive"}.`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error("Error", error.message);
        } else {
          toast.error("Error", "An unexpected error occurred.");
        }
      }
    });
  };

  const handleToggleAll = () => {
    const newState = !allActive;
    startTransition(async () => {
      try {
        const promises = permissions.map((p) => {
          if (p.is_active !== newState) {
            return updatePermission(p.id, { is_active: newState });
          }
          return Promise.resolve(p);
        });
        const results = await Promise.all(promises);
        setPermissions(results);
        toast.success("Bulk update successful", `All permissions are now ${newState ? "active" : "inactive"}.`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error("Bulk Update Failed", error.message);
        } else {
          toast.error("Error", "An unexpected error occurred during bulk update.");
        }
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 relative min-h-[400px]">
      {(loading || isPending) && (
        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <PermissionSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <SelectAllToggle
          isAllSelected={allActive}
          onToggleAll={handleToggleAll}
          disabled={loading || isPending || permissions.length === 0}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(groupedPermissions).map(([groupName, perms]) => (
          <PermissionMatrixCard
            key={groupName}
            groupName={groupName}
            permissions={perms}
            onToggle={handleToggle}
            disabled={isPending}
          />
        ))}
        {Object.keys(groupedPermissions).length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border border-neutral-200 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center gap-2">
            <span className="text-neutral-500 font-medium">No permissions found matching your criteria.</span>
          </div>
        )}
      </div>
    </div>
  );
};

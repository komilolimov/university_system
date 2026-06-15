"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { X, Save, Shield, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getRole, assignRolePermissions } from "@/entities/role";
import { getPermissions } from "@/entities/permission";
import type { Permission } from "@/entities/permission";

interface RolePermissionsDrawerProps {
  roleId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RolePermissionsDrawer = ({ roleId, isOpen, onClose }: RolePermissionsDrawerProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !roleId) return;

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allPerms, roleData] = await Promise.all([
          getPermissions(),
          getRole(roleId),
        ]);

        if (isMounted) {
          setPermissions(allPerms);
          const rolePermIds = new Set(roleData.permissions?.map((p) => p.id) || []);
          setSelectedIds(rolePermIds);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load permissions");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, roleId]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      const resource = p.name.includes(":") ? p.name.split(":")[0] : "general";
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(p);
    });
    return groups;
  }, [permissions]);

  const handleToggle = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleToggleGroup = (groupPerms: Permission[]) => {
    const next = new Set(selectedIds);
    const allSelected = groupPerms.every((p) => next.has(p.id));
    
    if (allSelected) {
      groupPerms.forEach((p) => next.delete(p.id));
    } else {
      groupPerms.forEach((p) => next.add(p.id));
    }
    setSelectedIds(next);
  };

  const handleSave = async () => {
    if (!roleId) return;
    
    try {
      await assignRolePermissions(roleId, Array.from(selectedIds));
      toast.success("Permissions updated successfully");
      startTransition(() => {
        router.refresh();
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update permissions");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-5xl bg-neutral-50 shadow-2xl border-l border-neutral-200 flex flex-col animate-in slide-in-from-right duration-300 font-sans"
        role="dialog"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-200 bg-white shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-black text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Role-Permission Matrix</h2>
              <p className="text-sm text-neutral-500">Configure global access levels for the selected role</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 transition-colors p-2 rounded-lg hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
                  <div className="h-5 bg-neutral-200 rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-neutral-100 rounded w-full"></div>
                    <div className="h-8 bg-neutral-100 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-neutral-400 bg-white border border-neutral-200 border-dashed rounded-2xl">
               <ShieldAlert className="h-10 w-10 mb-3 opacity-30" />
               <p className="text-base font-medium text-neutral-500">No permissions found in the system.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedPermissions).map(([resource, groupPerms]) => {
                const allSelected = groupPerms.every((p) => selectedIds.has(p.id));
                const someSelected = groupPerms.some((p) => selectedIds.has(p.id));

                return (
                  <div key={resource} className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div 
                      className="flex items-center justify-between px-5 py-4 bg-neutral-100/50 border-b border-neutral-200 cursor-pointer select-none hover:bg-neutral-100 transition-colors"
                      onClick={() => handleToggleGroup(groupPerms)}
                    >
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-800">
                        {resource}
                      </h3>
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-5 h-5 rounded border transition-colors ${allSelected ? 'bg-black border-black' : someSelected ? 'bg-neutral-200 border-neutral-300' : 'border-neutral-300 bg-white'}`}>
                          {allSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          {!allSelected && someSelected && <div className="h-2 w-2 rounded-sm bg-neutral-600" />}
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-neutral-100 p-2">
                      {groupPerms.map((perm) => {
                        const actionName = perm.name.includes(":") ? perm.name.split(":")[1] : perm.name;
                        const isSelected = selectedIds.has(perm.id);
                        
                        return (
                          <label 
                            key={perm.id} 
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-neutral-50' : 'hover:bg-neutral-50/50'}`}
                          >
                            <div className="flex-shrink-0">
                              <div className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${isSelected ? 'bg-black border-black' : 'border-neutral-300 bg-white'}`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 select-none" onClick={(e) => { e.preventDefault(); handleToggle(perm.id); }}>
                              <p className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-neutral-700'}`}>
                                {actionName.charAt(0).toUpperCase() + actionName.slice(1)}
                              </p>
                              {perm.description && (
                                <p className="text-xs text-neutral-500 truncate" title={perm.description}>{perm.description}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-neutral-200 bg-white flex items-center justify-end gap-3 z-10 shadow-[0_-10px_15px_-3px_rgb(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isPending}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save Matrix"}
          </button>
        </div>
      </div>
    </>
  );
};

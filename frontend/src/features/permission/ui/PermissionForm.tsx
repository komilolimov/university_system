"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import {
  createPermission,
  updatePermission,
  type Permission,
} from "@/entities/permission";

interface PermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null; // If null, it's a "Create" form
  onSubmitSuccess: () => void;
}

export const PermissionForm = ({
  isOpen,
  onClose,
  permission,
  onSubmitSuccess,
}: PermissionFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isPending, startTransition] = useTransition();

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      if (permission) {
        setName(permission.name);
        setDescription(permission.description || "");
        setIsActive(permission.is_active);
      } else {
        setName("");
        setDescription("");
        setIsActive(true);
      }
    }
  }, [isOpen, permission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Validation Error");
      return;
    }

    startTransition(async () => {
      try {
        if (permission) {
          // Update
          await updatePermission(permission.id, {
            name: name.trim(),
            description: description.trim() || null,
            is_active: isActive,
          });
          toast.success("Permission updated", {
            description: `Successfully updated permission ${name}`,
          });
        } else {
          // Create
          await createPermission({
            name: name.trim(),
            description: description.trim() || null,
            is_active: isActive,
          });
          toast.success("Permission created", {
            description: `Successfully created new permission ${name}`,
          });
        }
        onSubmitSuccess();
        onClose();
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error("Operation failed", { description: err.message });
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 font-sans"
        role="dialog"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            {permission ? "Edit Permission" : "Create Permission"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 transition-colors p-1 rounded-md hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-neutral-700">
              Permission Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. finance:write"
              disabled={isPending || !!permission}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow disabled:bg-neutral-100 disabled:text-neutral-500"
              required
            />
            {!permission && (
               <p className="text-xs text-neutral-500">Use the format `resource:action`.</p>
            )}
            {permission && (
               <p className="text-xs text-neutral-500">Permission names cannot be changed once created to maintain system integrity.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this permission allow?"
              disabled={isPending}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              disabled={isPending}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                isActive ? "bg-black" : "bg-neutral-200"
              }`}
            >
              <span
                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                  isActive ? "translate-x-2" : "-translate-x-2"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium text-neutral-900">Active Status</p>
              <p className="text-xs text-neutral-500">Is this permission globally enabled?</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

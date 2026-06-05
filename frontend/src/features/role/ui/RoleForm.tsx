"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import {
  type Role,
  type RoleCreate,
  type RoleUpdate,
  createRole,
  updateRole,
} from "@/entities/role";
import { toast } from "@/shared/lib/toast";

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSubmitSuccess: () => void;
}

export const RoleForm = ({
  isOpen,
  onClose,
  role,
  onSubmitSuccess,
}: RoleFormProps) => {
  const isEditing = !!role;
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    is_faculty: false,
  });

  useEffect(() => {
    if (isOpen) {
      // Defer state update to avoid "Calling setState synchronously within an effect" warning
      setTimeout(() => {
        if (role) {
          setFormData({
            title: role.title,
            is_faculty: role.is_faculty,
          });
        } else {
          setFormData({
            title: "",
            is_faculty: false,
          });
        }
      }, 0);
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const payload = {
          title: formData.title,
          is_faculty: formData.is_faculty,
        };

        if (isEditing) {
          await updateRole(role.id, payload as RoleUpdate);
          toast.success("Role updated", "Changes saved successfully.");
        } else {
          await createRole(payload as RoleCreate);
          toast.success("Role created", "New role has been added.");
        }

        onSubmitSuccess();
        onClose();
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error("Error", error.message);
        } else {
          toast.error("Error", "An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {isEditing ? "Edit Role" : "Add New Role"}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Role Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm text-black placeholder:text-neutral-400 transition-colors"
              placeholder="e.g. Professor"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_faculty"
              checked={formData.is_faculty}
              onChange={(e) => setFormData({ ...formData, is_faculty: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-200 text-black focus:ring-black/20 bg-white"
            />
            <label htmlFor="is_faculty" className="text-sm font-medium text-neutral-700 cursor-pointer select-none">
              Is Faculty Member?
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-900 active:bg-black rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
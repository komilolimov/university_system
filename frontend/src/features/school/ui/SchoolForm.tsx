"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  createSchool, 
  updateSchool, 
  type School 
} from "@/entities/school";

interface SchoolFormProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School | null; // If provided, we are in edit mode
  onSubmitSuccess: () => void;
}

import { toast } from "@/shared/lib/toast";

export const SchoolForm = ({ isOpen, onClose, school, onSubmitSuccess }: SchoolFormProps) => {
  const isEditMode = !!school;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState("");

  // Sync state with school prop when editing
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (school) {
          setName(school.name || "");
          setError(null);
        } else {
          setName("");
          setError(null);
        }
      }, 0);
    }
  }, [isOpen, school]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode) {
          await updateSchool(school.id, {
            name: name.trim(),
          });
          toast.success("School updated", "The school details have been successfully updated.");
        } else {
          await createSchool({
            name: name.trim(),
          });
          toast.success("School created", "A new school has been successfully added.");
        }
        
        onSubmitSuccess();
        onClose();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="px-6 py-5 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            {isEditMode ? "Edit School" : "Add New School"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isEditMode
              ? "Update the details of the selected school."
              : "Enter the details to create a new school in the system."}
          </p>
        </header>

        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">School Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              placeholder="e.g. School of Engineering"
            />
          </div>
        </form>

        <footer className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-md hover:text-black hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-black border border-black rounded-md hover:bg-neutral-900 active:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create School"}
          </button>
        </footer>
      </div>
    </div>
  );
};

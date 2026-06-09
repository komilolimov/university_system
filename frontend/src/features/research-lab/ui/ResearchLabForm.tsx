"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  createResearchLab, 
  updateResearchLab, 
  type ResearchLab 
} from "@/entities/research-lab";
import type { components } from "@/shared/api/schema";

type Department = components["schemas"]["DepartmentRead"];

interface ResearchLabFormProps {
  isOpen: boolean;
  onClose: () => void;
  lab?: ResearchLab | null; // If provided, we are in edit mode
  onSubmitSuccess: () => void;
}

export const ResearchLabForm = ({ isOpen, onClose, lab, onSubmitSuccess }: ResearchLabFormProps) => {
  const isEditMode = !!lab;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Departments for dropdown
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form Fields State
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");

  // Load departments on mount
  useEffect(() => {
    if (isOpen) {
      import("@/entities/department/api/api").then(({ getDepartments }) => {
        getDepartments({ limit: 100 })
          .then((data) => {
            setDepartments(data);
          })
          .catch(console.error);
      });
    }
  }, [isOpen]);

  // Sync state with lab prop when editing
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (lab) {
          setName(lab.name || "");
          setDepartmentId(lab.department_id);
          setError(null);
        } else {
          setName("");
          setDepartmentId("");
          setError(null);
        }
      }, 0);
    }
  }, [isOpen, lab]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || departmentId === "") {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode) {
          await updateResearchLab(lab.id, {
            name: name.trim(),
            department_id: Number(departmentId),
          });
        } else {
          await createResearchLab({
            name: name.trim(),
            department_id: Number(departmentId),
          });
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
            {isEditMode ? "Edit Research Lab" : "Add New Lab"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isEditMode
              ? "Update the details of the selected research lab."
              : "Enter the details to create a new research lab in the system."}
          </p>
        </header>

        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Lab Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              placeholder="e.g. AI Research Center"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Department *</label>
            <select
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none"
            >
              <option value="" disabled>Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
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
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create Lab"}
          </button>
        </footer>
      </div>
    </div>
  );
};

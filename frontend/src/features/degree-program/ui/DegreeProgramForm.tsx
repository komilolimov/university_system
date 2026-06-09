"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  createDegreeProgram, 
  updateDegreeProgram, 
  type DegreeProgram 
} from "@/entities/degree-program";
import type { components } from "@/shared/api/schema";

type Department = components["schemas"]["DepartmentRead"];

interface DegreeProgramFormProps {
  isOpen: boolean;
  onClose: () => void;
  program?: DegreeProgram | null; // If provided, we are in edit mode
  onSubmitSuccess: () => void;
}

export const DegreeProgramForm = ({ isOpen, onClose, program, onSubmitSuccess }: DegreeProgramFormProps) => {
  const isEditMode = !!program;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Departments for dropdown
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  const [totalCredits, setTotalCredits] = useState<number | "">("");
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

  // Sync state with program prop when editing
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (program) {
          setTitle(program.title || "");
          setDegreeLevel(program.degree_level || "");
          setTotalCredits(program.total_credits_required);
          setDepartmentId(program.department_id);
          setError(null);
        } else {
          setTitle("");
          setDegreeLevel("");
          setTotalCredits("");
          setDepartmentId("");
          setError(null);
        }
      }, 0);
    }
  }, [isOpen, program]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !degreeLevel.trim() || totalCredits === "" || departmentId === "") {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode) {
          await updateDegreeProgram(program.id, {
            title: title.trim(),
            degree_level: degreeLevel.trim(),
            total_credits_required: Number(totalCredits),
            department_id: Number(departmentId),
          });
        } else {
          await createDegreeProgram({
            title: title.trim(),
            degree_level: degreeLevel.trim(),
            total_credits_required: Number(totalCredits),
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
            {isEditMode ? "Edit Degree Program" : "Add New Program"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isEditMode
              ? "Update the details of the selected degree program."
              : "Enter the details to create a new degree program."}
          </p>
        </header>

        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Program Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              placeholder="e.g. B.S. in Computer Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Degree Level *</label>
              <select
                required
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none"
              >
                <option value="" disabled>Select Level</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Associate">Associate</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Total Credits *</label>
              <input
                type="number"
                required
                min={1}
                max={500}
                value={totalCredits}
                onChange={(e) => setTotalCredits(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="e.g. 120"
              />
            </div>
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
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create Program"}
          </button>
        </footer>
      </div>
    </div>
  );
};

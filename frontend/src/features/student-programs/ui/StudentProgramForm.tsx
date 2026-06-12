"use client";
import { toast } from "@/shared/lib/toast";

import React, { useState, useEffect, useTransition } from "react";
import { 
  type StudentProgram,
  type ProgramType,
  type Student,
  type DegreeProgram,
  createStudentProgram,
  updateStudentProgram
} from "@/entities/student-programs";

interface StudentProgramFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentProgram?: StudentProgram | null;
  students: Student[];
  programs: DegreeProgram[];
  onSubmitSuccess: () => void;
}

export const StudentProgramForm = ({ 
  isOpen, 
  onClose, 
  studentProgram, 
  students, 
  programs, 
  onSubmitSuccess 
}: StudentProgramFormProps) => {
  const isEditMode = !!studentProgram;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [type, setType] = useState<ProgramType>("Primary Major");
  const [declaredDate, setDeclaredDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (studentProgram) {
          setStudentId(String(studentProgram.student_id));
          setProgramId(String(studentProgram.program_id));
          setType(studentProgram.type || "Primary Major");
          setDeclaredDate(studentProgram.declared_date || "");
          setError(null);
        } else {
          setStudentId("");
          setProgramId("");
          setType("Primary Major");
          setDeclaredDate(new Date().toISOString().split("T")[0]);
          setError(null);
        }
      }, 0);
    }
  }, [isOpen, studentProgram]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId || !programId || !declaredDate) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode && studentProgram) {
          await updateStudentProgram(studentProgram.student_id, studentProgram.program_id, {
            type,
            declared_date: declaredDate,
          });
        } else {
          await createStudentProgram({
            student_id: parseInt(studentId, 10),
            program_id: parseInt(programId, 10),
            type,
            declared_date: declaredDate,
          });
        }
        toast.success("Success", "The record has been saved successfully.");
        onSubmitSuccess();
        onClose();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Something went wrong.");
        } else {
          setError("Something went wrong.");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-xl border border-neutral-200 p-8 shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-col gap-1 border-b border-neutral-100 pb-4 select-none">
          <h2 className="text-xl font-semibold tracking-tighter text-neutral-900">
            {isEditMode ? "Edit Student Program" : "Add Student Program"}
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            {isEditMode ? "Modify program enrollment details." : "Enroll a student in a new academic program."}
          </p>
        </header>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Student *</label>
            <select
              required
              disabled={isEditMode}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:opacity-50"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Program *</label>
            <select
              required
              disabled={isEditMode}
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:opacity-50"
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Program Type *</label>
              <select
                required
                value={type}
                onChange={(e) => setType(e.target.value as ProgramType)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              >
                <option value="Primary Major">Primary Major</option>
                <option value="Secondary Major">Secondary Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Declared Date *</label>
              <input
                type="date"
                required
                value={declaredDate}
                onChange={(e) => setDeclaredDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <footer className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 text-sm font-medium rounded-md bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 cursor-pointer select-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 text-sm font-medium rounded-md bg-black text-white hover:bg-neutral-900 active:bg-black disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none transition-colors"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? "Save Changes" : "Save Program"}</span>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

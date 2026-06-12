"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  createProgramRequirement, 
  updateProgramRequirement, 
  type ProgramRequirement 
} from "@/entities/program-requirement";
import type { components } from "@/shared/api/schema";

import { type CourseCatalog } from "@/entities/course-catalog";
import { type Term } from "@/entities/terms";

type DegreeProgram = components["schemas"]["DegreeProgramRead"];

interface ProgramRequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
  requirement?: ProgramRequirement | null; // If provided, we are in edit mode
  onSubmitSuccess: () => void;
}

export const ProgramRequirementForm = ({ isOpen, onClose, requirement, onSubmitSuccess }: ProgramRequirementFormProps) => {
  const isEditMode = !!requirement;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Dropdown data
  const [programs, setPrograms] = useState<DegreeProgram[]>([]);
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  // Form Fields State
  const [programId, setProgramId] = useState<number | "">("");
  const [catalogId, setCatalogId] = useState<number | "">("");
  const [isCore, setIsCore] = useState<boolean>(true);
  const [semesterRecommended, setSemesterRecommended] = useState<number | "">("");

  // Load dropdown data on mount
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        import("@/entities/degree-program/api/api").then((mod) => mod.getDegreePrograms({ limit: 1000 })),
        import("@/entities/course-catalog/api/api").then((mod) => mod.getCourseCatalogs({ limit: 1000 })),
        import("@/entities/terms/api/api").then((mod) => mod.getTerms())
      ])
        .then(([programsData, coursesData, termsData]) => {
          setPrograms(programsData);
          setCourses(coursesData);
          setTerms(termsData);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // Sync state with requirement prop when editing
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (requirement) {
          setProgramId(requirement.program_id);
          setCatalogId(requirement.catalog_id);
          setIsCore(requirement.is_core);
          setSemesterRecommended(requirement.semester_recommended ?? "");
          setError(null);
        } else {
          setProgramId("");
          setCatalogId("");
          setIsCore(true);
          setSemesterRecommended("");
          setError(null);
        }
      }, 0);
    }
  }, [isOpen, requirement]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (programId === "" || catalogId === "") {
      setError("Please select both a Degree Program and a Course Catalog entry.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode && requirement) {
          await updateProgramRequirement(requirement.program_id, requirement.catalog_id, {
            is_core: isCore,
            semester_recommended: semesterRecommended === "" ? null : Number(semesterRecommended),
          });
        } else {
          await createProgramRequirement({
            program_id: Number(programId),
            catalog_id: Number(catalogId),
            is_core: isCore,
            semester_recommended: semesterRecommended === "" ? null : Number(semesterRecommended),
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
            {isEditMode ? "Edit Requirement" : "Add Requirement"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isEditMode
              ? "Update the details of the selected program requirement."
              : "Map a course to a degree program."}
          </p>
        </header>

        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Degree Program *</label>
            <select
              required
              disabled={isEditMode}
              value={programId}
              onChange={(e) => setProgramId(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none disabled:bg-neutral-50 disabled:text-neutral-500"
            >
              <option value="" disabled>Select Program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.degree_level})
                </option>
              ))}
            </select>
            {isEditMode && <p className="text-[10px] text-neutral-400 mt-1">Program ID cannot be changed after creation.</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Course Catalog Entry *</label>
            <select
              required
              disabled={isEditMode}
              value={catalogId}
              onChange={(e) => setCatalogId(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none disabled:bg-neutral-50 disabled:text-neutral-500"
            >
              <option value="" disabled>Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
            {isEditMode && <p className="text-[10px] text-neutral-400 mt-1">Catalog ID cannot be changed after creation.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Requirement Type *</label>
              <select
                required
                value={isCore ? "true" : "false"}
                onChange={(e) => setIsCore(e.target.value === "true")}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none"
              >
                <option value="true">Core</option>
                <option value="false">Elective</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Semester Recommended</label>
              <select
                value={semesterRecommended}
                onChange={(e) => setSemesterRecommended(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none"
              >
                <option value="">None</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
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
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Add Requirement"}
          </button>
        </footer>
      </div>
    </div>
  );
};

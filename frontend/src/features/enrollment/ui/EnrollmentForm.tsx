"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  createEnrollment, 
  updateEnrollment, 
  type Enrollment,
  type EnrollmentStatus
} from "@/entities/enrollment";
import type { components } from "@/shared/api/schema";

import { type CourseCatalog } from "@/entities/course-catalog";
import { type CourseOffering } from "@/entities/course-offerings";

type Student = components["schemas"]["StudentRead"];

interface EnrollmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment?: Enrollment | null; // If provided, we are in edit mode
  onSubmitSuccess: () => void;
}

export const EnrollmentForm = ({ isOpen, onClose, enrollment, onSubmitSuccess }: EnrollmentFormProps) => {
  const isEditMode = !!enrollment;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Dropdown data
  const [students, setStudents] = useState<Student[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);

  // Form Fields State
  const [studentId, setStudentId] = useState<number | "">("");
  const [offeringId, setOfferingId] = useState<number | "">("");
  const [status, setStatus] = useState<EnrollmentStatus>("Enrolled");
  const [grade, setGrade] = useState<string>("");
  const [creditsEarned, setCreditsEarned] = useState<number | "">("");

  // Load dropdown data on mount
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        import("@/entities/student/api/api").then((mod) => mod.getStudents({ limit: 100 })),
        import("@/entities/course-offerings/api/api").then((mod) => mod.getCourseOfferings()),
        import("@/entities/course-catalog/api/api").then((mod) => mod.getCourseCatalogs({ limit: 100 }))
      ])
        .then(([studentsData, offeringsData, catalogsData]) => {
          setStudents(studentsData);
          setOfferings(offeringsData);
          setCatalogs(catalogsData);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // Sync state with enrollment prop when editing
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (enrollment) {
          setStudentId(enrollment.student_id);
          setOfferingId(enrollment.offering_id);
          setStatus(enrollment.status);
          setGrade(enrollment.grade?.toString() ?? "");
          setCreditsEarned(enrollment.credits_earned ?? "");
          setError(null);
        } else {
          setStudentId("");
          setOfferingId("");
          setStatus("Enrolled");
          setGrade("");
          setCreditsEarned("");
          setError(null);
        }
      }, 0);
    }
  }, [isOpen, enrollment]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (studentId === "" || offeringId === "") {
      setError("Please select both a Student and a Course Offering.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode && enrollment) {
          await updateEnrollment(enrollment.student_id, enrollment.offering_id, {
            status,
            grade: grade.trim() === "" ? null : grade.trim(),
            credits_earned: creditsEarned === "" ? null : Number(creditsEarned),
          });
        } else {
          await createEnrollment({
            student_id: Number(studentId),
            offering_id: Number(offeringId),
            status,
            grade: grade.trim() === "" ? null : grade.trim(),
            credits_earned: creditsEarned === "" ? null : Number(creditsEarned),
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

  const getOfferingLabel = (offering: CourseOffering) => {
    const catalog = catalogs.find(c => c.id === offering.catalog_id);
    if (catalog) {
      return `${catalog.code} - ${catalog.title} (Offering #${offering.id})`;
    }
    return `Offering #${offering.id}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="px-6 py-5 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            {isEditMode ? "Edit Enrollment" : "Add Enrollment"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isEditMode
              ? "Update the details of the selected enrollment."
              : "Enroll a student in a course offering."}
          </p>
        </header>

        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Student *</label>
            <select
              required
              disabled={isEditMode}
              value={studentId}
              onChange={(e) => setStudentId(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none disabled:bg-neutral-50 disabled:text-neutral-500"
            >
              <option value="" disabled>Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.email})
                </option>
              ))}
            </select>
            {isEditMode && <p className="text-[10px] text-neutral-400 mt-1">Student ID cannot be changed after enrollment.</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Course Offering *</label>
            <select
              required
              disabled={isEditMode}
              value={offeringId}
              onChange={(e) => setOfferingId(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none disabled:bg-neutral-50 disabled:text-neutral-500"
            >
              <option value="" disabled>Select Offering</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {getOfferingLabel(o)}
                </option>
              ))}
            </select>
            {isEditMode && <p className="text-[10px] text-neutral-400 mt-1">Offering ID cannot be changed after enrollment.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Status *</label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as EnrollmentStatus)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none"
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Dropped">Dropped</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Grade</label>
              <input
                type="number"
                min={0}
                max={4.00}
                step={0.01}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="e.g. 3.50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Credits Earned</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={creditsEarned}
                onChange={(e) => setCreditsEarned(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="e.g. 3"
              />
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
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Add Enrollment"}
          </button>
        </footer>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  createStudent, 
  updateStudent, 
  getAdvisors,
  type Student,
  type Employee,
  type RegionType
} from "@/entities/student";

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null; // If provided, we are in edit mode
  onSubmitSuccess: () => void;
}

export const StudentForm = ({ isOpen, onClose, student, onSubmitSuccess }: StudentFormProps) => {
  const isEditMode = !!student;
  const [advisors, setAdvisors] = useState<Employee[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<RegionType>("Domestic");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [advisorId, setAdvisorId] = useState<string>("");
  const [graduationDate, setGraduationDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  // Load advisors on mount
  useEffect(() => {
    if (isOpen) {
      getAdvisors()
        .then(setAdvisors)
        .catch((err) => console.error("Failed to load advisors:", err));
    }
  }, [isOpen]);

  // Sync state with student prop when editing
  useEffect(() => {
    if (isOpen) {
      if (student) {
        setFirstName(student.first_name || "");
        setLastName(student.last_name || "");
        setEmail(student.email || "");
        setRegion(student.region || "Domestic");
        setEnrollmentDate(student.enrollment_date || "");
        setAdvisorId(student.advisor_id ? String(student.advisor_id) : "");
        setGraduationDate(student.graduation_date || "");
        setIsActive(student.is_active ?? true);
        setPassword("");
        setError(null);
      } else {
        // Reset to default for creation
        setFirstName("");
        setLastName("");
        setEmail("");
        setRegion("Domestic");
        setEnrollmentDate(new Date().toISOString().split("T")[0]);
        setAdvisorId("");
        setGraduationDate("");
        setIsActive(true);
        setPassword("");
        setError(null);
      }
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !enrollmentDate) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isEditMode && !password) {
      setError("Password is required for new students.");
      return;
    }

    startTransition(async () => {
      try {
        const parsedAdvisorId = advisorId ? parseInt(advisorId, 10) : undefined;
        const parsedGraduationDate = graduationDate || null;

        if (isEditMode && student) {
          await updateStudent(student.id, {
            first_name: firstName,
            last_name: lastName,
            email: email,
            region: region,
            enrollment_date: enrollmentDate,
            advisor_id: parsedAdvisorId,
            graduation_date: parsedGraduationDate,
            is_active: isActive,
          });
        } else {
          await createStudent({
            first_name: firstName,
            last_name: lastName,
            email: email,
            region: region,
            enrollment_date: enrollmentDate,
            advisor_id: parsedAdvisorId,
            graduation_date: parsedGraduationDate,
            is_active: isActive,
            password: password,
          });
        }

        onSubmitSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
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
            {isEditMode ? "Edit Student Details" : "Register New Student"}
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            {isEditMode ? "Modify student profile settings." : "Add a student profile to the active database catalog."}
          </p>
        </header>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="e.g. John"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="e.g. Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              placeholder="e.g. john.doe@university.edu"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Region *</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionType)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              >
                <option value="Domestic">Domestic</option>
                <option value="EU">EU</option>
                <option value="Non-EU">Non-EU</option>
                <option value="USA">USA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Enrollment Date *</label>
              <input
                type="date"
                required
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Academic Advisor</label>
              <select
                value={advisorId}
                onChange={(e) => setAdvisorId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              >
                <option value="">No Advisor Assigned</option>
                {advisors.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Expected Graduation</label>
              <input
                type="date"
                value={graduationDate}
                onChange={(e) => setGraduationDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Security Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter account password"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 select-none">
            <input
              type="checkbox"
              id="isActiveCheckbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
            />
            <label htmlFor="isActiveCheckbox" className="text-xs font-medium text-neutral-700">
              Active Student Account Profile
            </label>
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
                <span>{isEditMode ? "Save Changes" : "Create Student"}</span>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

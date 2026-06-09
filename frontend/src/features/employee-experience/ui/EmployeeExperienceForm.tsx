"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { 
  createEmployeeExperience, 
  updateEmployeeExperience, 
  type EmployeeExperience,
  type EmployeeExperienceUpdate,
  type EmployeeExperienceCreate
} from "@/entities/employee-experience";
import type { Employee } from "@/entities/employee";
import { toast } from "@/shared/lib/toast";

interface EmployeeExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: EmployeeExperience | null;
  employees: Employee[];
  onSubmitSuccess: () => void;
}

export const EmployeeExperienceForm = ({ 
  isOpen, 
  onClose, 
  experience, 
  employees,
  onSubmitSuccess 
}: EmployeeExperienceFormProps) => {
  const isEditing = !!experience;
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    employee_id: "",
    company_name: "",
    job_title: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (experience) {
          setFormData({
            employee_id: experience.employee_id.toString(),
            company_name: experience.company_name,
            job_title: experience.job_title,
            start_date: experience.start_date,
            end_date: experience.end_date || "",
            description: experience.description || "",
          });
        } else {
          setFormData({
            employee_id: employees.length > 0 ? employees[0].id.toString() : "",
            company_name: "",
            job_title: "",
            start_date: new Date().toISOString().split("T")[0],
            end_date: "",
            description: "",
          });
        }
      }, 0);
    }
  }, [isOpen, experience, employees]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const payload = {
          company_name: formData.company_name,
          job_title: formData.job_title,
          start_date: formData.start_date,
          end_date: formData.end_date ? formData.end_date : null,
          description: formData.description ? formData.description : null,
          employee_id: parseInt(formData.employee_id, 10),
        };

        if (isEditing && experience) {
          await updateEmployeeExperience(experience.id, payload as EmployeeExperienceUpdate);
          toast.success("Experience updated", "Changes saved successfully.");
        } else {
          await createEmployeeExperience(payload.employee_id, payload as EmployeeExperienceCreate);
          toast.success("Experience added", "New experience has been added.");
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
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {isEditing ? "Edit Experience" : "Add New Experience"}
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
            <label className="text-sm font-medium text-neutral-700">Employee</label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Company Name</label>
              <input
                required
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Job Title</label>
              <input
                required
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Start Date</label>
              <input
                required
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-900 active:bg-black rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Experience"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

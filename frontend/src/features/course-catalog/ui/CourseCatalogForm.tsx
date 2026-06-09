"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/shared/lib/toast";
import {
  createCourseCatalog,
  updateCourseCatalog,
  type CourseCatalog,
  type CourseCatalogCreate,
  type CourseCatalogUpdate,
} from "@/entities/course-catalog";

interface CourseCatalogFormProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseCatalog | null;
  onSubmitSuccess: () => void;
}

export const CourseCatalogForm = ({
  isOpen,
  onClose,
  course,
  onSubmitSuccess,
}: CourseCatalogFormProps) => {
  const [formData, setFormData] = useState<CourseCatalogCreate>({
    code: "",
    title: "",
    description: "",
    credits: 3,
    department_id: null,
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (course && isOpen) {
        setFormData({
          code: course.code,
          title: course.title,
          description: course.description || "",
          credits: course.credits,
          department_id: course.department_id || null,
          is_active: course.is_active,
        });
      } else if (isOpen) {
        setFormData({
          code: "",
          title: "",
          description: "",
          credits: 3,
          department_id: null,
          is_active: true,
        });
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (course) {
        const updateData: CourseCatalogUpdate = { ...formData };
        await updateCourseCatalog(course.id, updateData);
        toast.success("Course updated", "The course catalog entry has been updated.");
      } else {
        await createCourseCatalog(formData);
        toast.success("Course created", "A new course has been added to the catalog.");
      }
      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("Error saving course", err.message);
      } else {
        toast.error("Error", "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {course ? "Edit Course" : "Add New Course"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Course Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="Introduction to Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all resize-none"
                placeholder="Course description..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Credits
              </label>
              <input
                type="number"
                required
                min={0}
                max={10}
                step={0.5}
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
              />
            </div>

            {/* In a real app, Department ID would be a select dropdown. Keeping simple text for now or just number. */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Department ID (Optional)
              </label>
              <input
                type="number"
                value={formData.department_id || ""}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="e.g., 1"
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-neutral-300 text-black focus:ring-black"
              />
              <label htmlFor="is_active" className="text-sm text-neutral-700">
                Course is active
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-neutral-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : course ? "Save Changes" : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

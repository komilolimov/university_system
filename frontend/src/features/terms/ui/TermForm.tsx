"use client";

import React, { useState, useEffect, useTransition } from "react";
import { toast } from "@/shared/lib/toast";
import {
  createTerm,
  updateTerm,
  type Term,
  type TermCreate,
  type TermUpdate,
} from "@/entities/terms";

interface TermFormProps {
  isOpen: boolean;
  onClose: () => void;
  term?: Term | null;
  onSubmitSuccess: () => void;
}

export const TermForm = ({ isOpen, onClose, term, onSubmitSuccess }: TermFormProps) => {
  const isEditMode = !!term;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TermCreate>({
    name: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (term) {
          setFormData({
            name: term.name,
            start_date: term.start_date,
            end_date: term.end_date,
            is_active: term.is_active ?? true,
          });
          setError(null);
        } else {
          setFormData({
            name: "",
            start_date: "",
            end_date: "",
            is_active: true,
          });
          setError(null);
        }
      }, 0);
    }
  }, [isOpen, term]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.start_date || !formData.end_date) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode && term) {
          const updateData: TermUpdate = { ...formData };
          await updateTerm(term.id, updateData);
        } else {
          await createTerm(formData);
        }

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

  const inputClassName = "w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="absolute inset-0 border border-neutral-200 opacity-50" onClick={onClose} />

      <div 
        className="relative rounded-xl border border-neutral-300 w-full max-w-lg p-8 shadow-xl flex flex-col gap-6 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200 bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-col gap-1 border-b border-neutral-200 pb-4 select-none">
          <h2 className="text-xl font-semibold tracking-tighter text-neutral-900">
            {isEditMode ? "Edit Academic Term" : "Create New Term"}
          </h2>
          <p className="text-xs text-neutral-600 font-medium">
            {isEditMode ? "Modify term details." : "Add a new academic term to the system."}
          </p>
        </header>

        {error && (
          <div className="p-3 border border-red-300 text-red-600 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Term Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClassName}
              placeholder="e.g. Fall 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={inputClassName}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">End Date *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 select-none">
            <input
              type="checkbox"
              id="isActiveCheckbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black bg-transparent"
            />
            <label htmlFor="isActiveCheckbox" className="text-xs font-medium text-neutral-700">
              Active Term
            </label>
          </div>

          <footer className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 text-sm font-medium rounded-md text-neutral-800 border border-neutral-300 hover:border-neutral-500 disabled:opacity-50 cursor-pointer select-none transition-colors bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 text-sm font-medium rounded-md text-neutral-900 border-2 border-neutral-900 hover:border-black hover:opacity-70 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none transition-all bg-transparent"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-neutral-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? "Save Changes" : "Create Term"}</span>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/shared/lib/toast";
import { ScheduleInput } from "./ScheduleInput";
import {
  createCourseOffering,
  updateCourseOffering,
  type CourseOffering,
  type CourseOfferingCreate,
  type CourseOfferingUpdate,
} from "@/entities/course-offerings";
import { getCourseCatalogs, type CourseCatalog } from "@/entities/course-catalog";
import { getTerms, type Term } from "@/entities/terms";
import { getEmployees, type Employee } from "@/entities/employee";
import { getRooms, type Room } from "@/entities/rooms";

interface CourseOfferingFormProps {
  isOpen: boolean;
  onClose: () => void;
  offering: CourseOffering | null;
  onSubmitSuccess: () => void;
}

export const CourseOfferingForm = ({
  isOpen,
  onClose,
  offering,
  onSubmitSuccess,
}: CourseOfferingFormProps) => {
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [formData, setFormData] = useState<CourseOfferingCreate>({
    catalog_id: 0,
    term_id: 0,
    primary_instructor_id: 0,
    room_id: null,
    schedule_blocks: "",
    max_capacity: 30,

    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        getCourseCatalogs({ limit: 1000 }),
        getTerms(),
        getEmployees({ limit: 1000 }),
        getRooms({ limit: 1000 })
      ]).then(([catalogsData, termsData, employeesData, roomsData]) => {
        setCatalogs(catalogsData);
        setTerms(termsData);
        setEmployees(employeesData);
        setRooms(roomsData);
      }).catch(console.error);
    }
    const timer = setTimeout(() => {
      if (offering && isOpen) {
        setFormData({
          catalog_id: offering.catalog_id,
          term_id: offering.term_id,
          primary_instructor_id: offering.primary_instructor_id,
          room_id: offering.room_id || null,
          schedule_blocks: offering.schedule_blocks || "",
          max_capacity: offering.max_capacity,

          is_active: offering.is_active,
        });
      } else if (isOpen) {
        setFormData({
          catalog_id: 0,
          term_id: 0,
          primary_instructor_id: 0,
          room_id: null,
          schedule_blocks: "",
          max_capacity: 30,

          is_active: true,
        });
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [offering, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (offering) {
        await updateCourseOffering(offering.id, { ...formData });
        toast.success("Offering updated", "The course offering has been updated.");
      } else {
        await createCourseOffering(formData);
        toast.success("Offering created", "A new course offering has been scheduled.");
      }
      onSubmitSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error("Error", err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = "w-full px-3 py-2.5 text-sm rounded-md border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {offering ? "Edit Course Offering" : "Add New Offering"}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Course Catalog</label>
              <select 
                required 
                value={formData.catalog_id || ""} 
                onChange={(e) => setFormData({ ...formData, catalog_id: parseInt(e.target.value) })} 
                className={`${inputClassName} appearance-none`}
              >
                <option value="" disabled>Select a course</option>
                {catalogs.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>
            </div>
            
            {/* Term */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Term</label>
              <select 
                required 
                value={formData.term_id || ""} 
                onChange={(e) => setFormData({ ...formData, term_id: parseInt(e.target.value) })} 
                className={`${inputClassName} appearance-none`}
              >
                <option value="" disabled>Select a term</option>
                {terms.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Primary Instructor */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Primary Instructor</label>
              <select 
                required 
                value={formData.primary_instructor_id || ""} 
                onChange={(e) => setFormData({ ...formData, primary_instructor_id: parseInt(e.target.value) })} 
                className={`${inputClassName} appearance-none`}
              >
                <option value="" disabled>Select an instructor</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Room (Optional)</label>
              <select 
                value={formData.room_id || ""} 
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value ? parseInt(e.target.value) : null })} 
                className={`${inputClassName} appearance-none`}
              >
                <option value="">No Room Assigned</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.room_number} (Cap: {r.capacity})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Schedule Blocks */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Schedule</label>
              <ScheduleInput 
                value={formData.schedule_blocks || ""}
                onChange={(val) => setFormData({ ...formData, schedule_blocks: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Capacity</label>
              <input type="number" required min={1} value={formData.max_capacity ?? 0} onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 0 })} className={inputClassName} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded border-neutral-300 text-black focus:ring-black" />
              <label className="text-sm text-neutral-700">Offering is active</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-neutral-900">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

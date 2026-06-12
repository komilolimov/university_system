import { toast } from "@/shared/lib/toast";
import React, { useState, useEffect } from "react";
import type { Building, BuildingCreate } from "@/entities/buildings";

interface BuildingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BuildingCreate) => void;
  building?: Building | null;
}

export const BuildingForm: React.FC<BuildingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  building,
}) => {
  const [formData, setFormData] = useState<BuildingCreate>({
    code: "",
    name: "",
  });

  useEffect(() => {
    if (building && isOpen) {
      setFormData({
        code: building.code,
        name: building.name || "",
      });
    } else if (isOpen) {
      setFormData({
        code: "",
        name: "",
      });
    }
  }, [building, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClassName = "w-full text-sm border-b border-neutral-200 focus:border-black focus:outline-none py-2 transition-colors pb-1.5 bg-transparent";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {building ? "Edit Building" : "Add Building"}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Building Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={inputClassName}
                placeholder="e.g. BLD-01"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClassName}
                placeholder="e.g. Engineering Block"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-neutral-900"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

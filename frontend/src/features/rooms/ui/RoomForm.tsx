import { toast } from "@/shared/lib/toast";
import React, { useState, useEffect } from "react";
import type { Room, RoomCreate, RoomType } from "@/entities/rooms";
import { getBuildings, type Building } from "@/entities/buildings";

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomCreate) => void;
  room?: Room | null;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  room,
}) => {
  const [formData, setFormData] = useState<RoomCreate>({
    room_number: "",
    capacity: 0,
    type: "Lecture Hall",
    building_id: 0,
  });

  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    if (isOpen) {
      getBuildings().then(setBuildings).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    queueMicrotask(() => {
      if (room && isOpen) {
        setFormData({
          room_number: room.room_number,
          capacity: room.capacity,
          type: room.type,
          building_id: room.building_id,
        });
      } else if (isOpen) {
        setFormData({
          room_number: "",
          capacity: 0,
          type: "Lecture Hall",
          building_id: 0,
        });
      }
    });
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      capacity: Number(formData.capacity),
      building_id: Number(formData.building_id),
    });
  };

  const inputClassName = "w-full text-sm border-b border-neutral-200 focus:border-black focus:outline-none py-2 transition-colors pb-1.5 bg-transparent";

  const roomTypes: RoomType[] = [
    "Lecture Hall",
    "Seminar Room",
    "Wet Lab",
    "Computer Lab",
    "Office"
  ];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {room ? "Edit Room" : "Add Room"}
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Building</label>
              <select
                required
                value={formData.building_id || ""}
                onChange={(e) => setFormData({ ...formData, building_id: Number(e.target.value) })}
                className={inputClassName}
              >
                <option value="" disabled>Select a building</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Room Number</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className={inputClassName}
                placeholder="e.g. 101A"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Capacity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className={inputClassName}
                placeholder="e.g. 50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Room Type</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomType })}
                className={inputClassName}
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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

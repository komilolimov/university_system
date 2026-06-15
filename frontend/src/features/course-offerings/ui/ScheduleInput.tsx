"use client";

import React, { useState, useEffect } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface ScheduleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ScheduleInput: React.FC<ScheduleInputProps> = ({ value, onChange }) => {
  const [days, setDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  useEffect(() => {
    queueMicrotask(() => {
      if (!value) {
        setDays([]);
        setStartTime("");
        setEndTime("");
        return;
      }
      
      // Example format: "Mon/Wed 10:00-11:30"
      const parts = value.split(" ");
      if (parts.length >= 1) {
        const parsedDays = parts[0].split("/");
        const validDays = parsedDays.filter(d => DAYS.includes(d));
        setDays(validDays);
        
        if (parts.length >= 2) {
          const timeParts = parts[1].split("-");
          if (timeParts.length === 2) {
            setStartTime(timeParts[0]);
            setEndTime(timeParts[1]);
          }
        } else {
          setStartTime("");
          setEndTime("");
        }
      }
    });
  }, [value]);

  const updateValue = (newDays: string[], newStart: string, newEnd: string) => {
    if (newDays.length === 0 && !newStart && !newEnd) {
      onChange("");
      return;
    }
    
    const daysStr = newDays.length > 0 ? newDays.join("/") : "TBD";
    const timeStr = (newStart || newEnd) ? `${newStart || "TBD"}-${newEnd || "TBD"}` : "";
    
    const finalStr = timeStr ? `${daysStr} ${timeStr}` : daysStr;
    onChange(finalStr);
  };

  const toggleDay = (day: string) => {
    const newDays = days.includes(day) 
      ? days.filter(d => d !== day)
      : [...days, day].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
      
    updateValue(newDays, startTime, endTime);
  };

  return (
    <div className="flex flex-col gap-3 p-3 border border-neutral-200 rounded-md bg-neutral-50/50">
      <div className="flex gap-2">
        {DAYS.map(day => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-colors select-none cursor-pointer ${
              days.includes(day) 
                ? "bg-black text-white border-black" 
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1 tracking-wider">Start Time</label>
          <input 
            type="time" 
            value={startTime}
            onChange={(e) => updateValue(days, e.target.value, endTime)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
          />
        </div>
        <div className="text-neutral-400 mt-4 font-medium">-</div>
        <div className="flex-1">
          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1 tracking-wider">End Time</label>
          <input 
            type="time" 
            value={endTime}
            onChange={(e) => updateValue(days, startTime, e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

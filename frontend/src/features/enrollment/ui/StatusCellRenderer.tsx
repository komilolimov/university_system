"use client";

import React, { useTransition } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { type Enrollment, type EnrollmentStatus } from "@/entities/enrollment";

const STATUS_COLORS: Record<EnrollmentStatus, string> = {
  Enrolled: "bg-green-100 text-green-800 border-green-200",
  Waitlisted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Completed: "bg-blue-100 text-blue-800 border-blue-200",
  Dropped: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export const StatusCellRenderer = (props: CustomCellRendererProps<Enrollment>) => {
  const req = props.data;
  const { onChangeStatus } = props.context || {};
  const [isPending, startTransition] = useTransition();

  if (!req) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as EnrollmentStatus;
    if (newStatus === req.status) return;

    if (onChangeStatus) {
      startTransition(() => {
        onChangeStatus(req, newStatus);
      });
    }
  };

  const colorClass = STATUS_COLORS[req.status] || "bg-neutral-100 text-neutral-800 border-neutral-200";

  return (
    <div className="h-full flex items-center">
      <div className={`relative flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${colorClass} ${isPending ? 'opacity-50' : ''}`}>
        <select
          value={req.status}
          onChange={handleChange}
          disabled={isPending || !onChangeStatus}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Change Status"
        >
          <option value="Enrolled">Enrolled</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Completed">Completed</option>
          <option value="Dropped">Dropped</option>
        </select>
        {isPending ? "Updating..." : req.status}
        {!isPending && (
          <svg className="w-3 h-3 ml-1 -mr-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
};

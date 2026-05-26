"use client";

import React from "react";

interface EnrollButtonProps {
  courseId: string;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({ courseId }) => {
  const handleEnroll = () => {
    alert(`Enrolling in course: ${courseId}`);
  };

  return (
    <button
      onClick={handleEnroll}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
    >
      Enroll
    </button>
  );
};

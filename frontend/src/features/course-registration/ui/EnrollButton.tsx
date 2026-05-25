"use client";

import { useTransition, useState } from "react";
import { enrollInCourse } from "../actions";

interface EnrollButtonProps {
  courseId: number;
}

export const EnrollButton = ({ courseId }: EnrollButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleEnroll = () => {
    startTransition(async () => {
      setMessage(null);
      const res = await enrollInCourse(courseId);
      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage("Successfully enrolled!");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full mt-auto">
      <button 
        onClick={handleEnroll}
        disabled={isPending}
        className="w-full border border-gray-900 text-gray-900 font-bold py-3 uppercase tracking-wider hover:border-black hover:text-black focus:border-black focus:outline-none transition-all disabled:opacity-50"
      >
        {isPending ? "Enrolling..." : "Enroll Now"}
      </button>
      {message && (
        <p className={"text-sm font-semibold \"}>
          {message}
        </p>
      )}
    </div>
  );
};

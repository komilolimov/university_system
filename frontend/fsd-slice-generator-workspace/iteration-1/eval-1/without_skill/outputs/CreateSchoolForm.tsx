"use client";

import { useActionState } from "react";
import { createSchoolAction } from "./createSchoolAction";

export function CreateSchoolForm() {
  const [state, action, isPending] = useActionState(createSchoolAction, null);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-medium text-sm text-gray-700">
          School Name
        </label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          disabled={isPending}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Enter school name"
        />
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="bg-blue-600 text-white font-medium rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-70 transition-colors"
      >
        {isPending ? "Creating..." : "Create School"}
      </button>
      {state?.message && (
        <p className={`text-sm mt-2 ${state.message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import { createSchoolAction } from "../api/createSchoolAction";

export function CreateSchoolForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createSchoolAction(formData);

    if (result.error) {
      setMessage({ type: "error", text: typeof result.error === 'string' ? result.error : JSON.stringify(result.error) });
    } else {
      setMessage({ type: "success", text: "School created successfully!" });
      e.currentTarget.reset();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm p-4 border rounded-md shadow-sm bg-white">
      <h2 className="text-xl font-semibold text-gray-800">Create School</h2>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          School Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter school name"
        />
      </div>

      {message && (
        <div className={`p-2 rounded text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

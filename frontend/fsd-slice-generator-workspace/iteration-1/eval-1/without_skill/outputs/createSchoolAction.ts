"use server";

import { apiClient } from "@/shared/api/apiClient";

export async function createSchoolAction(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString();

  if (!name) {
    return { message: "Name is required" };
  }

  try {
    await apiClient.post("/schools", { name });
    return { message: "School created successfully!" };
  } catch (error: any) {
    return { message: error.message || "Failed to create school" };
  }
}

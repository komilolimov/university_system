"use server";

import { apiClient } from "@/shared/api/client";

export async function createSchoolAction(formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name) {
    return { error: "Name is required" };
  }

  const response = await apiClient.POST("/api/v1/schools", {
    body: { name },
  });

  if (response.error) {
    return { error: response.error };
  }

  return { success: true, data: response.data };
}

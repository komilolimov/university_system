"use server"

import apiClient from "@/shared/api/client";
import { revalidatePath } from "next/cache";

export async function updateTokenAction(formData: FormData) {
  const token = formData.get("token");

  if (!token || typeof token !== "string") {
    return { error: "Token is required." };
  }

  try {
    const response = await apiClient.PUT("/api/v1/user/token", {
      body: { token },
    });

    if (response.error) {
      return { error: response.error.message || "Failed to update token." };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { error: "An unexpected error occurred." };
  }
}

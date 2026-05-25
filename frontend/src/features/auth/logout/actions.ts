"use server";

import { apiClient } from "@/shared/api/client";
import { clearAuthCookies } from "@/shared/auth";

export async function logoutAction() {
  await apiClient.POST("/api/v1/auth/logout");
  await clearAuthCookies();
}

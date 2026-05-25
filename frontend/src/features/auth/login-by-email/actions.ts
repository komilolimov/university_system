"use server";

import { apiClient } from "@/shared/api/client";
import { setAuthCookies } from "@/shared/auth";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { data, error } = await apiClient.POST("/api/v1/auth/login", {
    body: { email, password }
  });

  if (error) {
    return { error: "Invalid credentials or server error" };
  }

  const resData = data as any;
  if (resData?.access_token) {
    await setAuthCookies(resData.access_token, resData.refresh_token || "Theme");
    return { success: true };
  }

  return { error: "Invalid response from server" };
}

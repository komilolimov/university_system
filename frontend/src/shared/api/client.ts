import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888/api/v1",
});

apiClient.use({
  async onRequest({ request }) {
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const token = cookieStore.get("access_token")?.value;
      if (token) {
        request.headers.set("Authorization", "Bearer " + token);
      }
    }
    return request;
  }
});

import createClient from "openapi-fetch";
import type { paths } from "./schema";

// NOTE: baseUrl should NOT contain "/api/v1" if the paths in schema.d.ts already contain it.
// If NEXT_PUBLIC_API_URL has "/api/v1", it might cause duplicated paths like /api/v1/api/v1/...
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
const baseUrl = rawBaseUrl.replace(/\/api\/v1\/?$/, "");

export const apiClient = createClient<paths>({
  baseUrl: baseUrl,
});

apiClient.use({
  async onRequest({ request }) {
    // 1. Логируем точный URL, куда летит запрос (для отладки)
    console.log("Fetching URL:", request.url);

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

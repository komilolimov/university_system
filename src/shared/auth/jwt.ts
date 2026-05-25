import { cookies } from "next/headers";

export async function getJwtPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = Buffer.from(payloadBase64, "base64").toString();
    return JSON.parse(payloadJson);
  } catch (e) {
    return null;
  }
}

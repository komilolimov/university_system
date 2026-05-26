import { cookies } from "next/headers";

export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  exp?: number;
  role?: string;
  user_type?: string;
  [key: string]: unknown;
}

export async function getJwtPayload(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = Buffer.from(payloadBase64, "base64").toString();
    const payload = JSON.parse(payloadJson);
    
    if (!payload.role) {
      payload.role = "Student";
    }
    
    return payload;
  } catch {
    return null;
  }
}

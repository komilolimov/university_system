"use server";

import { redirect } from "next/navigation";
import { setAuthCookies } from "@/shared/auth/session"; 

export type LoginState = { error?: string } | null | undefined;

export async function loginAction(prevState: LoginState, formData: FormData) {
  // Добавляем .trim() чтобы убить случайные пробелы до и после текста!
  const emailVal = formData.get("email");
  const passwordVal = formData.get("password");
  const email = typeof emailVal === "string" ? emailVal.trim() : "";
  const password = typeof passwordVal === "string" ? passwordVal.trim() : "";

  // ПРОВЕРОЧНЫЙ ЛОГ: Посмотрим в терминале VS Code, что именно мы собрали
  console.log("🔥 ОТПРАВЛЯЕМ НА БЭКЕНД:", `"${email}"`, `"${password}"`);

  try {
    const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8888";
    // Убираем /api/v1 если он там случайно остался, чтобы не было дублей
    const cleanBaseUrl = rawBaseUrl.replace(/\/api\/v1\/?$/, "");
    const loginUrl = `${cleanBaseUrl}/api/v1/auth/login`;

    console.log("🔥 ФЕТЧИМ URL:", loginUrl);
    
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("🔥 СТАТУС ОШИБКИ:", response.status);
      console.log("🔥 ТЕКСТ ОШИБКИ:", errorText);
      return { error: `Ошибка ${response.status}: Проверь раскладку клавиатуры и данные` };
    }

    const data = await response.json();
    
    await setAuthCookies(data.access_token, data.refresh_token);

  } catch (error) {
    console.error("❌ FETCH FAILED:", error);
    return { error: "Ошибка сети. Бэкенд запущен?" };
  }

  redirect("/dashboard");
}
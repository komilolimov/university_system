import { apiClient } from "@/shared/api/client";
import { getJwtPayload } from "@/shared/auth/jwt";
import { StudentProfileCard } from "@/entities/student";
import { cookies } from "next/headers";

export const StudentProfileOverview = async () => {
  const payload = await getJwtPayload();
  const studentId = payload?.sub;

  if (!studentId) {
    return (
      <div className="border border-red-200 p-6 text-red-600 font-medium">
        Unauthorized or invalid token.
      </div>
    );
  }

  // Достаем очищенный токен
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value?.replace(/^"|"$/g, '');

  // Делаем запрос через ваш типизированный apiClient
 const { data, error } = await apiClient.GET("/api/v1/students/{student_id}", {
    params: {
      path: { student_id: Number(studentId) },
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // 🔥 ЖЕСТКО УКАЗЫВАЕМ КОРЕНЬ БЕЗ /api/v1, чтобы избежать дублирования
    baseUrl: "http://127.0.0.1:8888", 
    cache: "no-store",
  });

  if (error || !data) {
    console.log("🔥 ОШИБКА API CLIENT:", error);
    return (
      <div className="border border-red-200 p-6 text-red-600 font-medium">
        Failed to load student profile.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold tracking-tight text-gray-900">
        Profile Overview
      </h3>
      <StudentProfileCard student={data} />
    </div>
  );
};
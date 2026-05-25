import { apiClient } from "@/shared/api/client";
import { getJwtPayload } from "@/shared/auth/jwt";
import { StudentProfileCard } from "@/entities/student";

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

  const { data, error } = await apiClient.GET("/api/v1/students/{student_id}", {
    params: {
      path: { student_id: Number(studentId) },
    },
  });

  if (error || !data) {
    return (
      <div className="border border-red-200 p-6 text-red-600 font-medium">
        Failed to load student profile.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold tracking-tight text-gray-900">Profile Overview</h3>
      <StudentProfileCard student={data} />
    </div>
  );
};

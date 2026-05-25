import { apiClient } from "@/shared/api/client";
import { getJwtPayload } from "@/shared/auth/jwt";

export const EnrollmentList = async () => {
  const payload = await getJwtPayload();
  if (!payload || !payload.sub) return null;

  const studentId = Number(payload.sub);
  const { data: enrollments } = await apiClient.GET("/api/v1/enrollments/", {
    params: { query: { student_id: studentId } }
  });

  return <div>List goes here</div>;
};

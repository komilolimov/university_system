import { apiClient } from "@/shared/api/client";
import { getJwtPayload } from "@/shared/auth/jwt";
import { EnrollmentCard } from "@/entities/enrollment";

export const EnrollmentList = async () => {
  const payload = await getJwtPayload();
  if (!payload || !payload.sub) return null;

  const studentId = Number(payload.sub);
  const { data: enrollments } = await apiClient.GET("/api/v1/enrollments/", {
    params: { query: { student_id: studentId } }
  });

  if (!enrollments || enrollments.length === 0) return <div>No enrollments</div>;

  const enrichedEnrollments = await Promise.all(
    enrollments.map(async (enr) => {
      const { data: offering } = await apiClient.GET("/api/v1/course-offerings/{offering_id}", {
        params: { path: { offering_id: enr.offering_id } }
      });
      let course = null;
      if (offering?.catalog_id) {
        const { data: c } = await apiClient.GET("/api/v1/course-catalog/{catalog_id}", {
          params: { path: { catalog_id: offering.catalog_id } }
        });
        course = c;
      }
      return { enrollment: enr, offering, course };
    })
  );

  return (
    <div>
      {enrichedEnrollments.map(({ enrollment, offering, course }) => 
        (offering && course) ? (
          <EnrollmentCard key={enrollment.offering_id} enrollment={enrollment} offering={offering} course={course} />
        ) : null
      )}
    </div>
  );
};

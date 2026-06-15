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

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="flex flex-col gap-5 w-full select-none">
        <div className="flex flex-col gap-1 border-b border-neutral-200/60 pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            My Enrollments
          </h2>
          <p className="text-sm font-medium text-neutral-500">
            Manage your course registrations
          </p>
        </div>
        <div className="bg-neutral-50/50 border border-dashed border-neutral-200 rounded-xl p-8 flex flex-col gap-2 items-center justify-center min-h-[200px]">
          <h3 className="text-[15px] font-semibold text-neutral-900">No active enrollments</h3>
          <p className="text-sm text-neutral-500 font-medium text-center max-w-[250px]">
            You are not enrolled in any courses yet. Visit the course catalog to register.
          </p>
        </div>
      </div>
    );
  }

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
    <div className="flex flex-col gap-5 w-full select-none">
      <div className="flex flex-col gap-1 border-b border-neutral-200/60 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
          My Enrollments
        </h2>
        <p className="text-sm font-medium text-neutral-500">
          Manage your course registrations
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {enrichedEnrollments.map(({ enrollment, offering, course }) => 
          (offering && course) ? (
            <EnrollmentCard key={enrollment.offering_id} enrollment={enrollment} offering={offering} course={course} />
          ) : null
        )}
      </div>
    </div>
  );
};

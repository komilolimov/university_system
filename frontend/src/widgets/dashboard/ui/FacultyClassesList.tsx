import React from "react";
import { apiClient } from "@/shared/api/client";
import { getJwtPayload } from "@/shared/auth/jwt";
import { BookOpen, Users, CalendarDays } from "lucide-react";

export const FacultyClassesList = async () => {
  const payload = await getJwtPayload();
  if (!payload || !payload.sub) return null;

  const facultyId = Number(payload.sub);
  const { data: offerings } = await apiClient.GET("/api/v1/course-offerings/", {
    params: { query: { primary_instructor_id: facultyId } }
  });

  if (!offerings || offerings.length === 0) {
    return (
      <div className="flex flex-col gap-5 w-full select-none">
        <div className="flex flex-col gap-1 border-b border-neutral-200/60 pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            My Classes
          </h2>
          <p className="text-sm font-medium text-neutral-500">
            Your assigned course offerings for the active terms
          </p>
        </div>
        <div className="bg-neutral-50/50 border border-dashed border-neutral-200 rounded-xl p-8 flex flex-col gap-2 items-center justify-center min-h-[200px]">
          <h3 className="text-[15px] font-semibold text-neutral-900">No assigned classes</h3>
          <p className="text-sm text-neutral-500 font-medium text-center max-w-[250px]">
            You are not assigned as the primary instructor for any active courses.
          </p>
        </div>
      </div>
    );
  }

  // Enrich with course catalog info
  const enrichedOfferings = await Promise.all(
    offerings.map(async (offering) => {
      let course = null;
      if (offering.catalog_id) {
        const { data: c } = await apiClient.GET("/api/v1/course-catalog/{catalog_id}", {
          params: { path: { catalog_id: offering.catalog_id } }
        });
        course = c;
      }
      return { offering, course };
    })
  );

  return (
    <div className="flex flex-col gap-5 w-full select-none">
      <div className="flex flex-col gap-1 border-b border-neutral-200/60 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
          My Classes
        </h2>
        <p className="text-sm font-medium text-neutral-500">
          Your assigned course offerings
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {enrichedOfferings.map(({ offering, course }) => 
          (offering && course) ? (
            <div key={offering.id} className="bg-white border border-neutral-200/60 p-6 rounded-xl shadow-sm flex flex-col gap-5 w-full transition-all hover:shadow-md hover:border-neutral-300 group">
              <div className="flex flex-col gap-1.5 border-b border-neutral-100 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[17px] leading-snug font-semibold text-neutral-900 tracking-tight group-hover:text-neutral-700 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 border-blue-200/60 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                    {offering.max_capacity} Max
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[13px] font-medium text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-neutral-400" />
                    {course.code}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>{course.credits} Credits</span>
                </div>
              </div>
              
              {offering.schedule_blocks && (
                <div className="flex items-start gap-2.5 pt-1">
                  <CalendarDays className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">
                      Schedule
                    </span>
                    <span className="text-sm font-medium text-neutral-700 leading-relaxed">
                      {offering.schedule_blocks}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

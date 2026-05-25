"use server";

import { apiClient } from "@/shared/api/client";
import { getJwtPayload } from "@/shared/auth/jwt";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: number) {
  const payload = await getJwtPayload();
  const studentId = payload?.sub;

  if (!studentId) {
    return { error: "Not authenticated" };
  }

  // 1. Fetch the offering for this course (catalog_id)
  const { data: offerings, error: offeringsError } = await apiClient.GET("/api/v1/course-offerings/", {
    params: {
      query: { catalog_id: courseId },
    },
  });

  if (offeringsError || !offerings || offerings.length === 0) {
    return { error: "No active offerings found for this course." };
  }

  const offeringId = offerings[0].id;

  // 2. Create the enrollment
  const { error: enrollError } = await apiClient.POST("/api/v1/enrollments/", {
    body: {
      student_id: Number(studentId),
      offering_id: offeringId,
      status: "Enrolled",
    },
  });

  if (enrollError) {
    return { error: "Failed to enroll. You might already be enrolled." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  
  return { success: true };
}

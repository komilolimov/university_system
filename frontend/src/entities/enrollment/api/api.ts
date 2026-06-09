"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Enrollment, EnrollmentCreate, EnrollmentUpdate, EnrollmentStatus } from "../model/types";

export interface GetEnrollmentsParams {
  student_id?: number | null;
  offering_id?: number | null;
  status?: EnrollmentStatus | null;
  skip?: number;
  limit?: number;
}

export const getEnrollments = async (params: GetEnrollmentsParams = {}): Promise<Enrollment[]> => {
  const query: Record<string, string | number> = {};
  if (params.student_id !== undefined && params.student_id !== null) query.student_id = params.student_id;
  if (params.offering_id !== undefined && params.offering_id !== null) query.offering_id = params.offering_id;
  if (params.status) query.status = params.status;
  if (params.skip !== undefined) query.skip = params.skip;
  query.limit = params.limit !== undefined ? params.limit : 100;

  try {
    const { data, error } = await apiClient.GET("/api/v1/enrollments/", {
      params: { query }
    });
    if (error) {
      console.error("[getEnrollments] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createEnrollment = async (data: EnrollmentCreate): Promise<Enrollment> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/enrollments/", {
      body: data,
    });
    if (error) {
      console.error("[createEnrollment] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateEnrollment = async (studentId: number, offeringId: number, data: EnrollmentUpdate): Promise<Enrollment> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/enrollments/{student_id}/{offering_id}", {
      params: {
        path: { student_id: studentId, offering_id: offeringId },
      },
      body: data,
    });
    if (error) {
      console.error(`[updateEnrollment] API error on ${studentId}/${offeringId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteEnrollment = async (studentId: number, offeringId: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/enrollments/{student_id}/{offering_id}", {
      params: {
        path: { student_id: studentId, offering_id: offeringId },
      },
    });
    if (error) {
      console.error(`[deleteEnrollment] API error on ${studentId}/${offeringId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { CourseOffering, CourseOfferingCreate, CourseOfferingUpdate } from "../model/types";

export interface GetCourseOfferingsParams {
  is_active?: boolean | null;
  limit?: number;
  skip?: number;
}

export const getCourseOfferings = async (params: GetCourseOfferingsParams = {}): Promise<CourseOffering[]> => {
  const query: Record<string, string | number | boolean> = {};
  if (params.is_active !== null && params.is_active !== undefined) {
    query.is_active = params.is_active;
  }
  query.limit = params.limit !== undefined ? params.limit : 1000;
  if (params.skip !== undefined) query.skip = params.skip;

  try {
    const { data, error } = await apiClient.GET("/api/v1/course-offerings/", {
      params: { query },
    });
    if (error) {
      console.error("[getCourseOfferings] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as CourseOffering[]) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createCourseOffering = async (data: CourseOfferingCreate): Promise<CourseOffering> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/course-offerings/", {
      body: data as never,
    });
    if (error) {
      console.error("[createCourseOffering] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData as unknown as CourseOffering;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateCourseOffering = async (id: number, data: CourseOfferingUpdate): Promise<CourseOffering> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/course-offerings/{offering_id}", {
      params: {
        path: { offering_id: id },
      },
      body: data as never,
    });
    if (error) {
      console.error(`[updateCourseOffering] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData as unknown as CourseOffering;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteCourseOffering = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/course-offerings/{offering_id}", {
      params: {
        path: { offering_id: id },
      },
    });
    if (error) {
      console.error(`[deleteCourseOffering] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

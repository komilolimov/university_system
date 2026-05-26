"use server";

import { apiClient } from "@/shared/api/client";
import type { StudentCreate, StudentUpdate, RegionType } from "../model/types";

export interface GetStudentsParams {
  q?: string | null;
  region?: RegionType | null;
  advisor_id?: number | null;
  is_active?: boolean | null;
  skip?: number;
  limit?: number;
}

const getErrorMessage = (error: any): string => {
  if (!error) return "Unknown error occurred";
  if (typeof error.detail === "string") return error.detail;
  if (Array.isArray(error.detail)) {
    return error.detail.map((err: any) => `${err.loc.slice(1).join(" -> ")}: ${err.msg}`).join("; ");
  }
  return error.message || JSON.stringify(error);
};

export const getStudents = async (params: GetStudentsParams = {}) => {
  const query: Record<string, string | number | boolean> = {};

  if (params.q) query.q = params.q;
  if (params.region) query.region = params.region;
  if (params.advisor_id !== null && params.advisor_id !== undefined) query.advisor_id = params.advisor_id;
  if (params.is_active !== null && params.is_active !== undefined) query.is_active = params.is_active;
  if (params.skip !== undefined) query.skip = params.skip;
  if (params.limit !== undefined) query.limit = params.limit;

  try {
    const { data, error } = await apiClient.GET("/api/v1/students/", {
      params: {
        query: query,
      },
    });

    if (error) {
      console.error("[getStudents] API error on /api/v1/students/:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return data || [];
  } catch (err) {
    console.error("[getStudents] Unexpected error on /api/v1/students/:", err);
    throw err;
  }
};

export const createStudent = async (data: StudentCreate) => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/students/", {
      body: data,
    });

    if (error) {
      console.error("[createStudent] API error on /api/v1/students/:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData;
  } catch (err) {
    console.error("[createStudent] Unexpected error on /api/v1/students/:", err);
    throw err;
  }
};

export const updateStudent = async (studentId: number, data: StudentUpdate) => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/students/{student_id}", {
      params: {
        path: { student_id: studentId },
      },
      body: data,
    });

    if (error) {
      console.error(`[updateStudent] API error on /api/v1/students/${studentId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData;
  } catch (err) {
    console.error(`[updateStudent] Unexpected error on /api/v1/students/${studentId}:`, err);
    throw err;
  }
};

export const deleteStudent = async (studentId: number) => {
  try {
    const { data, error } = await apiClient.DELETE("/api/v1/students/{student_id}", {
      params: {
        path: { student_id: studentId },
      },
    });

    if (error) {
      console.error(`[deleteStudent] API error on /api/v1/students/${studentId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return data;
  } catch (err) {
    console.error(`[deleteStudent] Unexpected error on /api/v1/students/${studentId}:`, err);
    throw err;
  }
};

export const getAdvisors = async () => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/employees/");
    if (error) {
      console.error("[getAdvisors] API error on /api/v1/employees/:", JSON.stringify(error));
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[getAdvisors] Unexpected error on /api/v1/employees/:", err);
    return [];
  }
};

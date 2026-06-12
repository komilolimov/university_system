"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { School, SchoolCreate, SchoolUpdate } from "../model/types";

export interface GetSchoolsParams {
  q?: string | null;
  skip?: number;
  limit?: number;
}

export const getSchools = async (params: GetSchoolsParams = {}): Promise<School[]> => {
  const query: Record<string, string | number> = {};
  if (params.q) query.q = params.q;
  if (params.skip !== undefined) query.skip = params.skip;
  query.limit = params.limit !== undefined ? params.limit : 1000;

  try {
    const { data, error } = await apiClient.GET("/api/v1/schools/", {
      params: { query }
    });
    if (error) {
      console.error("[getSchools] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createSchool = async (data: SchoolCreate): Promise<School> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/schools/", {
      body: data,
    });
    if (error) {
      console.error("[createSchool] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateSchool = async (id: number, data: SchoolUpdate): Promise<School> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/schools/{school_id}", {
      params: {
        path: { school_id: id },
      },
      body: data,
    });
    if (error) {
      console.error(`[updateSchool] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteSchool = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/schools/{school_id}", {
      params: {
        path: { school_id: id },
      },
    });
    if (error) {
      console.error(`[deleteSchool] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

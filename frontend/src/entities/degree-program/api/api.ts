"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { DegreeProgram, DegreeProgramCreate, DegreeProgramUpdate } from "../model/types";

export interface GetDegreeProgramsParams {
  q?: string | null;
  skip?: number;
  limit?: number;
}

export const getDegreePrograms = async (params: GetDegreeProgramsParams = {}): Promise<DegreeProgram[]> => {
  const query: Record<string, string | number> = {};
  if (params.q) query.q = params.q;
  if (params.skip !== undefined) query.skip = params.skip;
  query.limit = params.limit !== undefined ? params.limit : 1000;

  try {
    const { data, error } = await apiClient.GET("/api/v1/degree-programs/", {
      params: { query }
    });
    if (error) {
      console.error("[getDegreePrograms] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createDegreeProgram = async (data: DegreeProgramCreate): Promise<DegreeProgram> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/degree-programs/", {
      body: data,
    });
    if (error) {
      console.error("[createDegreeProgram] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateDegreeProgram = async (id: number, data: DegreeProgramUpdate): Promise<DegreeProgram> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/degree-programs/{program_id}", {
      params: {
        path: { program_id: id },
      },
      body: data,
    });
    if (error) {
      console.error(`[updateDegreeProgram] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteDegreeProgram = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/degree-programs/{program_id}", {
      params: {
        path: { program_id: id },
      },
    });
    if (error) {
      console.error(`[deleteDegreeProgram] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

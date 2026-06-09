"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { ProgramRequirement, ProgramRequirementCreate, ProgramRequirementUpdate } from "../model/types";

export interface GetProgramRequirementsParams {
  q?: string | null;
  skip?: number;
  limit?: number;
}

export const getProgramRequirements = async (params: GetProgramRequirementsParams = {}): Promise<ProgramRequirement[]> => {
  const query: Record<string, string | number> = {};
  if (params.q) query.q = params.q;
  if (params.skip !== undefined) query.skip = params.skip;
  query.limit = params.limit !== undefined ? params.limit : 100;

  try {
    const { data, error } = await apiClient.GET("/api/v1/program-requirements/", {
      params: { query }
    });
    if (error) {
      console.error("[getProgramRequirements] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createProgramRequirement = async (data: ProgramRequirementCreate): Promise<ProgramRequirement> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/program-requirements/", {
      body: data,
    });
    if (error) {
      console.error("[createProgramRequirement] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateProgramRequirement = async (programId: number, catalogId: number, data: ProgramRequirementUpdate): Promise<ProgramRequirement> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/program-requirements/{program_id}/{catalog_id}", {
      params: {
        path: { program_id: programId, catalog_id: catalogId },
      },
      body: data,
    });
    if (error) {
      console.error(`[updateProgramRequirement] API error on ${programId}/${catalogId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteProgramRequirement = async (programId: number, catalogId: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/program-requirements/{program_id}/{catalog_id}", {
      params: {
        path: { program_id: programId, catalog_id: catalogId },
      },
    });
    if (error) {
      console.error(`[deleteProgramRequirement] API error on ${programId}/${catalogId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { ResearchLab, ResearchLabCreate, ResearchLabUpdate } from "../model/types";

export interface GetResearchLabsParams {
  q?: string | null;
  skip?: number;
  limit?: number;
}

export const getResearchLabs = async (params: GetResearchLabsParams = {}): Promise<ResearchLab[]> => {
  const query: Record<string, string | number> = {};
  if (params.q) query.q = params.q;
  if (params.skip !== undefined) query.skip = params.skip;
  query.limit = params.limit !== undefined ? params.limit : 100;

  try {
    const { data, error } = await apiClient.GET("/api/v1/research-labs/", {
      params: { query }
    });
    if (error) {
      console.error("[getResearchLabs] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createResearchLab = async (data: ResearchLabCreate): Promise<ResearchLab> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/research-labs/", {
      body: data,
    });
    if (error) {
      console.error("[createResearchLab] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateResearchLab = async (id: number, data: ResearchLabUpdate): Promise<ResearchLab> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/research-labs/{lab_id}", {
      params: {
        path: { lab_id: id },
      },
      body: data,
    });
    if (error) {
      console.error(`[updateResearchLab] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteResearchLab = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/research-labs/{lab_id}", {
      params: {
        path: { lab_id: id },
      },
    });
    if (error) {
      console.error(`[deleteResearchLab] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

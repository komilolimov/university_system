"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { CourseCatalog, CourseCatalogCreate, CourseCatalogUpdate } from "../model/types";

export interface GetCourseCatalogsParams {
  is_active?: boolean | null;
  q?: string;
  skip?: number;
  limit?: number;
}

export const getCourseCatalogs = async (params: GetCourseCatalogsParams = {}): Promise<CourseCatalog[]> => {
  const query: Record<string, string | number | boolean> = {};
  if (params.is_active !== null && params.is_active !== undefined) {
    query.is_active = params.is_active;
  }
  if (params.q) {
    query.q = params.q;
  }
  if (params.skip !== undefined) {
    query.skip = params.skip;
  }
  if (params.limit !== undefined) {
    query.limit = params.limit;
  }

  try {
    const { data, error } = await apiClient.GET("/api/v1/course-catalog/", {
      params: { query },
    });
    if (error) {
      console.error("[getCourseCatalogs] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as CourseCatalog[]) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createCourseCatalog = async (data: CourseCatalogCreate): Promise<CourseCatalog> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/course-catalog/", {
      body: data as never, // Assuming generated schema might not perfectly align with manually defined types, `never` bypasses openapi-fetch body typing issue.
    });
    if (error) {
      console.error("[createCourseCatalog] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData as unknown as CourseCatalog;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateCourseCatalog = async (id: number, data: CourseCatalogUpdate): Promise<CourseCatalog> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/course-catalog/{catalog_id}", {
      params: {
        path: { catalog_id: id },
      },
      body: data as never,
    });
    if (error) {
      console.error(`[updateCourseCatalog] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData as unknown as CourseCatalog;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteCourseCatalog = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/course-catalog/{catalog_id}", {
      params: {
        path: { catalog_id: id },
      },
    });
    if (error) {
      console.error(`[deleteCourseCatalog] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

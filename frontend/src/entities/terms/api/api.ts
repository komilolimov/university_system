"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Term, TermCreate, TermUpdate } from "../model/types";

export interface GetTermsParams {
  q?: string | null;
  is_active?: boolean | null;
}

export const getTerms = async (params: GetTermsParams = {}): Promise<Term[]> => {
  const query: Record<string, string | number | boolean> = {};
  if (params.q !== undefined && params.q !== null) query.q = params.q;
  if (params.is_active !== undefined && params.is_active !== null) query.is_active = params.is_active;

  try {
    const { data, error } = await apiClient.GET("/api/v1/academic-terms/", {
      params: { query },
    });
    if (error) {
      console.error("[getTerms] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as Term[]) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const getTerm = async (id: number): Promise<Term> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/academic-terms/{term_id}", {
      params: { path: { term_id: id } },
    });
    if (error) {
      console.error(`[getTerm] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return data as unknown as Term;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createTerm = async (data: TermCreate): Promise<Term> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/academic-terms/", {
      body: data as never,
    });
    if (error) {
      console.error("[createTerm] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData as unknown as Term;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateTerm = async (id: number, data: TermUpdate): Promise<Term> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/academic-terms/{term_id}", {
      params: { path: { term_id: id } },
      body: data as never,
    });
    if (error) {
      console.error(`[updateTerm] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData as unknown as Term;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteTerm = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/academic-terms/{term_id}", {
      params: { path: { term_id: id } },
    });
    if (error) {
      console.error(`[deleteTerm] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

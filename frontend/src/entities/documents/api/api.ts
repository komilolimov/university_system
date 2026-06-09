"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Document, DocumentCreate, DocumentUpdate } from "../model/types";

export interface GetDocumentsParams {
  skip?: number;
  limit?: number;
}

export const getDocuments = async (params: GetDocumentsParams = {}): Promise<Document[]> => {
  const query: Record<string, number> = {};
  if (params.skip !== undefined) query.skip = params.skip;
  query.limit = params.limit !== undefined ? params.limit : 100;

  try {
    // Note: This endpoint must exist on the backend exactly as /api/v1/documents/
    const { data, error } = await apiClient.GET("/api/v1/documents/" as any, {
      params: { query } as any
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as Document[]) ?? [];
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const getDocument = async (document_id: number): Promise<Document> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/documents/{document_id}" as any, {
      params: { path: { document_id } } as any,
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return data as unknown as Document;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const createDocument = async (document: DocumentCreate): Promise<Document> => {
  try {
    const { data, error } = await apiClient.POST("/api/v1/documents/" as any, {
      body: document as any,
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return data as unknown as Document;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const updateDocument = async (
  document_id: number,
  document: DocumentUpdate
): Promise<Document> => {
  try {
    const { data, error } = await apiClient.PUT("/api/v1/documents/{document_id}" as any, {
      params: { path: { document_id } } as any,
      body: document as any,
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return data as unknown as Document;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const deleteDocument = async (document_id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/documents/{document_id}" as any, {
      params: { path: { document_id } } as any,
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

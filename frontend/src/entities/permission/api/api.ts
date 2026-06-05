"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Permission, PermissionCreate, PermissionUpdate } from "../model/types";

export const getPermissions = async (): Promise<Permission[]> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/permissions/");
    if (error) {
      console.error("[getPermissions] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createPermission = async (data: PermissionCreate): Promise<Permission> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/permissions/", {
      body: data ,
    });
    if (error) {
      console.error("[createPermission] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updatePermission = async (id: number, data: PermissionUpdate): Promise<Permission> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/permissions/{permission_id}", {
      params: {
        path: { permission_id: id },
      },
      body: data ,
    });
    if (error) {
      console.error(`[updatePermission] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deletePermission = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/permissions/{permission_id}", {
      params: {
        path: { permission_id: id },
      },
    });
    if (error) {
      console.error(`[deletePermission] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Role, RoleCreate, RoleUpdate, RoleReadWithPermissions } from "../model/types";

export interface GetRolesParams {
  is_active?: boolean | null;
}

export const getRoles = async (params: GetRolesParams = {}): Promise<Role[]> => {
  const query: Record<string, string | number | boolean> = {};
  if (params.is_active !== null && params.is_active !== undefined) {
    query.is_active = params.is_active;
  }

  try {
    const { data, error } = await apiClient.GET("/api/v1/roles/", {
      params: { query },
    });
    if (error) {
      console.error("[getRoles] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createRole = async (data: RoleCreate): Promise<Role> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/roles/", {
      body: data ,
    });
    if (error) {
      console.error("[createRole] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateRole = async (id: number, data: RoleUpdate): Promise<Role> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/roles/{role_id}", {
      params: {
        path: { role_id: id },
      },
      body: data ,
    });
    if (error) {
      console.error(`[updateRole] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteRole = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/roles/{role_id}", {
      params: {
        path: { role_id: id },
      },
    });
    if (error) {
      console.error(`[deleteRole] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const getRole = async (id: number): Promise<RoleReadWithPermissions> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/roles/{role_id}", {
      params: {
        path: { role_id: id },
      },
    });
    if (error) {
      console.error(`[getRole] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return data as unknown as RoleReadWithPermissions;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const assignRolePermissions = async (
  id: number,
  permissionIds: number[],
  assignAll = false
): Promise<void> => {
  try {
    const { error } = await apiClient.POST("/api/v1/roles/{role_id}/permissions", {
      params: {
        path: { role_id: id },
      },
      body: {
        permission_ids: permissionIds,
        assign_all: assignAll,
      },
    });
    if (error) {
      console.error(`[assignRolePermissions] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

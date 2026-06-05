"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Department, DepartmentCreate, DepartmentUpdate } from "../model/types";

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/departments/", {
      params: { query: { limit: 100 }  }
    });
    if (error) {
      console.error("[getDepartments] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createDepartment = async (data: DepartmentCreate): Promise<Department> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/departments/", {
      body: data ,
    });
    if (error) {
      console.error("[createDepartment] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateDepartment = async (id: number, data: DepartmentUpdate): Promise<Department> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/departments/{department_id}", {
      params: {
        path: { department_id: id },
      },
      body: data ,
    });
    if (error) {
      console.error(`[updateDepartment] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteDepartment = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/departments/{department_id}", {
      params: {
        path: { department_id: id },
      },
    });
    if (error) {
      console.error(`[deleteDepartment] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

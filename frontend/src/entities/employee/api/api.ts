"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { EmployeeCreate, EmployeeUpdate, GetEmployeesParams, Employee } from "../model/types";

export const getEmployees = async (params: GetEmployeesParams = {}): Promise<Employee[]> => {
  const query: Record<string, string | number | boolean> = {};

  if (params.q) query.q = params.q;
  if (params.department_id !== null && params.department_id !== undefined) query.department_id = params.department_id;
  if (params.role_id !== null && params.role_id !== undefined) query.role_id = params.role_id;
  if (params.region) query.region = params.region;
  if (params.is_active !== null && params.is_active !== undefined) query.is_active = params.is_active;
  if (params.skip !== undefined) query.skip = params.skip;
  if (params.limit !== undefined) query.limit = params.limit;

  try {
    const { data, error } = await apiClient.GET("/api/v1/employees/", {
      params: {
        query: query ,
      },
    });

    if (error) {
      console.error("[getEmployees] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data ) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    if (err instanceof Error && err.message.includes("Unexpected error on")) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createEmployee = async (data: EmployeeCreate): Promise<Employee> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/employees/", {
      body: data ,
    });

    if (error) {
      console.error("[createEmployee] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateEmployee = async (employeeId: number, data: EmployeeUpdate): Promise<Employee> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/employees/{employee_id}", {
      params: {
        path: { employee_id: employeeId },
      },
      body: data ,
    });

    if (error) {
      console.error(`[updateEmployee] API error on ${employeeId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return responseData ;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteEmployee = async (employeeId: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/employees/{employee_id}", {
      params: {
        path: { employee_id: employeeId },
      },
    });

    if (error) {
      console.error(`[deleteEmployee] API error on ${employeeId}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

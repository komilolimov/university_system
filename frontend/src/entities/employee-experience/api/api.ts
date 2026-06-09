"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { 
  EmployeeExperience, 
  EmployeeExperienceCreate, 
  EmployeeExperienceUpdate,
  GetEmployeeExperiencesParams 
} from "../model/types";
import { revalidatePath } from "next/cache";

export const getEmployeeExperiences = async (
  params: GetEmployeeExperiencesParams = {}
): Promise<EmployeeExperience[]> => {
  const query: Record<string, string | number | boolean> = {};
  if (params.skip !== undefined) query.skip = params.skip;
  if (params.limit !== undefined) query.limit = params.limit;

  try {
    const { data, error } = await apiClient.GET("/api/v1/employee-experiences/", {
      params: { query },
    });
    if (error) {
      console.error("[getEmployeeExperiences] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as EmployeeExperience[]) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createEmployeeExperience = async (
  employeeId: number, 
  data: EmployeeExperienceCreate
): Promise<EmployeeExperience> => {
  try {
    const { data: responseData, error } = await apiClient.POST(
      "/api/v1/employee-experiences/{employee_id}", 
      {
        params: { path: { employee_id: employeeId } },
        body: data as never,
      }
    );
    if (error) {
      console.error("[createEmployeeExperience] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    revalidatePath("/employee-experience");
    return responseData as unknown as EmployeeExperience;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateEmployeeExperience = async (
  id: number, 
  data: EmployeeExperienceUpdate
): Promise<EmployeeExperience> => {
  try {
    const { data: responseData, error } = await apiClient.PUT(
      "/api/v1/employee-experiences/{experience_id}", 
      {
        params: { path: { experience_id: id } },
        body: data as never,
      }
    );
    if (error) {
      console.error(`[updateEmployeeExperience] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    revalidatePath("/employee-experience");
    return responseData as unknown as EmployeeExperience;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteEmployeeExperience = async (id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE(
      "/api/v1/employee-experiences/{experience_id}", 
      {
        params: { path: { experience_id: id } },
      }
    );
    if (error) {
      console.error(`[deleteEmployeeExperience] API error on ${id}:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    revalidatePath("/employee-experience");
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

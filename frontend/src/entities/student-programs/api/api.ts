"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { 
  StudentProgram, 
  StudentProgramCreate, 
  StudentProgramUpdate,
  GetStudentProgramsParams,
  DegreeProgram,
  Student
} from "../model/types";
import { revalidatePath } from "next/cache";

export const getStudentPrograms = async (
  params?: GetStudentProgramsParams
): Promise<StudentProgram[]> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/student-programs/", {
      params: {
        query: {
          skip: params?.skip ?? 0,
          limit: params?.limit ?? 100,
        },
      },
    });

    if (error) {
      console.error("[getStudentPrograms] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as StudentProgram[]) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const createStudentProgram = async (
  data: StudentProgramCreate
): Promise<StudentProgram> => {
  try {
    const { data: responseData, error } = await apiClient.POST("/api/v1/student-programs/", {
      body: data as never,
    });

    if (error) {
      console.error("[createStudentProgram] API error:", JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    revalidatePath("/student-programs");
    return responseData as unknown as StudentProgram;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const updateStudentProgram = async (
  student_id: number,
  program_id: number,
  data: StudentProgramUpdate
): Promise<StudentProgram> => {
  try {
    const { data: responseData, error } = await apiClient.PUT("/api/v1/student-programs/{student_id}/{program_id}", {
      params: {
        path: { student_id, program_id },
      },
      body: data as never,
    });

    if (error) {
      console.error(`[updateStudentProgram] API error:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    revalidatePath("/student-programs");
    return responseData as unknown as StudentProgram;
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const deleteStudentProgram = async (
  student_id: number,
  program_id: number
): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/student-programs/{student_id}/{program_id}", {
      params: {
        path: { student_id, program_id },
      },
    });

    if (error) {
      console.error(`[deleteStudentProgram] API error:`, JSON.stringify(error));
      throw new Error(getErrorMessage(error));
    }
    revalidatePath("/student-programs");
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const getDegreePrograms = async (): Promise<DegreeProgram[]> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/degree-programs/", {
      params: {
        query: { skip: 0, limit: 100 },
      },
    });

    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as DegreeProgram[]) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

export const getStudentsList = async (): Promise<Student[]> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/students/", {
      params: {
        query: { skip: 0, limit: 1000 },
      },
    });

    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return (data as unknown as Student[]) || [];
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    throw new Error(getErrorMessage(err));
  }
};

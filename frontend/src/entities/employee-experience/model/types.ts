import type { components } from "@/shared/api/schema";

export type EmployeeExperience = components["schemas"]["EmployeeExperienceRead"];
export type EmployeeExperienceCreate = components["schemas"]["EmployeeExperienceCreate"];
export type EmployeeExperienceUpdate = components["schemas"]["EmployeeExperienceUpdate"];

export interface GetEmployeeExperiencesParams {
  skip?: number;
  limit?: number;
}

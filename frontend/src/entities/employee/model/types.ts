import type { components } from "@/shared/api/schema";

export type RegionType = components["schemas"]["RegionType"];
export type UserType = "student" | "employee";

export type Employee = components["schemas"]["EmployeeRead"];
export type EmployeeCreate = components["schemas"]["EmployeeCreate"];
export type EmployeeUpdate = components["schemas"]["EmployeeUpdate"];

export interface GetEmployeesParams {
  q?: string | null;
  department_id?: number | null;
  role_id?: number | null;
  region?: RegionType | null;
  is_active?: boolean | null;
  skip?: number;
  limit?: number;
}

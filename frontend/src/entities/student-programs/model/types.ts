import type { components } from "@/shared/api/schema";

export type StudentProgram = components["schemas"]["StudentProgramRead"];
export type StudentProgramCreate = components["schemas"]["StudentProgramCreate"];
export type StudentProgramUpdate = components["schemas"]["StudentProgramUpdate"];
export type ProgramType = components["schemas"]["ProgramType"];
export type DegreeProgram = components["schemas"]["DegreeProgramRead"];
export type Student = components["schemas"]["StudentRead"];

export interface GetStudentProgramsParams {
  skip?: number;
  limit?: number;
}

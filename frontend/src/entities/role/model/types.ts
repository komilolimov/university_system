import type { components } from "@/shared/api/schema";
import type { Permission } from "@/entities/permission";

export type Role = components["schemas"]["RoleRead"] & {
  permissions?: Permission[];
  is_active?: boolean;
};
export type RoleCreate = components["schemas"]["RoleCreate"] & { is_active?: boolean };
export type RoleUpdate = components["schemas"]["RoleUpdate"] & { is_active?: boolean | null };

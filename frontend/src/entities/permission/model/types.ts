export interface Permission {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface PermissionCreate {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface PermissionUpdate {
  name?: string | null;
  description?: string | null;
  is_active?: boolean | null;
}

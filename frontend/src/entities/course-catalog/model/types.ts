export interface CourseCatalog {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  credits: number;
  department_id?: number | null;
  is_active: boolean;
}

export interface CourseCatalogCreate {
  code: string;
  title: string;
  description?: string | null;
  credits: number;
  department_id?: number | null;
  is_active?: boolean;
}

export interface CourseCatalogUpdate {
  code?: string;
  title?: string;
  description?: string | null;
  credits?: number;
  department_id?: number | null;
  is_active?: boolean;
}

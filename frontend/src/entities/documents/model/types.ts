export type OwnerType = "Student" | "Employee";
export type DocumentType = "Passport" | "Transcript" | "Contract" | "ID Card" | "Other";
export type DocumentStatus = "Pending" | "Verified" | "Rejected";

export interface Document {
  id: number;
  owner_type: OwnerType;
  owner_id: number;
  document_type: DocumentType;
  file_url: string;
  status: DocumentStatus;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentCreate {
  owner_type: OwnerType;
  owner_id: number;
  document_type: DocumentType;
  file_url: string;
  status?: DocumentStatus;
  is_active?: boolean;
}

export interface DocumentUpdate {
  owner_type?: OwnerType;
  owner_id?: number;
  document_type?: DocumentType;
  file_url?: string;
  status?: DocumentStatus;
  is_active?: boolean;
}

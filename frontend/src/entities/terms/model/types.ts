export interface Term {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface TermCreate {
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface TermUpdate {
  name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
}

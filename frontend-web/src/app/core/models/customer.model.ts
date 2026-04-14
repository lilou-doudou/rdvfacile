export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface CustomerPayload {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}

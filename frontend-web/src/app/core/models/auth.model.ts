export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  businessId: string;
  businessName: string;
  role: string;
}

export interface RegisterPayload {
  businessName: string;
  businessPhone: string;
  businessAddress?: string;
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

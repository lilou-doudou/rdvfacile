export interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  active: boolean;
}

export interface ServicePayload {
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  active?: boolean;
}

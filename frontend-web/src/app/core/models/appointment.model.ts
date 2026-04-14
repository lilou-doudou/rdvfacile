export enum AppointmentStatus {
  BOOKED    = 'BOOKED',
  CANCELLED = 'CANCELLED',
  DONE      = 'DONE',
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
}

export interface AppointmentPayload {
  customerId: string;
  serviceId: string;
  startTime: string;
  notes?: string;
}

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  BOOKED: 'Confirmé',
  CANCELLED: 'Annulé',
  DONE: 'Terminé',
};

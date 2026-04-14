import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentPayload, AppointmentStatus } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/appointments`;

  getAll() {
    return this.http.get<Appointment[]>(this.base);
  }

  getByDateRange(start: string, end: string) {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Appointment[]>(`${this.base}/range`, { params });
  }

  create(payload: AppointmentPayload) {
    return this.http.post<Appointment>(this.base, payload);
  }

  updateStatus(id: string, status: AppointmentStatus) {
    return this.http.patch<Appointment>(`${this.base}/${id}/status`, { status });
  }

  cancel(id: string) {
    return this.updateStatus(id, AppointmentStatus.CANCELLED);
  }

  getAvailableSlots(date: string, serviceId: string) {
    const params = new HttpParams().set('date', date).set('serviceId', serviceId);
    return this.http.get<string[]>(`${this.base}/slots`, { params });
  }
}

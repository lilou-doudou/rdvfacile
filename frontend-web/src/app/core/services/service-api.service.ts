import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Service, ServicePayload } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/services`;

  getAll() {
    return this.http.get<Service[]>(this.base);
  }

  create(payload: ServicePayload) {
    return this.http.post<Service>(this.base, payload);
  }

  update(id: string, payload: ServicePayload) {
    return this.http.put<Service>(`${this.base}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

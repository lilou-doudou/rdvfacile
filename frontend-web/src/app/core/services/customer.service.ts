import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Customer, CustomerPayload } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/customers`;

  getAll() {
    return this.http.get<Customer[]>(this.base);
  }

  create(payload: CustomerPayload) {
    return this.http.post<Customer>(this.base, payload);
  }

  update(id: string, payload: CustomerPayload) {
    return this.http.put<Customer>(`${this.base}/${id}`, payload);
  }
}

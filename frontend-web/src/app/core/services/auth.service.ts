import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload } from '../models/auth.model';

const TOKEN_KEY = 'rdv_token';
const USER_KEY  = 'rdv_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private _user = signal<AuthResponse | null>(this.loadUser());

  readonly user       = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly businessId = computed(() => this._user()?.businessId ?? '');

  login(payload: LoginPayload) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap(r => this.persist(r)));
  }

  register(payload: RegisterPayload) {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, payload);
  }

  forgotPassword(email: string) {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  verifyEmail(token: string) {
    return this.http.get<void>(`${environment.apiUrl}/auth/verify-email`, { params: { token } });
  }

  resendVerification(email: string) {
    return this.http.post<void>(`${environment.apiUrl}/auth/resend-verification`, null, { params: { email } });
  }

  getProfile() {
    return this.http.get<{ fullName: string; email: string; businessName: string; businessPhone: string; businessAddress: string }>(`${environment.apiUrl}/users/profile`);
  }

  updateProfile(payload: { fullName: string; businessName: string; businessPhone: string; businessAddress?: string }) {
    return this.http.put<void>(`${environment.apiUrl}/users/profile`, payload).pipe(
      tap(() => {
        const current = this._user();
        if (current) {
          this.persist({ ...current, fullName: payload.fullName, businessName: payload.businessName });
        }
      })
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.http.put<void>(`${environment.apiUrl}/users/password`, payload);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persist(auth: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth));
    this._user.set(auth);
  }

  private loadUser(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

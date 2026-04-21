import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointments.component').then(m => m.AppointmentsComponent),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services.component').then(m => m.ServicesComponent),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers.component').then(m => m.CustomersComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

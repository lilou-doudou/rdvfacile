import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AppointmentService } from '../../core/services/appointment.service';
import { ServiceApiService } from '../../core/services/service-api.service';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, AppointmentStatus, STATUS_LABEL } from '../../core/models/appointment.model';

interface StatCard { label: string; value: number | string; icon: string; color: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe, MatCardModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule, MatChipsModule,
  ],
  template: `
    <div class="dashboard">
      <h2 class="page-title">Bonjour, {{ auth.user()?.businessName }} 👋</h2>
      <p class="page-subtitle">{{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</p>

      <!-- Stat cards -->
      @if (loading()) {
        <div class="loading-row">
          <mat-spinner diameter="40" />
        </div>
      } @else {
        <div class="stats-grid">
          @for (card of statCards(); track card.label) {
            <mat-card class="stat-card">
              <div class="stat-icon" [style.background]="card.color">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ card.value }}</div>
                <div class="stat-label">{{ card.label }}</div>
              </div>
            </mat-card>
          }
        </div>

        <!-- Today's appointments -->
        <mat-card class="today-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>today</mat-icon> Rendez-vous aujourd'hui
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (todayAppointments().length === 0) {
              <p class="empty-state">Aucun rendez-vous aujourd'hui</p>
            } @else {
              @for (appt of todayAppointments(); track appt.id) {
                <div class="appt-row">
                  <div class="appt-time">
                    {{ appt.startTime | date:'HH:mm' }} – {{ appt.endTime | date:'HH:mm' }}
                  </div>
                  <div class="appt-info">
                    <span class="appt-customer">{{ appt.customerName }}</span>
                    <span class="appt-service">{{ appt.serviceName }}</span>
                  </div>
                  <span class="status-badge {{ appt.status.toLowerCase() }}">
                    {{ STATUS_LABEL[appt.status] }}
                  </span>
                </div>
                <mat-divider />
              }
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 960px; }
    .page-title { font-size: 1.6rem; font-weight: 700; margin: 0 0 4px; }
    .page-subtitle { color: #666; margin: 0 0 24px; text-transform: capitalize; }

    .loading-row { display: flex; justify-content: center; padding: 60px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 12px !important;
    }

    .stat-icon {
      width: 56px; height: 56px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: white; font-size: 1.5rem; }
    }

    .stat-value { font-size: 1.75rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: .85rem; color: #666; margin-top: 4px; }

    .today-card { border-radius: 12px !important; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }

    .appt-row {
      display: flex; align-items: center; gap: 16px;
      padding: 12px 0;
    }
    .appt-time { font-size: .85rem; color: #555; min-width: 100px; font-weight: 500; }
    .appt-info { flex: 1; }
    .appt-customer { font-weight: 600; display: block; }
    .appt-service  { font-size: .8rem; color: #777; }
    .empty-state { color: #999; text-align: center; padding: 24px 0; }
  `],
})
export class DashboardComponent implements OnInit {
  readonly auth               = inject(AuthService);
  private readonly apptSvc    = inject(AppointmentService);
  private readonly serviceSvc = inject(ServiceApiService);
  private readonly custSvc    = inject(CustomerService);

  readonly STATUS_LABEL = STATUS_LABEL;
  readonly today        = new Date();

  readonly loading      = signal(true);
  readonly appointments = signal<Appointment[]>([]);
  readonly totalSvcs    = signal(0);
  readonly totalCusts   = signal(0);

  readonly todayAppointments = computed(() => {
    const todayStr = this.today.toISOString().slice(0, 10);
    return this.appointments().filter(a =>
      a.startTime.startsWith(todayStr) && a.status === AppointmentStatus.BOOKED
    );
  });

  readonly statCards = computed<StatCard[]>(() => [
    {
      label: 'RDV aujourd\'hui',
      value: this.todayAppointments().length,
      icon:  'event',
      color: '#1e7e34',
    },
    {
      label: 'Total clients',
      value: this.totalCusts(),
      icon:  'people',
      color: '#1976d2',
    },
    {
      label: 'Services actifs',
      value: this.totalSvcs(),
      icon:  'content_cut',
      color: '#f57c00',
    },
    {
      label: 'RDV ce mois',
      value: this.monthCount(),
      icon:  'calendar_month',
      color: '#7b1fa2',
    },
  ]);

  private monthCount() {
    const now = this.today;
    return this.appointments().filter(a => {
      const d = new Date(a.startTime);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }

  ngOnInit() {
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const start = fmt(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
    const end   = fmt(new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0));

    this.apptSvc.getByDateRange(start, end).subscribe(appts => this.appointments.set(appts));
    this.serviceSvc.getAll().subscribe(svcs => this.totalSvcs.set(svcs.length));
    this.custSvc.getAll().subscribe(custs => {
      this.totalCusts.set(custs.length);
      this.loading.set(false);
    });
  }
}

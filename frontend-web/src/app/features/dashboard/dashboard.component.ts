import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { AppointmentService } from '../../core/services/appointment.service';
import { ServiceApiService } from '../../core/services/service-api.service';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, AppointmentStatus, STATUS_LABEL } from '../../core/models/appointment.model';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  colorVar: string;
  bgVar: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatRippleModule,
  ],
  template: `
    <div class="dashboard">

      <!-- ── En-tête ── -->
      <div class="dash-header">
        <div>
          <h1 class="page-title">Bonjour, {{ auth.user()?.businessName }} 👋</h1>
          <p class="page-subtitle">{{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</p>
        </div>
        <button mat-raised-button color="primary" (click)="navigate('/appointments')">
          <mat-icon>add</mat-icon> Nouveau RDV
        </button>
      </div>

      @if (loading()) {
        <div class="loading-row">
          <mat-spinner diameter="40" />
        </div>
      } @else {

        <!-- ── Stat cards ── -->
        <div class="stats-grid">
          @for (card of statCards(); track card.label) {
            <div class="stat-card" matRipple (click)="navigate(card.route)">
              <div class="stat-icon-wrap" [style.background]="card.bgVar">
                <mat-icon [style.color]="card.colorVar">{{ card.icon }}</mat-icon>
              </div>
              <div class="stat-body">
                <div class="stat-value" [style.color]="card.colorVar">{{ card.value }}</div>
                <div class="stat-label">{{ card.label }}</div>
              </div>
              <mat-icon class="stat-arrow">chevron_right</mat-icon>
            </div>
          }
        </div>

        <!-- ── Rendez-vous aujourd'hui ── -->
        <div class="section-card">
          <div class="section-head">
            <div class="section-title-group">
              <div class="section-dot"></div>
              <h2 class="section-title">Rendez-vous aujourd'hui</h2>
            </div>
            <span class="appt-count">{{ todayAppointments().length }}</span>
          </div>

          @if (todayAppointments().length === 0) {
            <div class="empty-box">
              <mat-icon>event_busy</mat-icon>
              <p>Aucun rendez-vous prévu aujourd'hui</p>
              <button mat-stroked-button color="primary" (click)="navigate('/appointments')">
                Planifier un RDV
              </button>
            </div>
          } @else {
            <div class="appt-list">
              @for (appt of todayAppointments(); track appt.id) {
                <div class="appt-row">
                  <div class="appt-time-block">
                    <span class="appt-start">{{ appt.startTime | date:'HH:mm' }}</span>
                    <span class="appt-end">→ {{ appt.endTime | date:'HH:mm' }}</span>
                  </div>
                  <div class="appt-divider"></div>
                  <div class="appt-info">
                    <span class="appt-customer">{{ appt.customerName }}</span>
                    <span class="appt-service">{{ appt.serviceName }}</span>
                  </div>
                  <span class="status-badge {{ appt.status.toLowerCase() }}">
                    {{ STATUS_LABEL[appt.status] }}
                  </span>
                </div>
              }
            </div>
          }
        </div>

      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 980px; }

    /* ── En-tête ── */
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .page-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.65rem;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0 0 4px;
    }

    .page-subtitle {
      font-size: .88rem;
      color: #6C757D;
      margin: 0;
      text-transform: capitalize;
    }

    /* ── Stat cards ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: white;
      border-radius: 14px;
      border: 1px solid #EAE4DC;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,.05);

      &:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,.10);
        transform: translateY(-2px);
      }
    }

    .stat-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { font-size: 1.4rem; width: 1.4rem; height: 1.4rem; }
    }

    .stat-body { flex: 1; min-width: 0; }

    .stat-value {
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: .8rem;
      color: #6C757D;
      font-weight: 500;
    }

    .stat-arrow {
      color: #D1C5B8;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      flex-shrink: 0;
    }

    /* ── Section card ── */
    .section-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #EAE4DC;
      box-shadow: 0 2px 8px rgba(0,0,0,.05);
      overflow: hidden;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #EAE4DC;
    }

    .section-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-dot {
      width: 10px;
      height: 10px;
      background: #E8600A;
      border-radius: 50%;
    }

    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #1A1A2E;
      margin: 0;
    }

    .appt-count {
      background: #FEF0E7;
      color: #E8600A;
      font-weight: 700;
      font-size: .85rem;
      padding: 2px 10px;
      border-radius: 99px;
    }

    /* ── Empty state ── */
    .empty-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 48px 24px;
      color: #9E9E9E;

      mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #D1C5B8; }
      p { margin: 0; font-size: .9rem; }
    }

    /* ── Liste rendez-vous ── */
    .appt-list { padding: 0 24px; }

    .appt-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px solid #F5F0EA;

      &:last-child { border-bottom: none; }
    }

    .appt-time-block {
      display: flex;
      flex-direction: column;
      min-width: 56px;
      flex-shrink: 0;
    }

    .appt-start {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: .9rem;
      color: #1A1A2E;
    }

    .appt-end {
      font-size: .75rem;
      color: #9E9E9E;
    }

    .appt-divider {
      width: 3px;
      height: 36px;
      background: #E8600A;
      border-radius: 99px;
      flex-shrink: 0;
      opacity: 0.35;
    }

    .appt-info {
      flex: 1;
      min-width: 0;
    }

    .appt-customer {
      font-weight: 600;
      font-size: .9rem;
      display: block;
      color: #1A1A2E;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .appt-service {
      font-size: .78rem;
      color: #6C757D;
    }

    .loading-row { display: flex; justify-content: center; padding: 60px; }

    @media (max-width: 480px) {
      .stat-card { padding: 16px; }
      .stat-value { font-size: 1.6rem; }
      .dash-header { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly router     = inject(Router);
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
      label:    'RDV aujourd\'hui',
      value:    this.todayAppointments().length,
      icon:     'event',
      colorVar: '#E8600A',
      bgVar:    '#FEF0E7',
      route:    '/appointments',
    },
    {
      label:    'Total clients',
      value:    this.totalCusts(),
      icon:     'people',
      colorVar: '#1565C0',
      bgVar:    '#E3F2FD',
      route:    '/customers',
    },
    {
      label:    'Services actifs',
      value:    this.totalSvcs(),
      icon:     'content_cut',
      colorVar: '#1E8A3E',
      bgVar:    '#E8F5E9',
      route:    '/services',
    },
    {
      label:    'RDV ce mois',
      value:    this.monthCount(),
      icon:     'calendar_month',
      colorVar: '#C8952A',
      bgVar:    '#FDF6E7',
      route:    '/appointments',
    },
  ]);

  navigate(route: string) { this.router.navigate([route]); }

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

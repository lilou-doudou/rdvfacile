import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { AppointmentService } from '../../core/services/appointment.service';
import { ServiceApiService } from '../../core/services/service-api.service';
import { CustomerService } from '../../core/services/customer.service';
import { Appointment, AppointmentStatus, STATUS_LABEL } from '../../core/models/appointment.model';
import { Service } from '../../core/models/service.model';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule,
    FullCalendarModule,
    MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatCardModule,
  ],
  template: `
    <div class="appointments-page">
      <div class="page-header">
        <h2 class="page-title">Rendez-vous</h2>
        <div style="display:flex;gap:8px">
          <button mat-stroked-button (click)="reloadAppointments()">
            <mat-icon>refresh</mat-icon> Actualiser
          </button>
          <button mat-raised-button color="primary" (click)="openNewDialog()">
            <mat-icon>add</mat-icon> Nouveau RDV
          </button>
        </div>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" class="loading-bar" />
      }
      <mat-card class="calendar-card">
        <full-calendar [options]="calendarOptions" />
      </mat-card>
    </div>

    <!-- New Appointment Dialog -->
    <ng-template #newApptDialog>
      <h2 mat-dialog-title>Nouveau rendez-vous</h2>
      <mat-dialog-content>
        <form [formGroup]="apptForm" class="dialog-form">

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Client</mat-label>
            <mat-select formControlName="customerId">
              @for (c of customers(); track c.id) {
                <mat-option [value]="c.id">{{ c.fullName }} — {{ c.phone }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Service</mat-label>
            <mat-select formControlName="serviceId">
              @for (s of services(); track s.id) {
                <mat-option [value]="s.id">{{ s.name }} ({{ s.durationMinutes }} min)</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date et heure de début</mat-label>
            <input matInput type="datetime-local" formControlName="startTime" [min]="minStartTime()" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes (optionnel)</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Annuler</button>
        <button mat-raised-button color="primary"
                [disabled]="apptForm.invalid || saving()"
                (click)="saveAppointment()">
          @if (saving()) { <mat-spinner diameter="18" /> } @else { Créer }
        </button>
      </mat-dialog-actions>
    </ng-template>

    <!-- Detail Dialog -->
    <ng-template #detailDialog>
      @if (selectedAppt()) {
        <h2 mat-dialog-title>Détail du rendez-vous</h2>
        <mat-dialog-content class="detail-content">
          <p><strong>Client :</strong> {{ selectedAppt()!.customerName }}</p>
          <p><strong>Service :</strong> {{ selectedAppt()!.serviceName }}</p>
          <p><strong>Heure :</strong>
             {{ selectedAppt()!.startTime | date:'dd/MM HH:mm' }} →
             {{ selectedAppt()!.endTime   | date:'HH:mm' }}
          </p>
          <p><strong>Statut :</strong>
            <span class="status-badge {{ selectedAppt()!.status.toLowerCase() }}">
              {{ STATUS_LABEL[selectedAppt()!.status] }}
            </span>
          </p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>Fermer</button>
          @if (selectedAppt()!.status === 'BOOKED') {
            <button mat-stroked-button color="warn"
                    (click)="cancelAppointment(selectedAppt()!.id)">
              Annuler le RDV
            </button>
          }
        </mat-dialog-actions>
      }
    </ng-template>
  `,
  styles: [`
    .appointments-page { height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .loading-bar { margin-bottom: 8px; border-radius: 4px; }
    .calendar-card { padding: 8px; border-radius: 12px !important; overflow-x: auto; }
    .dialog-form { display: flex; flex-direction: column; gap: 8px; min-width: min(340px, 90vw); padding-top: 8px; }
    .full-width { width: 100%; }
    .detail-content p { margin: 8px 0; }
    mat-spinner { display: inline-block; }
  `],
})
export class AppointmentsComponent implements OnInit {
  @ViewChild('newApptDialog') newApptDialogRef!: any;
  @ViewChild('detailDialog')  detailDialogRef!: any;

  private readonly apptSvc    = inject(AppointmentService);
  private readonly serviceSvc = inject(ServiceApiService);
  private readonly custSvc    = inject(CustomerService);
  private readonly dialog     = inject(MatDialog);
  private readonly snack      = inject(MatSnackBar);
  private readonly fb         = inject(FormBuilder);

  readonly STATUS_LABEL  = STATUS_LABEL;
  readonly loading       = signal(true);
  readonly saving        = signal(false);
  readonly appointments  = signal<Appointment[]>([]);
  readonly services      = signal<Service[]>([]);
  readonly customers     = signal<Customer[]>([]);
  readonly selectedAppt  = signal<Appointment | null>(null);

  apptForm = this.fb.group({
    customerId: ['', Validators.required],
    serviceId:  ['', Validators.required],
    startTime:  ['', Validators.required],
    notes:      [''],
  });

  readonly calendarOptions: CalendarOptions = {
    plugins:        [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView:    'timeGridWeek',
    locale:         frLocale,
    headerToolbar: {
      left:   'prev,next today',
      center: 'title',
      right:  'dayGridMonth,timeGridWeek,timeGridDay',
    },
    slotMinTime:   '07:00:00',
    slotMaxTime:   '21:00:00',
    height:        'auto',
    selectable:    true,
    selectMirror:  true,
    editable:      false,
    events:        [],
    eventClick:    (arg: EventClickArg) => this.onEventClick(arg),
    select:        (arg: DateSelectArg) => this.onDateSelect(arg),
    eventColor:    '#1e7e34',
  };

  ngOnInit() {
    this.reloadAppointments();
    this.serviceSvc.getAll().subscribe(s => this.services.set(s));
    this.custSvc.getAll().subscribe(c => this.customers.set(c));
  }

  reloadAppointments() {
    this.loading.set(true);
    const now = new Date();
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const start = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
    const end   = fmt(new Date(now.getFullYear(), now.getMonth() + 2, 0));

    this.apptSvc.getByDateRange(start, end).subscribe({
      next: appts => {
        this.appointments.set(appts);
        this.refreshCalendarEvents(appts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Erreur lors du chargement des rendez-vous', 'Réessayer', { duration: 5000 })
          .onAction().subscribe(() => this.reloadAppointments());
      },
    });
  }

  openNewDialog(prefilledStart?: string) {
    if (prefilledStart) this.apptForm.patchValue({ startTime: prefilledStart });
    this.dialog.open(this.newApptDialogRef);
  }

  saveAppointment() {
    if (this.apptForm.invalid) return;
    this.saving.set(true);
    const v = this.apptForm.value;

    this.apptSvc.create({
      customerId: v.customerId!,
      serviceId:  v.serviceId!,
      startTime:  v.startTime!.length === 16 ? v.startTime! + ':00' : v.startTime!,
      notes:      v.notes ?? '',
    }).subscribe({
      next: (appt) => {
        this.appointments.update(list => [...list, appt]);
        this.refreshCalendarEvents(this.appointments());
        this.dialog.closeAll();
        this.apptForm.reset();
        this.saving.set(false);
        this.snack.open('Rendez-vous créé', '', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(this.extractApiError(err), 'Fermer', { duration: 5000 });
        this.saving.set(false);
      },
    });
  }

  cancelAppointment(id: string) {
    this.apptSvc.cancel(id).subscribe({
      next: () => {
        this.appointments.update(list =>
          list.map(a => a.id === id ? { ...a, status: AppointmentStatus.CANCELLED } : a)
        );
        this.refreshCalendarEvents(this.appointments());
        this.dialog.closeAll();
        this.snack.open('Rendez-vous annulé', '', { duration: 3000 });
      },
    });
  }

  private onEventClick(arg: EventClickArg) {
    const appt = this.appointments().find(a => a.id === arg.event.id);
    if (appt) {
      this.selectedAppt.set(appt);
      this.dialog.open(this.detailDialogRef);
    }
  }

  private onDateSelect(arg: DateSelectArg) {
    const selected = new Date(arg.start);

    // In month view, FullCalendar often returns all-day selections at 00:00.
    if (arg.allDay) {
      selected.setHours(9, 0, 0, 0);
    }

    const nowPlus30Min = new Date(Date.now() + 30 * 60 * 1000);
    if (selected < nowPlus30Min) {
      selected.setTime(nowPlus30Min.getTime());
    }

    const local = this.toLocalDatetimeInput(selected);
    this.openNewDialog(local);
  }

  minStartTime(): string {
    return this.toLocalDatetimeInput(new Date(Date.now() + 60 * 1000));
  }

  private refreshCalendarEvents(appts: Appointment[]) {
    this.calendarOptions.events = appts.map(a => ({
      id:        a.id,
      title:     `${a.customerName} — ${a.serviceName}`,
      start:     a.startTime,
      end:       a.endTime,
      color:     a.status === AppointmentStatus.CANCELLED ? '#c62828'
               : a.status === AppointmentStatus.DONE      ? '#388e3c'
               : '#1e7e34',
      textColor: '#fff',
    }));
  }

  private toLocalDatetimeInput(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private extractApiError(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return 'Erreur lors de la creation';
    }

    const body = err.error as { error?: string; message?: string; details?: Record<string, string> } | null;
    if (!body) {
      return 'Erreur lors de la creation';
    }

    if (body.error) {
      return body.error;
    }

    if (body.message) {
      return body.message;
    }

    if (body.details && Object.keys(body.details).length > 0) {
      return Object.values(body.details)[0];
    }

    return 'Erreur lors de la creation';
  }
}

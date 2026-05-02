import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ServiceApiService } from '../../core/services/service-api.service';
import { Service, ServicePayload } from '../../core/models/service.model';

function minDurationValidator(group: AbstractControl): ValidationErrors | null {
  const h = Number(group.get('durationHours')?.value) || 0;
  const m = Number(group.get('durationMins')?.value) || 0;
  return (h * 60 + m) >= 15 ? null : { minDuration: true };
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Supprimer le service</h2>
    <mat-dialog-content>
      <p>Êtes-vous sûr de vouloir supprimer <strong>{{ data.name }}</strong> ?</p>
      <p style="color:#666;font-size:.85rem;margin-top:4px">Cette action est irréversible.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Annuler</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Supprimer</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialogComponent {
  readonly data = inject<{ name: string }>(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    DecimalPipe, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatCardModule, MatSlideToggleModule,
  ],
  template: `
    <div class="services-page">
      <div class="page-header">
        <h2 class="page-title">Services</h2>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon> Ajouter un service
        </button>
      </div>

      @if (loading()) {
        <div class="loading-center"><mat-spinner diameter="40" /></div>
      } @else {
        <mat-card class="table-card">
          <table mat-table [dataSource]="dataSource" class="full-width">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let s">
                <strong>{{ s.name }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef>Durée</th>
              <td mat-cell *matCellDef="let s">{{ formatDuration(s.durationMinutes) }}</td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Prix</th>
              <td mat-cell *matCellDef="let s">
                {{ s.price != null ? (s.price | number:'1.0-0') + ' FCFA' : '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Actif</th>
              <td mat-cell *matCellDef="let s">
                <span [class]="s.active ? 'badge-active' : 'badge-inactive'">
                  {{ s.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let s">
                <button class="action-btn" (click)="openDialog(s)" title="Modifier" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button class="action-btn warn" (click)="confirmDelete(s)" title="Supprimer" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>

          @if (dataSource.data.length === 0) {
            <p class="empty-table">Aucun service créé. Commencez par en ajouter un !</p>
          }
        </mat-card>
      }
    </div>

    <!-- Dialog édition/création -->
    <ng-template #serviceDialog>
      <h2 mat-dialog-title>{{ editingId() ? 'Modifier' : 'Nouveau' }} service</h2>
      <mat-dialog-content>
        <form [formGroup]="svcForm" class="dialog-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom du service</mat-label>
            <input matInput formControlName="name" />
            @if (svcForm.get('name')?.hasError('required') && svcForm.get('name')?.touched) {
              <mat-error>Champ requis</mat-error>
            }
          </mat-form-field>

          <div style="display:flex;gap:12px">
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Heures</mat-label>
              <input matInput type="number" formControlName="durationHours" min="0" max="23" />
              @if (svcForm.get('durationHours')?.hasError('max')) {
                <mat-error>Max 23h</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex:1">
              <mat-label>Minutes</mat-label>
              <input matInput type="number" formControlName="durationMins" min="0" max="59" />
              @if (svcForm.get('durationMins')?.hasError('max')) {
                <mat-error>Max 59 min</mat-error>
              }
            </mat-form-field>
          </div>
          @if (svcForm.hasError('minDuration') && (svcForm.get('durationHours')?.touched || svcForm.get('durationMins')?.touched)) {
            <p style="color:#d32f2f;font-size:.75rem;margin:-8px 0 4px">Durée minimale : 15 minutes</p>
          }

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Prix (FCFA)</mat-label>
            <input matInput type="number" formControlName="price" min="0" placeholder="Optionnel" />
            @if (svcForm.get('price')?.hasError('min')) {
              <mat-error>Le prix ne peut pas être négatif</mat-error>
            }
            @if (svcForm.get('price')?.hasError('max')) {
              <mat-error>Prix trop élevé</mat-error>
            }
          </mat-form-field>

          <mat-slide-toggle formControlName="active" color="primary">
            Service actif
          </mat-slide-toggle>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Annuler</button>
        <button mat-raised-button color="primary"
                [disabled]="svcForm.invalid || saving()"
                (click)="saveService()">
          @if (saving()) { <mat-spinner diameter="18" /> }
          @else { {{ editingId() ? 'Enregistrer' : 'Créer' }} }
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .services-page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .table-card { border-radius: 12px !important; overflow-x: auto; }
    .full-width { width: 100%; min-width: 480px; }
    .dialog-form { display: flex; flex-direction: column; gap: 12px; min-width: 320px; padding-top: 8px; }
    .empty-table { text-align: center; color: #999; padding: 24px; }
    .chip-active   { --mdc-chip-label-text-color: white; background: #1e7e34 !important; }
    .chip-inactive { --mdc-chip-label-text-color: white; background: #9e9e9e !important; }
    .badge-active   { background: #1e7e34; color: white; padding: 4px 12px; border-radius: 16px; font-size: .8rem; font-weight: 600; white-space: nowrap; }
    .badge-inactive { background: #9e9e9e; color: white; padding: 4px 12px; border-radius: 16px; font-size: .8rem; font-weight: 600; white-space: nowrap; }
    mat-spinner { display: inline-block; }
    .mat-column-actions { width: 100px; min-width: 100px; white-space: nowrap; padding: 0 4px !important; }
    .mat-column-duration { white-space: nowrap; }
    .mat-column-price { white-space: nowrap; }
    .action-btn { background: none; border: none; cursor: pointer; border-radius: 50%; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; padding: 0; color: rgba(0,0,0,.6); transition: background .15s; }
    .action-btn:hover { background: rgba(0,0,0,.06); }
    .action-btn.warn { color: #d32f2f; }
    .action-btn.warn:hover { background: rgba(211,47,47,.08); }
  `],
})
export class ServicesComponent implements OnInit {
  @ViewChild('serviceDialog') serviceDialogRef!: any;

  private readonly svc   = inject(ServiceApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack  = inject(MatSnackBar);
  private readonly fb     = inject(FormBuilder);

  readonly loading    = signal(true);
  readonly saving     = signal(false);
  readonly editingId  = signal<string | null>(null);
  readonly dataSource = new MatTableDataSource<Service>();

  readonly columns = ['name', 'duration', 'price', 'active', 'actions'];

  svcForm = this.fb.group({
    name:          ['', Validators.required],
    durationHours: [0,  [Validators.required, Validators.min(0), Validators.max(23)]],
    durationMins:  [30, [Validators.required, Validators.min(0), Validators.max(59)]],
    price:         [null as number | null, [Validators.min(0), Validators.max(9999999999)]],
    active:        [true],
  }, { validators: minDurationValidator });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: (list) => {
        this.dataSource.data = (list ?? []).filter(s => s?.id && s?.name?.trim());
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openDialog(service?: Service) {
    this.editingId.set(service?.id ?? null);
    const totalMin = service?.durationMinutes ?? 30;
    this.svcForm.reset({
      name:          service?.name ?? '',
      durationHours: Math.floor(totalMin / 60),
      durationMins:  totalMin % 60,
      price:         service?.price ?? null,
      active:        service?.active ?? true,
    });
    this.dialog.open(this.serviceDialogRef);
  }

  saveService() {
    if (this.svcForm.invalid) return;
    this.saving.set(true);
    const raw = this.svcForm.value;
    const payload: ServicePayload = {
      name:            raw.name!,
      durationMinutes: (Number(raw.durationHours) || 0) * 60 + (Number(raw.durationMins) || 0),
      price:           raw.price ?? undefined,
      active:          raw.active ?? true,
    };
    const id = this.editingId();

    const obs = id ? this.svc.update(id, payload) : this.svc.create(payload);
    obs.subscribe({
      next: (saved) => {
        if (id) {
          this.dataSource.data = this.dataSource.data.map(s => s.id === id ? saved : s);
        } else {
          this.dataSource.data = [...this.dataSource.data, saved];
        }
        this.dialog.closeAll();
        this.saving.set(false);
        this.snack.open('Service enregistré', '', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Erreur', 'Fermer', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(service: Service) {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { name: service.name },
      width: '360px',
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.doDelete(service.id);
    });
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  doDelete(id: string) {
    this.svc.delete(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(s => s.id !== id);
        this.snack.open('Service supprimé', '', { duration: 3000 });
      },
      error: () => {
        this.snack.open('Erreur lors de la suppression', 'Fermer', { duration: 4000 });
      },
    });
  }
}

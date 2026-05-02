import { Component, ChangeDetectorRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ServiceApiService } from '../../core/services/service-api.service';
import { Service, ServicePayload } from '../../core/models/service.model';

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
          <table mat-table [dataSource]="servicesData" class="full-width">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let s">
                <strong>{{ s.name }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef>Durée</th>
              <td mat-cell *matCellDef="let s">{{ s.durationMinutes }} min</td>
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
                  <span class="material-icons">edit</span>
                </button>
                <button class="action-btn warn" (click)="deleteService(s.id)" title="Supprimer" type="button">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>

          @if (servicesData.length === 0) {
            <p class="empty-table">Aucun service créé. Commencez par en ajouter un !</p>
          }
        </mat-card>
      }
    </div>

    <!-- Dialog -->
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

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Durée (minutes)</mat-label>
            <input matInput type="number" formControlName="durationMinutes" min="5" />
            @if (svcForm.get('durationMinutes')?.hasError('min')) {
              <mat-error>Minimum 5 minutes</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Prix (FCFA)</mat-label>
            <input matInput type="number" formControlName="price" min="0" />
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
    .action-btn .material-icons { font-size: 20px; }
  `],
})
export class ServicesComponent implements OnInit {
  @ViewChild('serviceDialog') serviceDialogRef!: any;

  private readonly svc   = inject(ServiceApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack  = inject(MatSnackBar);
  private readonly fb     = inject(FormBuilder);
  private readonly cdr    = inject(ChangeDetectorRef);

  readonly loading   = signal(true);
  readonly saving    = signal(false);
  readonly editingId = signal<string | null>(null);
  servicesData: Service[] = [];

  readonly columns = ['name', 'duration', 'price', 'active', 'actions'];

  svcForm = this.fb.group({
    name:            ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(5)]],
    price:           [0, Validators.required],
    active:          [true],
  });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: (list) => {
        this.servicesData = (list ?? []).filter(s => s?.id && s?.name?.trim());
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openDialog(service?: Service) {
    this.editingId.set(service?.id ?? null);
    this.svcForm.reset({
      name:            service?.name ?? '',
      durationMinutes: service?.durationMinutes ?? 30,
      price:           service?.price ?? 0,
      active:          service?.active ?? true,
    });
    this.dialog.open(this.serviceDialogRef);
  }

  saveService() {
    if (this.svcForm.invalid) return;
    this.saving.set(true);
    const payload: ServicePayload = this.svcForm.value as ServicePayload;
    const id = this.editingId();

    const obs = id ? this.svc.update(id, payload) : this.svc.create(payload);
    obs.subscribe({
      next: (saved) => {
        if (id) {
          this.servicesData = this.servicesData.map(s => s.id === id ? saved : s);
        } else {
          this.servicesData = [...this.servicesData, saved];
        }
        this.dialog.closeAll();
        this.saving.set(false);
        this.cdr.markForCheck();
        this.snack.open('Service enregistré', '', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Erreur', 'Fermer', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  deleteService(id: string) {
    this.svc.delete(id).subscribe({
      next: () => {
        this.servicesData = this.servicesData.filter(s => s.id !== id);
        this.cdr.markForCheck();
        this.snack.open('Service supprimé', '', { duration: 3000 });
      },
    });
  }
}

import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ServiceApiService } from '../../core/services/service-api.service';
import { Service, ServicePayload } from '../../core/models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CurrencyPipe, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatCardModule, MatChipsModule, MatSlideToggleModule,
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
          <table mat-table [dataSource]="services()" class="full-width">

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
              <td mat-cell *matCellDef="let s">{{ s.price | currency:'XOF':'symbol':'1.0-0':'fr' }}</td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Actif</th>
              <td mat-cell *matCellDef="let s">
                <mat-chip [class]="s.active ? 'chip-active' : 'chip-inactive'">
                  {{ s.active ? 'Actif' : 'Inactif' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button (click)="openDialog(s)" title="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteService(s.id)" title="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>

          @if (services().length === 0) {
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
    .table-card { border-radius: 12px !important; overflow: hidden; }
    .full-width { width: 100%; }
    .dialog-form { display: flex; flex-direction: column; gap: 12px; min-width: 320px; padding-top: 8px; }
    .empty-table { text-align: center; color: #999; padding: 24px; }
    .chip-active   { --mdc-chip-label-text-color: white; background: #1e7e34 !important; }
    .chip-inactive { --mdc-chip-label-text-color: white; background: #9e9e9e !important; }
    mat-spinner { display: inline-block; }
  `],
})
export class ServicesComponent implements OnInit {
  @ViewChild('serviceDialog') serviceDialogRef!: any;

  private readonly svc   = inject(ServiceApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack  = inject(MatSnackBar);
  private readonly fb     = inject(FormBuilder);

  readonly loading   = signal(true);
  readonly saving    = signal(false);
  readonly services  = signal<Service[]>([]);
  readonly editingId = signal<string | null>(null);

  readonly columns = ['name', 'duration', 'price', 'active', 'actions'];

  svcForm = this.fb.group({
    name:            ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(5)]],
    price:           [0, Validators.required],
    active:          [true],
  });

  ngOnInit() {
    this.svc.getAll().subscribe(list => { this.services.set(list); this.loading.set(false); });
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
        this.services.update(list =>
          id ? list.map(s => s.id === id ? saved : s)
             : [...list, saved]
        );
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

  deleteService(id: string) {
    this.svc.delete(id).subscribe({
      next: () => {
        this.services.update(list => list.filter(s => s.id !== id));
        this.snack.open('Service supprimé', '', { duration: 3000 });
      },
    });
  }
}

import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import { MatSortModule } from '@angular/material/sort';
import { CustomerService } from '../../core/services/customer.service';
import { Customer, CustomerPayload } from '../../core/models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatSortModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatCardModule,
  ],
  template: `
    <div class="customers-page">
      <div class="page-header">
        <h2 class="page-title">Clients ({{ customers().length }})</h2>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon> Ajouter un client
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher…</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (input)="filter($event)" />
      </mat-form-field>

      @if (loading()) {
        <div class="loading-center"><mat-spinner diameter="40" /></div>
      } @else {
        <mat-card class="table-card">
          <table mat-table [dataSource]="filtered()" class="full-width">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let c"><strong>{{ c.fullName }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Téléphone WhatsApp</th>
              <td mat-cell *matCellDef="let c">{{ c.phone }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let c">{{ c.email ?? '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button (click)="openDialog(c)" title="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>

          @if (filtered().length === 0) {
            <p class="empty-table">{{ customers().length ? 'Aucun résultat' : 'Aucun client enregistré.' }}</p>
          }
        </mat-card>
      }
    </div>

    <!-- Dialog -->
    <ng-template #customerDialog>
      <h2 mat-dialog-title>{{ editingId() ? 'Modifier' : 'Nouveau' }} client</h2>
      <mat-dialog-content>
        <form [formGroup]="custForm" class="dialog-form">

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom complet</mat-label>
            <input matInput formControlName="fullName" />
            @if (custForm.get('fullName')?.hasError('required') && custForm.get('fullName')?.touched) {
              <mat-error>Champ requis</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Téléphone WhatsApp</mat-label>
            <mat-icon matPrefix>whatsapp</mat-icon>
            <input matInput formControlName="phone" placeholder="+224612345678" />
            @if (custForm.get('phone')?.invalid && custForm.get('phone')?.touched) {
              <mat-error>Numéro international requis (ex: +224…)</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email (optionnel)</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Annuler</button>
        <button mat-raised-button color="primary"
                [disabled]="custForm.invalid || saving()"
                (click)="saveCustomer()">
          @if (saving()) { <mat-spinner diameter="18" /> }
          @else { {{ editingId() ? 'Enregistrer' : 'Créer' }} }
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .customers-page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .search-field { width: 100%; margin-bottom: 20px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .table-card { border-radius: 12px !important; overflow: hidden; }
    .full-width { width: 100%; }
    .dialog-form { display: flex; flex-direction: column; gap: 12px; min-width: 320px; padding-top: 8px; }
    .empty-table { text-align: center; color: #999; padding: 24px; }
    mat-spinner { display: inline-block; }
  `],
})
export class CustomersComponent implements OnInit {
  @ViewChild('customerDialog') customerDialogRef!: any;

  private readonly cust   = inject(CustomerService);
  private readonly dialog = inject(MatDialog);
  private readonly snack  = inject(MatSnackBar);
  private readonly fb     = inject(FormBuilder);

  readonly loading   = signal(true);
  readonly saving    = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly filtered  = signal<Customer[]>([]);
  readonly editingId = signal<string | null>(null);

  readonly columns = ['name', 'phone', 'email', 'actions'];

  custForm = this.fb.group({
    fullName: ['', Validators.required],
    phone:    ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{7,14}$/)]],
    email:    [''],
  });

  ngOnInit() {
    this.cust.getAll().subscribe(list => {
      this.customers.set(list);
      this.filtered.set(list);
      this.loading.set(false);
    });
  }

  filter(event: Event) {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(
      this.customers().filter(c =>
        c.fullName.toLowerCase().includes(q) || c.phone.includes(q)
      )
    );
  }

  openDialog(customer?: Customer) {
    this.editingId.set(customer?.id ?? null);
    this.custForm.reset({
      fullName: customer?.fullName ?? '',
      phone:    customer?.phone    ?? '',
      email:    customer?.email    ?? '',
    });
    this.dialog.open(this.customerDialogRef);
  }

  saveCustomer() {
    if (this.custForm.invalid) return;
    this.saving.set(true);
    const payload: CustomerPayload = this.custForm.value as CustomerPayload;
    const id = this.editingId();

    const obs = id ? this.cust.update(id, payload) : this.cust.create(payload);
    obs.subscribe({
      next: (saved) => {
        this.customers.update(list =>
          id ? list.map(c => c.id === id ? saved : c)
             : [...list, saved]
        );
        this.filtered.set(this.customers());
        this.dialog.closeAll();
        this.saving.set(false);
        this.snack.open('Client enregistré', '', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Erreur', 'Fermer', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }
}

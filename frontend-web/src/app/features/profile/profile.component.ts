import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatDividerModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <h1 class="page-title">Mon profil</h1>
        <p class="page-subtitle">Gérez vos informations personnelles et votre commerce</p>
      </div>

      @if (loading()) {
        <div class="loading-center">
          <mat-spinner diameter="40" />
        </div>
      } @else {

        <!-- Informations personnelles & commerce -->
        <mat-card class="section-card">
          <mat-card-header>
            <div mat-card-avatar class="avatar-icon">
              <mat-icon>person</mat-icon>
            </div>
            <mat-card-title>Informations</mat-card-title>
            <mat-card-subtitle>Nom, commerce, contact</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form-grid">

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom complet</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="fullName" placeholder="Prénom Nom" />
                @if (profileForm.get('fullName')?.hasError('required') && profileForm.get('fullName')?.touched) {
                  <mat-error>Champ requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email (non modifiable)</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput [value]="email()" readonly />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom du commerce</mat-label>
                <mat-icon matPrefix>store</mat-icon>
                <input matInput formControlName="businessName" placeholder="Salon Premium…" />
                @if (profileForm.get('businessName')?.hasError('required') && profileForm.get('businessName')?.touched) {
                  <mat-error>Champ requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Numéro WhatsApp</mat-label>
                <mat-icon matPrefix style="color:#25D366">whatsapp</mat-icon>
                <input matInput formControlName="businessPhone" placeholder="+2250712345678" />
                @if (profileForm.get('businessPhone')?.invalid && profileForm.get('businessPhone')?.touched) {
                  <mat-error>Format international requis (ex: +225…)</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Adresse (optionnel)</mat-label>
                <mat-icon matPrefix>location_on</mat-icon>
                <input matInput formControlName="businessAddress" placeholder="Rue, Ville…" />
              </mat-form-field>

              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="savingProfile()">
                  @if (savingProfile()) { <mat-spinner diameter="18" /> }
                  @else { <mat-icon>save</mat-icon> }
                  Enregistrer
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Changer le mot de passe -->
        <mat-card class="section-card">
          <mat-card-header>
            <div mat-card-avatar class="avatar-icon orange">
              <mat-icon>lock</mat-icon>
            </div>
            <mat-card-title>Mot de passe</mat-card-title>
            <mat-card-subtitle>Modifier votre mot de passe</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="form-grid">

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mot de passe actuel</mat-label>
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput [type]="showCurrent() ? 'text' : 'password'" formControlName="currentPassword" />
                <button mat-icon-button matSuffix type="button" (click)="showCurrent.set(!showCurrent())">
                  <mat-icon>{{ showCurrent() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (passwordForm.get('currentPassword')?.hasError('required') && passwordForm.get('currentPassword')?.touched) {
                  <mat-error>Champ requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nouveau mot de passe</mat-label>
                <mat-icon matPrefix>lock</mat-icon>
                <input matInput [type]="showNew() ? 'text' : 'password'" formControlName="newPassword" />
                <button mat-icon-button matSuffix type="button" (click)="showNew.set(!showNew())">
                  <mat-icon>{{ showNew() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
                  <mat-error>Minimum 8 caractères</mat-error>
                }
              </mat-form-field>

              <div class="form-actions">
                <button mat-flat-button color="accent" type="submit" [disabled]="savingPassword()">
                  @if (savingPassword()) { <mat-spinner diameter="18" /> }
                  @else { <mat-icon>lock_reset</mat-icon> }
                  Changer le mot de passe
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .profile-page {
      max-width: 640px;
      margin: 0 auto;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header { margin-bottom: 4px; }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 4px;
      color: #1A1A2E;
    }

    .page-subtitle {
      font-size: .875rem;
      color: #6C757D;
      margin: 0;
    }

    .loading-center {
      display: flex;
      justify-content: center;
      padding: 60px 0;
    }

    .section-card {
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,.08);
    }

    .avatar-icon {
      width: 40px;
      height: 40px;
      background: #1A1A2E;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: white; }
    }

    .avatar-icon.orange { background: #E8600A; }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 16px;
    }

    .full-width { width: 100%; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  `],
})
export class ProfileComponent implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly fb    = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly loading       = signal(true);
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly showCurrent   = signal(false);
  readonly showNew       = signal(false);
  readonly email         = signal('');

  profileForm = this.fb.group({
    fullName:        ['', Validators.required],
    businessName:    ['', Validators.required],
    businessPhone:   ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{7,14}$/)]],
    businessAddress: [''],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (p) => {
        this.email.set(p.email);
        this.profileForm.patchValue({
          fullName:        p.fullName,
          businessName:    p.businessName,
          businessPhone:   p.businessPhone,
          businessAddress: p.businessAddress ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.snack.open('Impossible de charger le profil', 'Fermer', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    const v = this.profileForm.value;
    this.auth.updateProfile({
      fullName:        v.fullName!,
      businessName:    v.businessName!,
      businessPhone:   v.businessPhone!,
      businessAddress: v.businessAddress ?? undefined,
    }).subscribe({
      next: () => {
        this.snack.open('Profil mis à jour ✓', 'Fermer', { duration: 3000 });
        this.savingProfile.set(false);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Erreur lors de la mise à jour', 'Fermer', { duration: 4000 });
        this.savingProfile.set(false);
      },
    });
  }

  savePassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.savingPassword.set(true);
    const v = this.passwordForm.value;
    this.auth.changePassword({
      currentPassword: v.currentPassword!,
      newPassword:     v.newPassword!,
    }).subscribe({
      next: () => {
        this.snack.open('Mot de passe modifié ✓', 'Fermer', { duration: 3000 });
        this.passwordForm.reset();
        this.savingPassword.set(false);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Erreur lors du changement de mot de passe', 'Fermer', { duration: 4000 });
        this.savingPassword.set(false);
      },
    });
  }
}

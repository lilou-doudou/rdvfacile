import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatStepperModule,
  ],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-logo">
            <mat-icon>event_available</mat-icon>
            <h1>RdvFacile</h1>
          </div>
          <mat-card-subtitle>Créez votre espace marchand</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Commerce -->
            <p class="section-label"><mat-icon>store</mat-icon> Votre commerce</p>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom du commerce</mat-label>
              <input matInput formControlName="businessName" />
              @if (form.get('businessName')?.hasError('required') && form.get('businessName')?.touched) {
                <mat-error>Champ requis</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Téléphone WhatsApp</mat-label>
              <mat-icon matPrefix>whatsapp</mat-icon>
              <input matInput formControlName="businessPhone" placeholder="+224612345678" />
              @if (form.get('businessPhone')?.invalid && form.get('businessPhone')?.touched) {
                <mat-error>Numéro requis (format international)</mat-error>
              }
            </mat-form-field>

            <!-- Compte -->
            <p class="section-label"><mat-icon>person</mat-icon> Votre compte</p>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Votre nom complet</mat-label>
              <input matInput formControlName="fullName" />
              @if (form.get('fullName')?.hasError('required') && form.get('fullName')?.touched) {
                <mat-error>Champ requis</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput
                     [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password"
                     autocomplete="new-password" />
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('minlength')) {
                <mat-error>8 caractères minimum</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary"
                    type="submit"
                    class="full-width submit-btn"
                    [disabled]="loading()">
              @if (loading()) { <mat-spinner diameter="20" /> }
              @else { Créer mon espace }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="login-link">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
      padding: 16px;
    }
    .auth-card { width: 100%; max-width: 460px; padding: 16px; border-radius: 12px; }
    .auth-logo {
      display: flex; align-items: center; gap: 10px; width: 100%; margin-bottom: 4px;
      h1 { margin: 0; font-size: 1.5rem; color: #1e7e34; }
      mat-icon { color: #1e7e34; font-size: 1.8rem; width: 1.8rem; height: 1.8rem; }
    }
    .section-label {
      display: flex; align-items: center; gap: 6px;
      color: #1e7e34; font-weight: 600; margin: 16px 0 8px;
      mat-icon { font-size: 1.1rem; }
    }
    .full-width { width: 100%; margin-bottom: 8px; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 8px; }
    .login-link { text-align: center; font-size: .875rem; color: #666; }
    .login-link a { color: #1e7e34; font-weight: 600; text-decoration: none; }
  `],
})
export class RegisterComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);
  private readonly snack  = inject(MatSnackBar);

  readonly showPassword = signal(false);
  readonly loading      = signal(false);

  form = this.fb.group({
    businessName:  ['', Validators.required],
    businessPhone: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{7,14}$/)]],
    fullName:      ['', Validators.required],
    email:         ['', [Validators.required, Validators.email]],
    password:      ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const v = this.form.value;

    this.auth.register({
      businessName:  v.businessName!,
      businessPhone: v.businessPhone!,
      fullName:      v.fullName!,
      email:         v.email!,
      password:      v.password!,
    }).subscribe({
      next:  () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Erreur lors de l\'inscription', 'Fermer', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}

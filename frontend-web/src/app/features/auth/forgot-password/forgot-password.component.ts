import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-logo">
            <mat-icon>lock_reset</mat-icon>
            <h1>RdvFacile</h1>
          </div>
          <mat-card-subtitle>Réinitialiser votre mot de passe</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (sent()) {
            <div class="success-message">
              <mat-icon color="primary">check_circle</mat-icon>
              <p>Un email de réinitialisation a été envoyé à <strong>{{ form.value.email }}</strong>.<br>
              Vérifiez votre boîte mail (et vos spams).</p>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <p class="form-hint">Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" autocomplete="email" />
                <mat-icon matSuffix>email</mat-icon>
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>L'email est requis</mat-error>
                }
                @if (form.get('email')?.hasError('email')) {
                  <mat-error>Email invalide</mat-error>
                }
              </mat-form-field>

              <button mat-raised-button color="primary"
                      type="submit"
                      class="full-width submit-btn"
                      [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  Envoyer le lien
                }
              </button>
            </form>
          }
        </mat-card-content>

        <mat-card-actions>
          <p class="register-link">
            <a routerLink="/login">← Retour à la connexion</a>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
    }
    .auth-card { width: 100%; max-width: 420px; padding: 16px; }
    .auth-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .auth-logo mat-icon { font-size: 32px; width: 32px; height: 32px; color: #667eea; }
    .auth-logo h1 { margin: 0; font-size: 24px; color: #333; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 8px; height: 48px; }
    .form-hint { color: #666; font-size: 14px; margin-bottom: 16px; }
    .register-link { text-align: center; color: #666; }
    .register-link a { color: #667eea; text-decoration: none; font-weight: 500; }
    .success-message { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 16px 0; text-align: center; }
    .success-message mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .success-message p { color: #444; line-height: 1.6; }
  `]
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly snackBar    = inject(MatSnackBar);
  private readonly fb          = inject(FormBuilder);

  loading = signal(false);
  sent    = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Une erreur est survenue. Réessayez.', 'Fermer', { duration: 4000 });
      },
    });
  }
}

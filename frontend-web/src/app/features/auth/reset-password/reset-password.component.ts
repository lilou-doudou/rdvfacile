import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-reset-password',
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
            <mat-icon>lock</mat-icon>
            <h1>RdvFacile</h1>
          </div>
          <mat-card-subtitle>Nouveau mot de passe</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (success()) {
            <div class="success-message">
              <mat-icon color="primary">check_circle</mat-icon>
              <p>Mot de passe modifié avec succès !</p>
              <a mat-raised-button color="primary" routerLink="/login">Se connecter</a>
            </div>
          } @else if (!token()) {
            <div class="error-message">
              <mat-icon color="warn">error</mat-icon>
              <p>Lien de réinitialisation invalide.</p>
              <a mat-button routerLink="/forgot-password">Demander un nouveau lien</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nouveau mot de passe</mat-label>
                <input matInput
                       [type]="showPassword() ? 'text' : 'password'"
                       formControlName="newPassword"
                       autocomplete="new-password" />
                <button mat-icon-button matSuffix type="button"
                        (click)="showPassword.set(!showPassword())">
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('newPassword')?.hasError('required') && form.get('newPassword')?.touched) {
                  <mat-error>Le mot de passe est requis</mat-error>
                }
                @if (form.get('newPassword')?.hasError('minlength')) {
                  <mat-error>Minimum 8 caractères</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmer le mot de passe</mat-label>
                <input matInput
                       [type]="showPassword() ? 'text' : 'password'"
                       formControlName="confirm"
                       autocomplete="new-password" />
                @if (form.get('confirm')?.hasError('required') && form.get('confirm')?.touched) {
                  <mat-error>La confirmation est requise</mat-error>
                }
                @if (form.hasError('mismatch') && form.get('confirm')?.touched) {
                  <mat-error>Les mots de passe ne correspondent pas</mat-error>
                }
              </mat-form-field>

              <button mat-raised-button color="primary"
                      type="submit"
                      class="full-width submit-btn"
                      [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  Réinitialiser le mot de passe
                }
              </button>
            </form>
          }
        </mat-card-content>
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
    .success-message, .error-message { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 16px 0; text-align: center; }
    .success-message mat-icon, .error-message mat-icon { font-size: 48px; width: 48px; height: 48px; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly snackBar    = inject(MatSnackBar);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly fb          = inject(FormBuilder);

  loading      = signal(false);
  success      = signal(false);
  showPassword = signal(false);
  token        = signal<string | null>(null);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirm:     ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    const t = this.route.snapshot.queryParamMap.get('token');
    this.token.set(t);
  }

  onSubmit() {
    if (this.form.invalid || !this.token()) return;
    this.loading.set(true);

    this.authService.resetPassword(this.token()!, this.form.value.newPassword!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Lien invalide ou expiré. Demandez un nouveau lien.';
        this.snackBar.open(msg, 'Fermer', { duration: 5000 });
      },
    });
  }

  private passwordMatchValidator(group: any) {
    const pwd     = group.get('newPassword')?.value;
    const confirm = group.get('confirm')?.value;
    return pwd === confirm ? null : { mismatch: true };
  }
}

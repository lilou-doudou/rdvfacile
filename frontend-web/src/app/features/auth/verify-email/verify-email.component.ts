import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-logo">
            <mat-icon>mark_email_read</mat-icon>
            <h1>RdvFacile</h1>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="center">
              <mat-spinner diameter="48" />
              <p>Vérification en cours...</p>
            </div>
          } @else if (success()) {
            <div class="success-box">
              <mat-icon color="primary">check_circle</mat-icon>
              <h2>Email confirmé !</h2>
              <p>Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
              <a mat-raised-button color="primary" routerLink="/login">Se connecter</a>
            </div>
          } @else {
            <div class="error-box">
              <mat-icon color="warn">error</mat-icon>
              <h2>Lien invalide</h2>
              <p>Ce lien de vérification est invalide ou a déjà été utilisé.</p>
              <a mat-button routerLink="/login">Retour à la connexion</a>
            </div>
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
    .center, .success-box, .error-box { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 0; text-align: center; }
    .success-box mat-icon, .error-box mat-icon { font-size: 56px; width: 56px; height: 56px; }
    h2 { margin: 0; }
    p { margin: 0; color: #444; }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route       = inject(ActivatedRoute);

  loading = signal(true);
  success = signal(false);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading.set(false);
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}

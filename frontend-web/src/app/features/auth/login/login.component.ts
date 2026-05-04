import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-layout">

      <!-- ── Panneau gauche (marque) ── -->
      <div class="brand-panel">
        <div class="brand-panel-inner">

          <!-- Éléphant filigrane -->
          <div class="elephant-bg" aria-hidden="true">
            <img src="assets/images/elephant.svg" alt="" class="elephant-img" />
          </div>

          <!-- Logo -->
          <div class="brand-logo">
            <div class="brand-icon-box">
              <mat-icon>event_available</mat-icon>
            </div>
            <div>
              <div class="brand-name">RDVFacile</div>
              <div class="brand-sub">Africa</div>
            </div>
          </div>

          <!-- Slogan -->
          <div class="brand-content">
            <h2 class="brand-headline">Gérez vos rendez-vous<br>simplement.</h2>
            <p class="brand-desc">La solution de prise de rendez-vous conçue pour les professionnels africains.</p>

            <div class="brand-features">
              <div class="brand-feature">
                <div class="feature-dot"></div>
                <span>Calendrier intuitif</span>
              </div>
              <div class="brand-feature">
                <div class="feature-dot"></div>
                <span>Réservations via WhatsApp</span>
              </div>
              <div class="brand-feature">
                <div class="feature-dot"></div>
                <span>Rappels automatiques</span>
              </div>
            </div>
          </div>

          <!-- Badge bas -->
          <div class="brand-badge">
            <mat-icon>verified</mat-icon>
            <span>Conçu pour la Côte d'Ivoire & l'Afrique</span>
          </div>
        </div>
      </div>

      <!-- ── Panneau droit (formulaire) ── -->
      <div class="form-panel">
        <div class="form-inner">

          <!-- Logo mobile -->
          <div class="mobile-logo">
            <div class="brand-icon-box small">
              <mat-icon>event_available</mat-icon>
            </div>
            <span class="brand-name-mobile">RDVFacile</span>
          </div>

          <h1 class="form-title">Connexion</h1>
          <p class="form-subtitle">Accédez à votre espace marchand</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">

            <div class="field-group">
              <label class="field-label">Email</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput type="email" formControlName="email" autocomplete="email"
                       placeholder="vous@exemple.com" />
                <mat-icon matSuffix>email</mat-icon>
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>L'email est requis</mat-error>
                }
                @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                  <mat-error>Email invalide</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="field-group">
              <div class="label-row">
                <label class="field-label">Mot de passe</label>
                <a routerLink="/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput
                       [type]="showPassword() ? 'text' : 'password'"
                       formControlName="password"
                       autocomplete="current-password"
                       placeholder="••••••••" />
                <button mat-icon-button matSuffix type="button"
                        (click)="showPassword.set(!showPassword())">
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                  <mat-error>Le mot de passe est requis</mat-error>
                }
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary"
                    type="submit"
                    class="submit-btn"
                    [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                <mat-icon>login</mat-icon>
                Se connecter
              }
            </button>
          </form>

          <p class="register-link">
            Pas encore de compte ?
            <a routerLink="/register">Créer un espace marchand</a>
          </p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ── Layout global ── */
    .auth-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 768px) {
      .auth-layout { flex-direction: row; }
    }

    /* ── Panneau gauche — marque ── */
    .brand-panel {
      background: linear-gradient(145deg, #C45208 0%, #E8600A 45%, #F9A65A 100%);
      position: relative;
      overflow: hidden;
      padding: 0;
      display: none;
    }

    @media (min-width: 768px) {
      .brand-panel {
        display: flex;
        flex: 0 0 42%;
        max-width: 480px;
      }
    }

    .brand-panel-inner {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      padding: 40px 36px;
      width: 100%;
      height: 100%;
    }

    /* Éléphant filigrane */
    .elephant-bg {
      position: absolute;
      bottom: -20px;
      right: -40px;
      width: 320px;
      height: 280px;
      pointer-events: none;
      z-index: 1;
    }

    .elephant-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0.35;
      transform: scaleX(-1);
    }

    /* Logo dans le panneau */
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: auto;
    }

    .brand-icon-box {
      width: 46px;
      height: 46px;
      background: rgba(255,255,255,.2);
      border: 2px solid rgba(255,255,255,.35);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);

      mat-icon { color: white; font-size: 1.4rem; width: 1.4rem; height: 1.4rem; }

      &.small {
        width: 36px; height: 36px; border-radius: 9px;
        background: #E8600A; border-color: transparent;
        mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
      }
    }

    .brand-name {
      font-family: 'Poppins', sans-serif;
      font-weight: 800;
      font-size: 1.3rem;
      color: white;
      line-height: 1;
    }

    .brand-sub {
      font-size: .65rem;
      color: rgba(255,255,255,.75);
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 600;
    }

    /* Contenu central */
    .brand-content {
      margin-top: 80px;
      position: relative;
      z-index: 2;
    }

    .brand-headline {
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      line-height: 1.3;
      margin: 0 0 16px;
    }

    .brand-desc {
      color: rgba(255,255,255,.8);
      font-size: .95rem;
      line-height: 1.6;
      margin: 0 0 28px;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .brand-feature {
      display: flex;
      align-items: center;
      gap: 10px;
      color: rgba(255,255,255,.9);
      font-size: .9rem;
      font-weight: 500;
    }

    .feature-dot {
      width: 8px;
      height: 8px;
      background: rgba(255,255,255,.7);
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Badge bas */
    .brand-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 48px;
      padding: 10px 14px;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 10px;
      color: rgba(255,255,255,.85);
      font-size: .82rem;
      font-weight: 500;
      position: relative;
      z-index: 2;

      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: rgba(255,255,255,.9); }
    }

    /* ── Panneau droit — formulaire ── */
    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      padding: 32px 16px;
    }

    .form-inner {
      width: 100%;
      max-width: 400px;
    }

    /* Logo mobile */
    .mobile-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .brand-name-mobile {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1.2rem;
      color: #1A1A2E;
    }

    @media (min-width: 768px) {
      .mobile-logo { display: none; }
    }

    /* Titres */
    .form-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0 0 6px;
    }

    .form-subtitle {
      color: #6C757D;
      font-size: .9rem;
      margin: 0 0 32px;
    }

    /* Formulaire */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field-group { display: flex; flex-direction: column; }

    .field-label {
      font-size: .82rem;
      font-weight: 600;
      color: #1A1A2E;
      margin-bottom: 4px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .forgot-link {
      font-size: .8rem;
      color: #E8600A;
      text-decoration: none;
      font-weight: 500;

      &:hover { text-decoration: underline; }
    }

    .full-width { width: 100%; }

    .submit-btn {
      width: 100%;
      height: 50px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
      mat-spinner { display: inline-block; }
    }

    /* Lien register */
    .register-link {
      text-align: center;
      font-size: .875rem;
      color: #6C757D;
      margin-top: 24px;

      a {
        color: #E8600A;
        font-weight: 600;
        text-decoration: none;

        &:hover { text-decoration: underline; }
      }
    }
  `],
})
export class LoginComponent {
  private readonly auth    = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly fb      = inject(FormBuilder);
  private readonly snack   = inject(MatSnackBar);

  readonly showPassword = signal(false);
  readonly loading      = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { email, password } = this.form.value;

    this.auth.login({ email: email!, password: password! }).subscribe({
      next:  () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Email ou mot de passe incorrect', 'Fermer', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}


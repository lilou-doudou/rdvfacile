import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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

          <div class="elephant-bg" aria-hidden="true">
            <img src="assets/images/elephant.svg" alt="" class="elephant-img" />
          </div>

          <div class="brand-logo">
            <div class="brand-icon-box">
              <mat-icon>event_available</mat-icon>
            </div>
            <div>
              <div class="brand-name">RDVFacile</div>
              <div class="brand-sub">Africa</div>
            </div>
          </div>

          <div class="brand-content">
            <h2 class="brand-headline">Démarrez votre<br>activité en ligne.</h2>
            <p class="brand-desc">Créez votre espace marchand gratuit et gérez vos rendez-vous en quelques minutes.</p>

            <div class="brand-steps">
              <div class="brand-step">
                <div class="step-num">1</div>
                <span>Créez votre commerce</span>
              </div>
              <div class="brand-step">
                <div class="step-num">2</div>
                <span>Ajoutez vos services</span>
              </div>
              <div class="brand-step">
                <div class="step-num">3</div>
                <span>Recevez des clients</span>
              </div>
            </div>
          </div>

          <div class="brand-badge">
            <mat-icon>lock</mat-icon>
            <span>Inscription gratuite — sans carte bancaire</span>
          </div>
        </div>
      </div>

      <!-- ── Panneau droit (formulaire) ── -->
      <div class="form-panel">
        <div class="form-inner">

          <div class="mobile-logo">
            <div class="brand-icon-box small">
              <mat-icon>event_available</mat-icon>
            </div>
            <span class="brand-name-mobile">RDVFacile</span>
          </div>

          @if (registered()) {
            <!-- État succès email envoyé -->
            <div class="success-state">
              <div class="success-icon-wrap">
                <mat-icon>mark_email_read</mat-icon>
              </div>
              <h1 class="form-title">Vérifiez votre email !</h1>
              <p class="form-subtitle">
                Un lien d'activation a été envoyé à<br>
                <strong>{{ registeredEmail() }}</strong>
              </p>
              <p class="resend-hint">
                Vous ne recevez pas l'email ?
                <button mat-button color="primary" (click)="resend()">Renvoyer</button>
              </p>
            </div>
          } @else {

            <h1 class="form-title">Créer un espace</h1>
            <p class="form-subtitle">Votre back-office professionnel en 1 minute</p>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">

              <!-- Section commerce -->
              <div class="section-header">
                <div class="section-dot orange"></div>
                <span>Votre commerce</span>
              </div>

              <div class="field-group">
                <label class="field-label">Nom du commerce</label>
                <mat-form-field appearance="outline" class="full-width">
                  <input matInput formControlName="businessName" placeholder="Salon Premium, Cabinet Dr. …" />
                  @if (form.get('businessName')?.hasError('required') && form.get('businessName')?.touched) {
                    <mat-error>Champ requis</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="field-group">
                <label class="field-label">Numéro WhatsApp</label>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-icon matPrefix style="color:#25D366;margin-right:4px">whatsapp</mat-icon>
                  <input matInput formControlName="businessPhone" placeholder="+2250712345678" />
                  @if (form.get('businessPhone')?.invalid && form.get('businessPhone')?.touched) {
                    <mat-error>Format international requis (ex: +225…)</mat-error>
                  }
                </mat-form-field>
              </div>

              <!-- Section compte -->
              <div class="section-header">
                <div class="section-dot dark"></div>
                <span>Votre compte</span>
              </div>

              <div class="field-group">
                <label class="field-label">Nom complet</label>
                <mat-form-field appearance="outline" class="full-width">
                  <input matInput formControlName="fullName" placeholder="Prénom Nom" />
                  @if (form.get('fullName')?.hasError('required') && form.get('fullName')?.touched) {
                    <mat-error>Champ requis</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="field-group">
                <label class="field-label">Email</label>
                <mat-form-field appearance="outline" class="full-width">
                  <input matInput type="email" formControlName="email"
                         autocomplete="email" placeholder="vous@exemple.com" />
                  @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                    <mat-error>Email invalide</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="field-group">
                <label class="field-label">Mot de passe</label>
                <mat-form-field appearance="outline" class="full-width">
                  <input matInput
                         [type]="showPassword() ? 'text' : 'password'"
                         formControlName="password"
                         autocomplete="new-password"
                         placeholder="8 caractères minimum" />
                  <button mat-icon-button matSuffix type="button"
                          (click)="showPassword.set(!showPassword())">
                    <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (form.get('password')?.hasError('minlength')) {
                    <mat-error>8 caractères minimum</mat-error>
                  }
                </mat-form-field>
              </div>

              <button mat-raised-button color="primary"
                      type="submit"
                      class="submit-btn"
                      [disabled]="loading()">
                @if (loading()) { <mat-spinner diameter="20" /> }
                @else {
                  <mat-icon>rocket_launch</mat-icon>
                  Créer mon espace
                }
              </button>
            </form>
          }

          <p class="login-link">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
          </p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 768px) {
      .auth-layout { flex-direction: row; }
    }

    /* ── Panneau gauche ── */
    .brand-panel {
      background: linear-gradient(145deg, #C45208 0%, #E8600A 45%, #F9A65A 100%);
      position: relative;
      overflow: hidden;
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
    }

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

    .brand-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .brand-step {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,.9);
      font-size: .9rem;
      font-weight: 500;
    }

    .step-num {
      width: 26px;
      height: 26px;
      background: rgba(255,255,255,.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: .8rem;
      flex-shrink: 0;
    }

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

      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    }

    /* ── Panneau droit ── */
    .form-panel {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      background: white;
      padding: 32px 16px;
      overflow-y: auto;
    }

    @media (min-width: 768px) {
      .form-panel { align-items: center; }
    }

    .form-inner {
      width: 100%;
      max-width: 420px;
    }

    .mobile-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
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

    /* Succès */
    .success-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      padding: 24px 0;
    }

    .success-icon-wrap {
      width: 72px;
      height: 72px;
      background: #E8F5E9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      mat-icon { color: #1E8A3E; font-size: 2.4rem; width: 2.4rem; height: 2.4rem; }
    }

    .resend-hint { font-size: .85rem; color: #6C757D; margin: 0; }

    /* Titres */
    .form-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.65rem;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0 0 6px;
    }

    .form-subtitle {
      color: #6C757D;
      font-size: .9rem;
      margin: 0 0 24px;
      line-height: 1.5;
    }

    /* Sections */
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0 8px;
      font-size: .78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6C757D;
    }

    .section-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &.orange { background: #E8600A; }
      &.dark   { background: #1A1A2E; }
    }

    /* Champs */
    .auth-form { display: flex; flex-direction: column; gap: 0; }
    .field-group { display: flex; flex-direction: column; }
    .field-label { font-size: .82rem; font-weight: 600; color: #1A1A2E; margin-bottom: 4px; }
    .full-width { width: 100%; }

    .submit-btn {
      width: 100%;
      height: 50px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
      mat-spinner { display: inline-block; }
    }

    .login-link {
      text-align: center;
      font-size: .875rem;
      color: #6C757D;
      margin-top: 24px;

      a { color: #E8600A; font-weight: 600; text-decoration: none;
          &:hover { text-decoration: underline; } }
    }
  `],
})
export class RegisterComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);
  private readonly snack  = inject(MatSnackBar);

  readonly showPassword    = signal(false);
  readonly loading         = signal(false);
  readonly registered      = signal(false);
  readonly registeredEmail = signal('');

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
      next: () => {
        this.registeredEmail.set(v.email!);
        this.registered.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Erreur lors de l\'inscription', 'Fermer', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  resend() {
    const email = this.registeredEmail();
    if (!email) return;
    this.auth.resendVerification(email).subscribe({
      next: () => this.snack.open('Email de confirmation renvoyé !', 'OK', { duration: 4000 }),
      error: () => this.snack.open('Erreur lors du renvoi', 'Fermer', { duration: 4000 }),
    });
  }
}


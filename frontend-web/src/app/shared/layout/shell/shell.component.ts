import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule, MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">

      <!-- ── Sidebar ── -->
      <mat-sidenav #sidenav
                   [mode]="isMobile() ? 'over' : 'side'"
                   [opened]="!isMobile()"
                   class="sidenav">

        <!-- Logo / Brand -->
        <div class="brand">
          <div class="brand-icon">
            <mat-icon>event_available</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-name">RDVFacile</span>
            <span class="brand-sub">Africa</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="nav-section">
          <p class="nav-label">Menu</p>
          <mat-nav-list class="nav-list">
            @for (item of navItems; track item.route) {
              <a mat-list-item
                 [routerLink]="item.route"
                 routerLinkActive="active-link"
                 (click)="isMobile() && sidenav.close()"
                 class="nav-item">
                <mat-icon matListItemIcon class="nav-icon">{{ item.icon }}</mat-icon>
                <span matListItemTitle class="nav-label-text">{{ item.label }}</span>
              </a>
            }
          </mat-nav-list>
        </nav>

        <!-- Footer -->
        <div class="sidenav-footer">
          <div class="divider-line"></div>
          <div class="business-chip">
            <div class="business-avatar">
              {{ auth.user()?.businessName?.charAt(0)?.toUpperCase() ?? 'B' }}
            </div>
            <div class="business-details">
              <span class="business-name-text">{{ auth.user()?.businessName }}</span>
              <span class="business-plan">Plan gratuit</span>
            </div>
          </div>
          <button class="logout-btn" (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </div>
      </mat-sidenav>

      <!-- ── Main content ── -->
      <mat-sidenav-content class="main-content">

        <!-- Top toolbar -->
        <header class="top-toolbar">
          @if (isMobile()) {
            <button mat-icon-button class="menu-btn" (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            <span class="toolbar-brand">RDVFacile</span>
          }
          <span class="spacer"></span>
          <div class="toolbar-right">
            @if (!isMobile()) {
              <div class="user-pill">
                <div class="user-avatar">
                  {{ auth.user()?.email?.charAt(0)?.toUpperCase() ?? 'U' }}
                </div>
                <span class="user-email">{{ auth.user()?.email }}</span>
              </div>
            }
          </div>
        </header>

        <!-- Page content -->
        <div class="page-container">
          <router-outlet />
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    /* ── Container ── */
    .sidenav-container { height: 100vh; }

    /* ── Sidebar ── */
    .sidenav {
      width: 256px;
      display: flex;
      flex-direction: column;
      background: #1A1A2E;
      color: white;
      border-right: none !important;
      overflow: hidden;
    }

    /* ── Brand / Logo ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,.07);
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: #E8600A;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(232,96,10,.4);

      mat-icon {
        color: white;
        font-size: 1.3rem;
        width: 1.3rem;
        height: 1.3rem;
      }
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .brand-name {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1.1rem;
      color: white;
      letter-spacing: -0.3px;
    }

    .brand-sub {
      font-size: .7rem;
      color: #E8600A;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    /* ── Navigation ── */
    .nav-section {
      flex: 1;
      padding: 16px 0 8px;
      overflow-y: auto;
    }

    .nav-label {
      font-size: .65rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,.3);
      padding: 0 20px;
      margin: 0 0 8px;
    }

    .nav-list { padding: 0 10px; }

    .nav-item {
      border-radius: 10px !important;
      margin-bottom: 2px !important;
      color: rgba(255,255,255,.65) !important;
      height: 46px !important;
      transition: background 0.15s, color 0.15s !important;
    }

    .nav-item:hover {
      background: rgba(255,255,255,.07) !important;
      color: rgba(255,255,255,.95) !important;
    }

    .nav-item.active-link {
      background: rgba(232,96,10,.18) !important;
      color: #F9A65A !important;

      .nav-icon { color: #E8600A !important; }
    }

    .nav-icon { color: inherit; }
    .nav-label-text { font-size: .9rem; font-weight: 500; }

    /* ── Sidebar footer ── */
    .sidenav-footer {
      padding: 12px 14px 16px;
    }

    .divider-line {
      height: 1px;
      background: rgba(255,255,255,.07);
      margin-bottom: 14px;
    }

    .business-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: rgba(255,255,255,.05);
      border-radius: 10px;
      margin-bottom: 8px;
    }

    .business-avatar {
      width: 34px;
      height: 34px;
      background: #E8600A;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: .9rem;
      color: white;
      flex-shrink: 0;
    }

    .business-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .business-name-text {
      font-weight: 600;
      font-size: .85rem;
      color: rgba(255,255,255,.9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .business-plan {
      font-size: .7rem;
      color: #C8952A;
      font-weight: 600;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 10px;
      border-radius: 8px;
      color: rgba(255,255,255,.45);
      font-size: .85rem;
      font-family: 'Inter', sans-serif;
      transition: background 0.15s, color 0.15s;

      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

      &:hover {
        background: rgba(211,47,47,.12);
        color: #EF9A9A;
      }
    }

    /* ── Main content ── */
    .main-content { display: flex; flex-direction: column; background: #F8F5F0; }

    /* ── Top toolbar ── */
    .top-toolbar {
      display: flex;
      align-items: center;
      padding: 0 20px;
      height: 64px;
      background: white;
      border-bottom: 1px solid #EAE4DC;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }

    .menu-btn { color: #1A1A2E; margin-right: 8px; }

    .toolbar-brand {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      color: #1A1A2E;
    }

    .spacer { flex: 1; }

    .toolbar-right { display: flex; align-items: center; gap: 12px; }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #F8F5F0;
      border: 1px solid #EAE4DC;
      border-radius: 9999px;
      padding: 4px 14px 4px 4px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: #E8600A;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: .85rem;
      color: white;
      flex-shrink: 0;
    }

    .user-email {
      font-size: .8rem;
      color: #6C757D;
      font-weight: 500;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Page container ── */
    .page-container {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
    }

    @media (min-width: 768px) {
      .page-container { padding: 28px 32px; }
    }
  `],
})
export class ShellComponent {
  readonly auth = inject(AuthService);

  private readonly bpo = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.bpo.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      map(r => r.matches)
    ),
    { initialValue: false }
  );

  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard',        route: '/dashboard'    },
    { label: 'Rendez-vous',     icon: 'calendar_month',   route: '/appointments' },
    { label: 'Services',        icon: 'content_cut',      route: '/services'     },
    { label: 'Clients',         icon: 'people',           route: '/customers'    },
  ];
}

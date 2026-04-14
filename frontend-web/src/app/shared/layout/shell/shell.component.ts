import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">

      <!-- Sidebar -->
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>event_available</mat-icon>
          <span>RdvFacile</span>
        </div>

        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider />
          <div class="business-info">
            <mat-icon>store</mat-icon>
            <span class="business-name">{{ auth.user()?.businessName }}</span>
          </div>
          <button mat-button color="warn" (click)="auth.logout()" class="logout-btn">
            <mat-icon>logout</mat-icon> Déconnexion
          </button>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">
        <mat-toolbar color="primary" class="top-toolbar">
          <span class="toolbar-title">Tableau de bord</span>
          <span class="spacer"></span>
          <span class="user-email">{{ auth.user()?.email }}</span>
        </mat-toolbar>

        <div class="page-container">
          <router-outlet />
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }

    .sidenav {
      width: 240px;
      display: flex;
      flex-direction: column;
      background: #1e7e34;
      color: white;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      background: rgba(0,0,0,.15);

      mat-icon { font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }
    }

    mat-nav-list { flex: 1; padding-top: 8px; }

    a[mat-list-item] { color: rgba(255,255,255,.85); margin: 2px 8px; border-radius: 8px; }
    a[mat-list-item]:hover { background: rgba(255,255,255,.12); color: white; }
    a[mat-list-item].active-link {
      background: rgba(255,255,255,.2);
      color: white;
      font-weight: 600;
    }
    mat-icon[matListItemIcon] { color: inherit; }

    .sidenav-footer {
      padding: 8px 0;
      mat-divider { border-color: rgba(255,255,255,.2); margin-bottom: 8px; }
    }

    .business-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      color: rgba(255,255,255,.7);
      font-size: .875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn { width: 100%; justify-content: flex-start; color: rgba(255,255,255,.7); }
    .logout-btn:hover { color: white; }

    .main-content { display: flex; flex-direction: column; }

    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 6px rgba(0,0,0,.2);
    }

    .toolbar-title { font-size: 1rem; font-weight: 600; }
    .spacer { flex: 1; }
    .user-email { font-size: .85rem; opacity: .85; }

    .page-container { padding: 24px; flex: 1; overflow-y: auto; }
  `],
})
export class ShellComponent {
  readonly auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard',        route: '/dashboard'    },
    { label: 'Rendez-vous',     icon: 'calendar_month',   route: '/appointments' },
    { label: 'Services',        icon: 'content_cut',      route: '/services'     },
    { label: 'Clients',         icon: 'people',           route: '/customers'    },
  ];
}

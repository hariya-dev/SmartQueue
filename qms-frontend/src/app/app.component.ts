import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserRole } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule, DialogModule, PasswordModule, ToastModule, FormsModule],
  providers: [MessageService],
  template: `
    <div class="app-container">
      <p-toast></p-toast>
      <!-- Global Header -->
      <header class="global-header" *ngIf="showNavigation">
        <div class="header-content">
          <div class="header-left" (click)="goHome()">
            <img src="assets/logo/logo.png" alt="Logo" class="header-logo">
            <h1 class="header-title-desktop">Queue Management System</h1>
          </div>
          
          <div class="header-right" *ngIf="currentUser">
            <div class="user-info">
              <span class="welcome-text">Xin chào,</span>
              <span class="user-name">{{ currentUser.fullName }}</span>
            </div>
            <div class="header-actions">
              <button pButton icon="pi pi-key" 
                      class="p-button-rounded p-button-info p-button-text" 
                      title="Đổi mật khẩu"
                      (click)="showChangePasswordDialog()"></button>
              <button pButton icon="pi pi-power-off" 
                      class="p-button-rounded p-button-danger p-button-text" 
                      title="Đăng xuất"
                      (click)="logout()"></button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content" [class.with-header]="showNavigation">
        <router-outlet></router-outlet>
      </main>

      <!-- Change Password Dialog -->
      <p-dialog [(visible)]="changePasswordDialog" [style]="{width: '400px'}" header="Đổi mật khẩu" [modal]="true" styleClass="p-fluid">
        <ng-template pTemplate="content">
          <div class="field mb-4">
            <label for="currentPassword" class="block font-bold mb-2">Mật khẩu hiện tại</label>
            <p-password id="currentPassword" [(ngModel)]="passwordData.currentPassword" [toggleMask]="true" feedback="false"></p-password>
          </div>
          <div class="field mb-4">
            <label for="newPassword" class="block font-bold mb-2">Mật khẩu mới</label>
            <p-password id="newPassword" [(ngModel)]="passwordData.newPassword" [toggleMask]="true" feedback="true" 
                        promptLabel="Nhập mật khẩu mới" weakLabel="Yếu" mediumLabel="Trung bình" strongLabel="Mạnh"></p-password>
          </div>
          <div class="field mb-4">
            <label for="confirmPassword" class="block font-bold mb-2">Xác nhận mật khẩu mới</label>
            <p-password id="confirmPassword" [(ngModel)]="passwordData.confirmPassword" [toggleMask]="true" feedback="false"></p-password>
          </div>
        </ng-template>
        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="changePasswordDialog = false"></button>
          <button pButton label="Đổi mật khẩu" icon="pi pi-check" class="p-button-primary" (click)="changePassword()"></button>
        </ng-template>
      </p-dialog>

      <!-- Global Footer -->
      <footer class="global-footer" *ngIf="showFooter">
        <div class="footer-content">
          <div class="footer-left">
            <p>&copy; 2026 <strong>Queue Management System</strong>. All rights reserved.</p>
          </div>
          <div class="footer-right">
            <span class="footer-tag">Hệ thống QMS v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .global-header {
      background: white;
      height: 70px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-bottom: 3px solid var(--color-primary-600);
      display: flex;
      align-items: center;
    }

    .header-content {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
    }

    .header-logo {
      height: 45px;
      width: auto;
    }

    .header-title-desktop {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--color-primary-600);
      margin: 0;
      letter-spacing: -0.5px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.2;
    }

    .welcome-text {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .user-name {
      font-size: 0.95rem;
      color: var(--color-gray-800);
      font-weight: 800;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-left: 1rem;
    }

    .main-content {
      flex: 1;
      &.with-header {
        margin-top: 70px;
      }
    }

    .global-footer {
      background: white;
      padding: 1.5rem 0;
      border-top: 1px solid #e2e8f0;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #64748b;
      font-size: 0.9rem;
    }

    .footer-tag {
      background: #f1f5f9;
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .header-title-desktop {
        display: none; /* Hide long title on mobile */
      }
      .header-content {
        padding: 0 1rem;
      }
      .welcome-text {
        display: none;
      }
      .user-info {
        margin-right: -0.5rem;
      }
      .footer-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  showNavigation = true;
  showFooter = true;
  currentUser: any;

  changePasswordDialog = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router, 
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.showNavigation = !(url.includes('tv-display') || url.includes('login'));
      this.showFooter = this.showNavigation && !(url.includes('kiosk') || url.includes('calling-desk'));
      this.currentUser = this.authService.currentUserValue;
    });
  }

  goHome(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    switch (this.currentUser.role) {
      case UserRole.Admin:
        this.router.navigate(['/admin']);
        break;
      case UserRole.Doctor:
        this.router.navigate(['/calling-desk']);
        break;
      case UserRole.Kiosk:
        this.router.navigate(['/kiosk']);
        break;
      case UserRole.TV:
        this.router.navigate(['/tv-display']);
        break;
      case UserRole.TicketIssuer:
        this.router.navigate(['/ticket-issuer']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  showChangePasswordDialog(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.changePasswordDialog = true;
  }

  changePassword(): void {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu mới không khớp' });
      return;
    }

    this.authService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đổi mật khẩu thành công' });
        this.changePasswordDialog = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể đổi mật khẩu' });
      }
    });
  }
}

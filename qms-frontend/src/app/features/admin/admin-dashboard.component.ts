import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule],
  template: `
    <div class="admin-wrapper">
      <main class="admin-content">
        <div class="dashboard-grid">
          <p-card header="Quản lý Dịch vụ" subheader="Danh mục các dịch vụ khám bệnh" styleClass="admin-card" (click)="navigate('/admin/services')">
            <div class="card-icon"><i class="pi pi-briefcase"></i></div>
            <p>Thêm, sửa, xóa và cấu hình các dịch vụ trong hệ thống.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Quản lý" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>

          <p-card header="Quản lý Phòng" subheader="Danh mục phòng ban & quầy" styleClass="admin-card" (click)="navigate('/admin/rooms')">
            <div class="card-icon"><i class="pi pi-home"></i></div>
            <p>Quản lý danh sách phòng, quầy gọi số và khu vực.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Quản lý" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>

          <p-card header="Quản lý Người dùng" subheader="Tài khoản & Phân quyền" styleClass="admin-card" (click)="navigate('/admin/users')">
            <div class="card-icon"><i class="pi pi-users"></i></div>
            <p>Cấp tài khoản cho bác sĩ, nhân viên và quản lý vai trò.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Quản lý" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>

          <p-card header="Quản lý Máy in" subheader="Kết nối & Vị trí" styleClass="admin-card" (click)="navigate('/admin/printers')">
            <div class="card-icon"><i class="pi pi-print"></i></div>
            <p>Cấu hình máy in nhiệt, địa chỉ IP và gán cho nhân viên.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Quản lý" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>

          <p-card header="Thời gian lấy số" subheader="Khung giờ hoạt động" styleClass="admin-card" (click)="navigate('/admin/working-sessions')">
            <div class="card-icon"><i class="pi pi-clock"></i></div>
            <p>Cấu hình các khung giờ cho phép lấy số thứ tự trong ngày.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Cấu hình" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>

          <p-card header="Cấu hình TV" subheader="Giao diện hiển thị TV" styleClass="admin-card" (click)="navigate('/admin/tv-profiles')">
            <div class="card-icon"><i class="pi pi-desktop"></i></div>
            <p>Thiết lập các màn hình hiển thị cho từng khu vực.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Quản lý" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>

          <p-card header="Cấu hình Ưu Tiên" subheader="Chiến lược xếp hàng" styleClass="admin-card" (click)="navigate('/admin/priority-settings')">
            <div class="card-icon"><i class="pi pi-star-fill"></i></div>
            <p>Cấu hình chiến lược ưu tiên: Ưu tiên tuyệt đối hoặc Xen kẽ.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Cấu hình" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>

          <p-card header="Thống kê Báo cáo" subheader="Dữ liệu & Biểu đồ" styleClass="admin-card" (click)="navigate('/admin/statistics')">
            <div class="card-icon"><i class="pi pi-chart-bar"></i></div>
            <p>Xem báo cáo lượt lấy số, tỷ lệ phục vụ và xuất Excel.</p>
            <ng-template pTemplate="footer">
              <button pButton label="Xem báo cáo" icon="pi pi-chevron-right" class="p-button-text"></button>
            </ng-template>
          </p-card>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      min-height: calc(100vh - 70px - 73px);
      background-color: #f8fafc;
    }
    .admin-content {
      padding: 4rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2.5rem;
    }
    :host ::ng-deep .admin-card {
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-radius: 1.25rem;
      border: 1px solid #eef2f6;
      background: white;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: var(--color-primary-400);

        .card-icon {
          transform: scale(1.1);
          background-color: var(--color-primary-600);
          color: white;
        }

        .p-card-title {
           color: var(--color-primary-600);
        }
      }

      .p-card-header { 
        padding: 2rem 2rem 0; 
      }
      
      .p-card-title {
        font-family: 'Montserrat', sans-serif;
        font-weight: 800;
        font-size: 1.25rem;
        transition: color 0.3s;
        color: var(--color-gray-800);
      }

      .p-card-subtitle {
        color: #f15a24; /* Corporate Orange */
        font-weight: 700;
        font-size: 0.9rem;
      }

      .p-card-content { 
        padding: 1rem 2rem; 
        color: var(--color-gray-500);
        font-weight: 500;
        line-height: 1.6;
      }

      .p-card-footer {
        padding: 1.5rem 2rem;
        border-top: 1px solid #f8fafc;
      }
    }
    .card-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
      background-color: var(--color-primary-50);
      color: var(--color-primary-600);
      transition: all 0.3s;
      border: 1px solid var(--color-primary-100);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}

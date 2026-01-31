import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { User, UserRole, Room, Printer } from '../../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    DialogModule, 
    ToastModule, 
    ConfirmDialogModule,
    InputSwitchModule,
    DropdownModule,
    PasswordModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="management-container">
      <div class="management-header">
        <div class="header-title">
          <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-plain" (click)="goBack()"></button>
          <h2>Quản lý Người dùng</h2>
        </div>
        <button pButton label="Thêm người dùng" icon="pi pi-plus" class="p-button-success" (click)="openNew()"></button>
      </div>

      <p-table [value]="users" [rows]="10" [paginator]="true" [scrollable]="true"
               styleClass="p-datatable-gridlines p-datatable-striped custom-table">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 20%">Họ tên</th>
            <th style="width: 15%">Tên đăng nhập</th>
            <th style="width: 15%">Vai trò</th>
            <th style="width: 15%">Phòng / Quầy</th>
            <th style="width: 20%">Thao tác</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td><strong>{{ user.fullName }}</strong></td>
            <td>{{ user.username }}</td>
            <td>
              <span [class]="'role-badge ' + getRoleClass(user.role)">
                {{ getRoleName(user.role) }}
              </span>
            </td>
            <td>{{ user.roomCode || '---' }}</td>
            
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-key" class="p-button-rounded p-button-warning p-button-text" (click)="openResetPassword(user)" title="Đặt lại mật khẩu"></button>
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text" (click)="editUser(user)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" (click)="deleteUser(user)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="userDialog" [style]="{width: '550px'}" header="Chi tiết Người dùng" [modal]="true" styleClass="p-fluid custom-dialog">
        <ng-template pTemplate="content">
          <div class="field">
            <label for="fullName">Họ và tên</label>
            <input type="text" pInputText id="fullName" [(ngModel)]="user.fullName" required autofocus />
            <small class="p-error" *ngIf="submitted && !user.fullName">Bắt buộc nhập họ tên.</small>
          </div>
          <div class="field">
            <label for="username">Tên đăng nhập</label>
            <input type="text" pInputText id="username" [(ngModel)]="user.username" required [disabled]="!!user.userId" />
            <small class="p-error" *ngIf="submitted && !user.username">Bắt buộc nhập tên đăng nhập.</small>
          </div>
          <div class="field" *ngIf="!user.userId">
            <label for="password">Mật khẩu</label>
            <p-password id="password" [(ngModel)]="user.password" [toggleMask]="true" feedback="false"></p-password>
            <small class="p-error" *ngIf="submitted && !user.password">Bắt buộc nhập mật khẩu cho người dùng mới.</small>
          </div>
          <div class="field">
            <label for="role">Vai trò</label>
            <p-dropdown [options]="roles" [(ngModel)]="user.role" optionLabel="label" optionValue="value" 
                        placeholder="Chọn vai trò"></p-dropdown>
          </div>
          <div class="field" *ngIf="user.role === 1"> <!-- Doctor role -->
            <label for="room">Phòng trực</label>
            <p-dropdown [options]="rooms" [(ngModel)]="user.roomId" optionLabel="roomName" optionValue="roomId" 
                        placeholder="Chọn phòng"></p-dropdown>
          </div>
          <div class="field" *ngIf="user.role === userRole.Kiosk || user.role === userRole.TicketIssuer">
            <label for="printer">Gán máy in</label>
            <p-dropdown [options]="printers" [(ngModel)]="user.printerId" optionLabel="printerName" optionValue="printerId" 
                        placeholder="Chọn máy in mặc định" [showClear]="true"></p-dropdown>
          </div>
          <div class="field-row">
            <label for="active" style="margin-right: 15px">Trạng thái hoạt động</label>
            <p-inputSwitch id="active" [(ngModel)]="user.isActive"></p-inputSwitch>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="Lưu" icon="pi pi-check" class="p-button-primary" (click)="saveUser()"></button>
        </ng-template>
      </p-dialog>

      <p-dialog [(visible)]="resetDialog" [style]="{width: '400px'}" header="Đặt lại mật khẩu" [modal]="true" styleClass="p-fluid">
        <ng-template pTemplate="content">
          <div class="field">
            <label>Người dùng: <strong>{{ selectedUserForReset?.fullName }}</strong></label>
          </div>
          <div class="field">
            <label for="newPassword">Mật khẩu mới</label>
            <p-password id="newPassword" [(ngModel)]="newPassword" [toggleMask]="true" feedback="false"></p-password>
          </div>
        </ng-template>
        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="resetDialog = false"></button>
          <button pButton label="Xác nhận" icon="pi pi-check" class="p-button-warning" (click)="resetPassword()"></button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .management-container { 
      padding: 2.5rem; 
      background: white; 
      border-radius: 20px; 
      margin: 2.5rem; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 1px solid var(--color-primary-100);
      overflow: hidden;
    }
    .management-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2.5rem; 
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 1.5rem;
    }
    .header-title { 
      display: flex; 
      align-items: center; 
      gap: 1.5rem; 
      h2 { 
        margin: 0; 
        font-family: 'Montserrat', sans-serif;
        font-weight: 900; 
        color: var(--color-primary-600); 
        letter-spacing: -0.5px;
      } 
    }

    :host ::ng-deep {
      .custom-table {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #f1f5f9;

        .p-datatable-thead > tr > th {
          background-color: var(--color-primary-600);
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          padding: 1.25rem 1rem;
          border: none;
          text-align: center;
        }
        .p-datatable-tbody > tr {
          background-color: white;
          transition: background-color 0.2s;
          &:hover {
            background-color: var(--color-primary-50) !important;
          }
          > td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid #f1f5f9;
            color: var(--color-gray-700);
            font-weight: 500;
            white-space: nowrap;
            text-align: center;
          }
        }
        .p-paginator {
          background: white;
          border: none;
          padding: 1.5rem 0;
          .p-paginator-pages .p-paginator-page {
            &.p-highlight {
              background: var(--color-primary-600);
              color: white;
              border-color: var(--color-primary-600);
            }
            &:not(.p-highlight):hover {
              background: var(--color-primary-50);
              color: var(--color-primary-600);
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .management-container {
        margin: 1rem;
        padding: 1.25rem;
        border-radius: 12px;
      }
      .management-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .header-title {
        gap: 0.5rem;
        h2 { font-size: 1.1rem; }
      }
      .p-button-success {
        padding: 0.5rem 0.75rem !important;
        font-size: 0.85rem !important;
      }
    }

    .status-badge { 
      padding: 0.35rem 1rem; 
      border-radius: 50px; 
      font-size: 0.8rem; 
      font-weight: 800;
      display: inline-block;
      &.active { background: #dcfce7; color: #15803d; }
      &.inactive { background: #fee2e2; color: #b91c1c; }
    }
    .role-badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem;
      &.admin { background: #fee2e2; color: #991b1b; }
      &.doctor { background: #e0f2fe; color: #0369a1; }
      &.staff { background: #fef9c3; color: #854d0e; }
    }
    .action-buttons { display: flex; gap: 0.75rem; justify-content: center; }
    .printer-tag { background: #fef9c3; color: #854d0e; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem; }
    .field { margin-bottom: 1.75rem; label { display: block; margin-bottom: 0.6rem; font-weight: 800; color: var(--color-gray-700); } }
    .field-row { 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      margin-top: 1.25rem; 
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      line-height: 1;
      label { font-weight: 800; color: var(--color-gray-700); margin: 0; display: flex; align-items: center; } 
      p-inputSwitch { display: flex; align-items: center; height: 24px; }
    }
  `]
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  rooms: Room[] = [];
  printers: Printer[] = [];
  user: any = {};
  userDialog: boolean = false;
  resetDialog: boolean = false;
  selectedUserForReset: User | null = null;
  newPassword: string = '';
  submitted: boolean = false;
  userRole = UserRole;

  roles = [
    { label: 'Quản trị viên', value: UserRole.Admin },
    { label: 'Bác sĩ / Nhân viên quầy', value: UserRole.Doctor },
    { label: 'Màn hình Kiosk', value: UserRole.Kiosk },
    { label: 'Màn hình TV', value: UserRole.TV },
    { label: 'Nhân viên cấp số', value: UserRole.TicketIssuer }
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRooms();
    this.loadPrinters();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe(data => this.users = data);
  }

  loadRooms(): void {
    this.apiService.getRooms().subscribe(data => this.rooms = data);
  }

  loadPrinters(): void {
    this.apiService.getPrinters().subscribe(data => this.printers = data);
  }

  goBack(): void {
    window.history.back();
  }

  openNew(): void {
    this.user = { isActive: true, role: UserRole.Doctor };
    this.submitted = false;
    this.userDialog = true;
  }

  editUser(user: User): void {
    this.user = { ...user };
    this.userDialog = true;
  }

  hideDialog(): void {
    this.userDialog = false;
    this.submitted = false;
  }

  saveUser(): void {
    this.submitted = true;

    if (this.user.fullName && this.user.username && (this.user.userId || this.user.password)) {
      if (this.user.userId) {
        this.authService.updateUser(this.user.userId, this.user).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Cập nhật người dùng thành công'});
            this.loadUsers();
            this.userDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể cập nhật người dùng'})
        });
      } else {
        this.authService.createUser(this.user).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Thêm người dùng thành công'});
            this.loadUsers();
            this.userDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể thêm người dùng'})
        });
      }
    }
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.authService.deleteUser(user.userId).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Xóa người dùng thành công'});
            this.loadUsers();
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể xóa người dùng'})
        });
      }
    });
  }

  openResetPassword(user: User): void {
    this.selectedUserForReset = user;
    this.newPassword = '';
    this.resetDialog = true;
  }

  resetPassword(): void {
    if (!this.newPassword) {
      this.messageService.add({severity:'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập mật khẩu mới'});
      return;
    }

    if (this.selectedUserForReset) {
      this.authService.resetPassword(this.selectedUserForReset.userId, { newPassword: this.newPassword }).subscribe({
        next: () => {
          this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Đặt lại mật khẩu thành công'});
          this.resetDialog = false;
        },
        error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể đặt lại mật khẩu'})
      });
    }
  }

  getRoleName(role: UserRole): string {
    return this.roles.find(r => r.value === role)?.label || 'Không xác định';
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.Admin: return 'admin';
      case UserRole.Doctor: return 'doctor';
      default: return 'staff';
    }
  }
}

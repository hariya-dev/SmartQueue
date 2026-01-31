import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { WorkingSession } from '../../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-working-sessions-management',
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
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="management-container">
      <div class="management-header">
        <div class="header-title">
          <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-plain" (click)="goBack()"></button>
          <h2>Cấu hình Thời gian lấy số</h2>
        </div>
        <button pButton label="Thêm khung giờ" icon="pi pi-plus" class="p-button-success" (click)="openNew()"></button>
      </div>

      <p-table [value]="sessions" [rows]="10" [paginator]="true" [scrollable]="true"
               styleClass="p-datatable-gridlines p-datatable-striped custom-table">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 25%">Tên khung giờ</th>
            <th style="width: 20%">Bắt đầu</th>
            <th style="width: 20%">Kết thúc</th>
            <th style="width: 20%">Ngày trong tuần</th>
            <th style="width: 15%">Trạng thái</th>
            <th style="width: 15%">Thao tác</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-session>
          <tr>
            <td><strong>{{ session.sessionName }}</strong></td>
            <td>{{ session.startTime }}</td>
            <td>{{ session.endTime }}</td>
            <td>{{ getDayName(session.dayOfWeek) }}</td>
            <td>
              <span [class]="'status-badge ' + (session.isActive ? 'active' : 'inactive')">
                {{ session.isActive ? 'Hoạt động' : 'Tạm dừng' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text" (click)="editSession(session)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" (click)="deleteSession(session)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="sessionDialog" [style]="{width: '550px'}" header="Chi tiết Khung giờ" [modal]="true" styleClass="p-fluid custom-dialog">
        <ng-template pTemplate="content">
          <div class="field">
            <label for="name">Tên khung giờ (VD: Ca sáng, Ca chiều...)</label>
            <input type="text" pInputText id="name" [(ngModel)]="session.sessionName" required autofocus />
            <small class="p-error" *ngIf="submitted && !session.sessionName">Bắt buộc nhập tên khung giờ.</small>
          </div>
          
          <div class="field">
            <label for="startTime">Giờ bắt đầu (HH:mm)</label>
            <input type="text" pInputText id="startTime" [(ngModel)]="session.startTime" placeholder="07:00" required />
            <small class="p-error" *ngIf="submitted && !session.startTime">Bắt buộc nhập giờ bắt đầu.</small>
          </div>

          <div class="field">
            <label for="endTime">Giờ kết thúc (HH:mm)</label>
            <input type="text" pInputText id="endTime" [(ngModel)]="session.endTime" placeholder="11:30" required />
            <small class="p-error" *ngIf="submitted && !session.endTime">Bắt buộc nhập giờ kết thúc.</small>
          </div>

          <div class="field">
            <label for="dayOfWeek">Ngày trong tuần</label>
            <p-dropdown [options]="days" [(ngModel)]="session.dayOfWeek" optionLabel="label" optionValue="value" 
                        placeholder="Tất cả các ngày" [showClear]="true"></p-dropdown>
          </div>

          <div class="field-row">
            <label for="active" style="margin-right: 15px">Trạng thái hoạt động</label>
            <p-inputSwitch id="active" [(ngModel)]="session.isActive"></p-inputSwitch>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="Lưu" icon="pi pi-check" class="p-button-primary" (click)="saveSession()"></button>
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
          }
        }
      }

      .p-dropdown {
        width: 100% !important;
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
    .action-buttons { display: flex; gap: 0.75rem; justify-content: center; }
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
export class WorkingSessionsManagementComponent implements OnInit {
  sessions: WorkingSession[] = [];
  session: Partial<WorkingSession> = {};
  sessionDialog: boolean = false;
  submitted: boolean = false;

  days = [
    { label: 'Chủ Nhật', value: 0 },
    { label: 'Thứ Hai', value: 1 },
    { label: 'Thứ Ba', value: 2 },
    { label: 'Thứ Tư', value: 3 },
    { label: 'Thứ Năm', value: 4 },
    { label: 'Thứ Sáu', value: 5 },
    { label: 'Thứ Bảy', value: 6 }
  ];

  constructor(
    private apiService: ApiService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.apiService.getWorkingSessions().subscribe(data => this.sessions = data);
  }

  getDayName(day?: number): string {
    if (day === undefined || day === null) return 'Tất cả các ngày';
    return this.days.find(d => d.value === day)?.label || 'N/A';
  }

  goBack(): void {
    window.history.back();
  }

  openNew(): void {
    this.session = { isActive: true, startTime: '07:00', endTime: '11:30' };
    this.submitted = false;
    this.sessionDialog = true;
  }

  editSession(session: WorkingSession): void {
    this.session = { ...session };
    this.sessionDialog = true;
  }

  hideDialog(): void {
    this.sessionDialog = false;
    this.submitted = false;
  }

  saveSession(): void {
    this.submitted = true;

    if (this.session.sessionName && this.session.startTime && this.session.endTime) {
      if (this.session.workingSessionId) {
        this.apiService.updateWorkingSession(this.session.workingSessionId, this.session).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Cập nhật khung giờ thành công'});
            this.loadSessions();
            this.sessionDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể cập nhật khung giờ'})
        });
      } else {
        this.apiService.createWorkingSession(this.session).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Thêm khung giờ thành công'});
            this.loadSessions();
            this.sessionDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể thêm khung giờ'})
        });
      }
    }
  }

  deleteSession(session: WorkingSession): void {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa khung giờ "${session.sessionName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteWorkingSession(session.workingSessionId).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Xóa khung giờ thành công'});
            this.loadSessions();
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể xóa khung giờ'})
        });
      }
    });
  }
}

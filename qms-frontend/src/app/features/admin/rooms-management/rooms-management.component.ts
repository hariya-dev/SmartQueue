import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Room, Service } from '../../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-rooms-management',
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
    InputNumberModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="management-container">
      <div class="management-header">
        <div class="header-title">
          <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-plain" (click)="goBack()"></button>
          <h2>Quản lý Phòng / Quầy</h2>
        </div>
        <button pButton label="Thêm phòng" icon="pi pi-plus" class="p-button-success" (click)="openNew()"></button>
      </div>

      <p-table [value]="rooms" [rows]="10" [paginator]="true" [scrollable]="true"
               styleClass="p-datatable-gridlines p-datatable-striped custom-table">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 15%">Mã phòng</th>
            <th style="width: 25%">Tên phòng / quầy</th>
            <th style="width: 20%">Dịch vụ</th>
            <th style="width: 10%">Hàng đợi tối đa</th>
            <th style="width: 15%">Trạng thái</th>
            <th style="width: 15%">Thao tác</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-room>
          <tr>
            <td><strong>{{ room.roomCode }}</strong></td>
            <td>{{ room.roomName }}</td>
            <td><span class="service-tag">{{ room.serviceCode }}</span></td>
            <td class="text-center">{{ room.maxQueueSize }}</td>
            <td>
              <span [class]="'status-badge ' + (room.isActive ? 'active' : 'inactive')">
                {{ room.isActive ? 'Hoạt động' : 'Tạm dừng' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text" (click)="editRoom(room)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" (click)="deleteRoom(room)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="roomDialog" [style]="{width: '550px'}" header="Chi tiết Phòng" [modal]="true" styleClass="p-fluid custom-dialog">
        <ng-template pTemplate="content">
          <div class="field">
            <label for="service">Dịch vụ phụ trách</label>
            <p-dropdown [options]="services" [(ngModel)]="room.serviceId" optionLabel="serviceName" optionValue="serviceId" 
                        placeholder="Chọn dịch vụ" [disabled]="!!room.roomId"></p-dropdown>
            <small class="p-error" *ngIf="submitted && !room.serviceId">Bắt buộc chọn dịch vụ.</small>
          </div>
          <div class="field">
            <label for="code">Mã phòng / quầy</label>
            <input type="text" pInputText id="code" [(ngModel)]="room.roomCode" required [disabled]="!!room.roomId" />
            <small class="p-error" *ngIf="submitted && !room.roomCode">Bắt buộc nhập mã phòng.</small>
          </div>
          <div class="field">
            <label for="name">Tên phòng / quầy (VD: Quầy 01, Phòng 102...)</label>
            <input type="text" pInputText id="name" [(ngModel)]="room.roomName" required />
            <small class="p-error" *ngIf="submitted && !room.roomName">Bắt buộc nhập tên phòng.</small>
          </div>
          <div class="field">
            <label for="maxSize">Số lượng hàng đợi tối đa</label>
            <p-inputNumber id="maxSize" [(ngModel)]="room.maxQueueSize"></p-inputNumber>
          </div>
          <div class="field-row">
            <label for="active" style="margin-right: 15px">Trạng thái hoạt động</label>
            <p-inputSwitch id="active" [(ngModel)]="room.isActive"></p-inputSwitch>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="Lưu" icon="pi pi-check" class="p-button-primary" (click)="saveRoom()"></button>
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
    .service-tag { background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem; }
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
    .text-center { text-align: center; }
  `]
})
export class RoomsManagementComponent implements OnInit {
  rooms: Room[] = [];
  services: Service[] = [];
  room: Partial<Room> = {};
  roomDialog: boolean = false;
  submitted: boolean = false;

  constructor(
    private apiService: ApiService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadServices();
  }

  loadRooms(): void {
    this.apiService.getRooms().subscribe(data => this.rooms = data);
  }

  loadServices(): void {
    this.apiService.getServices(true).subscribe(data => this.services = data);
  }

  goBack(): void {
    window.history.back();
  }

  openNew(): void {
    this.room = { isActive: true, maxQueueSize: 50 };
    this.submitted = false;
    this.roomDialog = true;
  }

  editRoom(room: Room): void {
    this.room = { ...room };
    this.roomDialog = true;
  }

  hideDialog(): void {
    this.roomDialog = false;
    this.submitted = false;
  }

  saveRoom(): void {
    this.submitted = true;

    if (this.room.roomCode && this.room.roomName && this.room.serviceId) {
      if (this.room.roomId) {
        this.apiService.updateRoom(this.room.roomId, this.room).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Cập nhật phòng thành công'});
            this.loadRooms();
            this.roomDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể cập nhật phòng'})
        });
      } else {
        this.apiService.createRoom(this.room).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Thêm phòng thành công'});
            this.loadRooms();
            this.roomDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể thêm phòng'})
        });
      }
    }
  }

  deleteRoom(room: Room): void {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa phòng "${room.roomName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteRoom(room.roomId).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Xóa phòng thành công'});
            this.loadRooms();
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể xóa phòng'})
        });
      }
    });
  }
}

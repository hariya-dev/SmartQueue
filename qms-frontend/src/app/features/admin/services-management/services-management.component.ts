import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Service } from '../../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-services-management',
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
    InputNumberModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="management-container">
      <div class="management-header">
        <div class="header-title">
          <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-plain" (click)="goBack()"></button>
          <h2>Quản lý Dịch vụ</h2>
        </div>
        <button pButton label="Thêm dịch vụ" icon="pi pi-plus" class="p-button-success" (click)="openNew()"></button>
      </div>

      <p-table [value]="services" [rows]="10" [paginator]="true" [scrollable]="true"
               styleClass="p-datatable-gridlines p-datatable-striped custom-table">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 10%">Mã</th>
            <th style="width: 40%">Tên dịch vụ</th>
            <th style="width: 15%">Thứ tự</th>
            <th style="width: 15%">Trạng thái</th>
            <th style="width: 20%">Thao tác</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-service>
          <tr>
            <td><strong>{{ service.serviceCode }}</strong></td>
            <td>{{ service.serviceName }}</td>
            <td class="text-center">{{ service.displayOrder }}</td>
            <td>
              <span [class]="'status-badge ' + (service.isActive ? 'active' : 'inactive')">
                {{ service.isActive ? 'Hoạt động' : 'Tạm dừng' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text" (click)="editService(service)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" (click)="deleteService(service)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="serviceDialog" [style]="{width: '550px'}" header="Chi tiết Dịch vụ" [modal]="true" styleClass="p-fluid custom-dialog">
        <ng-template pTemplate="content">
          <div class="field">
            <label for="code">Mã dịch vụ</label>
            <input type="text" pInputText id="code" [(ngModel)]="service.serviceCode" required autofocus [disabled]="!!service.serviceId" />
            <small class="p-error" *ngIf="submitted && !service.serviceCode">Bắt buộc nhập mã dịch vụ.</small>
          </div>
          <div class="field">
            <label for="name">Tên dịch vụ</label>
            <input type="text" pInputText id="name" [(ngModel)]="service.serviceName" required />
            <small class="p-error" *ngIf="submitted && !service.serviceName">Bắt buộc nhập tên dịch vụ.</small>
          </div>
          <div class="field">
            <label for="order">Thứ tự hiển thị</label>
            <p-inputNumber id="order" [(ngModel)]="service.displayOrder"></p-inputNumber>
          </div>
          <div class="field-row">
            <label for="active" style="margin-right: 15px">Trạng thái hoạt động</label>
            <p-inputSwitch id="active" [(ngModel)]="service.isActive"></p-inputSwitch>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="Lưu" icon="pi pi-check" class="p-button-primary" (click)="saveService()"></button>
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
export class ServicesManagementComponent implements OnInit {
  services: Service[] = [];
  service: Partial<Service> = {};
  serviceDialog: boolean = false;
  submitted: boolean = false;

  constructor(
    private apiService: ApiService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.apiService.getServices(false).subscribe(data => this.services = data);
  }

  goBack(): void {
    window.history.back();
  }

  openNew(): void {
    this.service = { isActive: true, displayOrder: 0 };
    this.submitted = false;
    this.serviceDialog = true;
  }

  editService(service: Service): void {
    this.service = { ...service };
    this.serviceDialog = true;
  }

  hideDialog(): void {
    this.serviceDialog = false;
    this.submitted = false;
  }

  saveService(): void {
    this.submitted = true;

    if (this.service.serviceCode && this.service.serviceName) {
      if (this.service.serviceId) {
        this.apiService.updateService(this.service.serviceId, this.service).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Cập nhật dịch vụ thành công'});
            this.loadServices();
            this.serviceDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể cập nhật dịch vụ'})
        });
      } else {
        this.apiService.createService(this.service).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Thêm dịch vụ thành công'});
            this.loadServices();
            this.serviceDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể thêm dịch vụ'})
        });
      }
    }
  }

  deleteService(service: Service): void {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa dịch vụ "${service.serviceName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteService(service.serviceId).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Xóa dịch vụ thành công'});
            this.loadServices();
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể xóa dịch vụ'})
        });
      }
    });
  }
}

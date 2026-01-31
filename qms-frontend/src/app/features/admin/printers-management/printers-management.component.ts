import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Printer } from '../../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-printers-management',
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
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="management-container">
      <div class="management-header">
        <div class="header-title">
          <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-plain" (click)="goBack()"></button>
          <h2>Quản lý Máy in</h2>
        </div>
        <button pButton label="Thêm máy in" icon="pi pi-plus" class="p-button-success" (click)="openNew()"></button>
      </div>

      <p-table [value]="printers" [rows]="10" [paginator]="true" [scrollable]="true"
               styleClass="p-datatable-gridlines p-datatable-striped custom-table">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 15%">Mã máy in</th>
            <th style="width: 20%">Tên máy in</th>
            <th style="width: 15%">IP Address</th>
            <th style="width: 20%">Vị trí</th>
            <th style="width: 15%">Trạng thái</th>
            <th style="width: 15%">Thao tác</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-printer>
          <tr>
            <td><strong>{{ printer.printerCode }}</strong></td>
            <td>{{ printer.printerName }}</td>
            <td>{{ printer.ipAddress || 'N/A' }}</td>
            <td>{{ printer.location || 'N/A' }}</td>
            <td>
              <span [class]="'status-badge ' + (printer.isActive ? 'active' : 'inactive')">
                {{ printer.isActive ? 'Hoạt động' : 'Tạm dừng' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text" (click)="editPrinter(printer)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" (click)="deletePrinter(printer)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="printerDialog" [style]="{width: '550px'}" header="Chi tiết Máy in" [modal]="true" styleClass="p-fluid custom-dialog">
        <ng-template pTemplate="content">
          <div class="field">
            <label for="code">Mã máy in</label>
            <input type="text" pInputText id="code" [(ngModel)]="printer.printerCode" required [disabled]="!!printer.printerId" />
            <small class="p-error" *ngIf="submitted && !printer.printerCode">Bắt buộc nhập mã máy in.</small>
          </div>
          <div class="field">
            <label for="name">Tên máy in</label>
            <input type="text" pInputText id="name" [(ngModel)]="printer.printerName" required />
            <small class="p-error" *ngIf="submitted && !printer.printerName">Bắt buộc nhập tên máy in.</small>
          </div>
          <div class="field">
            <label for="ip">Địa chỉ IP</label>
            <input type="text" pInputText id="ip" [(ngModel)]="printer.ipAddress" placeholder="192.168.1.100" />
          </div>
          <div class="field">
            <label for="location">Vị trí đặt máy in</label>
            <input type="text" pInputText id="location" [(ngModel)]="printer.location" placeholder="Quầy 1, Sảnh A..." />
          </div>
          <div class="field">
            <label for="type">Loại máy in</label>
            <input type="text" pInputText id="type" [(ngModel)]="printer.printerType" placeholder="Thermal, Laser..." />
          </div>
          
          <div class="field-row">
            <label for="active" style="margin-right: 15px">Trạng thái hoạt động</label>
            <p-inputSwitch id="active" [(ngModel)]="printer.isActive"></p-inputSwitch>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="Lưu" icon="pi pi-check" class="p-button-primary" (click)="savePrinter()"></button>
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
export class PrintersManagementComponent implements OnInit {
  printers: Printer[] = [];
  printer: Partial<Printer> = {};
  printerDialog: boolean = false;
  submitted: boolean = false;

  constructor(
    private apiService: ApiService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPrinters();
  }

  loadPrinters(): void {
    this.apiService.getPrinters().subscribe(data => this.printers = data);
  }

  goBack(): void {
    window.history.back();
  }

  openNew(): void {
    this.printer = { isActive: true };
    this.submitted = false;
    this.printerDialog = true;
  }

  editPrinter(printer: Printer): void {
    this.printer = { ...printer };
    this.printerDialog = true;
  }

  hideDialog(): void {
    this.printerDialog = false;
    this.submitted = false;
  }

  savePrinter(): void {
    this.submitted = true;

    if (this.printer.printerCode && this.printer.printerName) {
      if (this.printer.printerId) {
        this.apiService.updatePrinter(this.printer.printerId, this.printer).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Cập nhật máy in thành công'});
            this.loadPrinters();
            this.printerDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể cập nhật máy in'})
        });
      } else {
        this.apiService.createPrinter(this.printer).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Thêm máy in thành công'});
            this.loadPrinters();
            this.printerDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể thêm máy in'})
        });
      }
    }
  }

  deletePrinter(printer: Printer): void {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa máy in "${printer.printerName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deletePrinter(printer.printerId).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Xóa máy in thành công'});
            this.loadPrinters();
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể xóa máy in'})
        });
      }
    });
  }
}

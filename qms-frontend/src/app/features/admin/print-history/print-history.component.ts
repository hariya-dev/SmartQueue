import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PrintHistory, Printer } from '../../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-print-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="history-container">
      <div class="history-header">
        <div class="header-title">
          <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-plain" (click)="goBack()"></button>
          <h2>Lịch sử In ấn</h2>
        </div>
        <div class="header-actions">
          <span class="today-count">
            <i class="pi pi-print"></i>
            Hôm nay: {{ todayPrintCount }} phiếu
          </span>
          <button pButton label="Tải lại" icon="pi pi-refresh" class="p-button-outlined" (click)="loadPrintHistory()"></button>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>Từ ngày</label>
            <p-calendar [(ngModel)]="fromDate" [showIcon]="true" dateFormat="dd/mm/yy" 
                        (onSelect)="loadPrintHistory()" (onClear)="loadPrintHistory()"
                        placeholder="Chọn ngày bắt đầu" [showButtonBar]="true"></p-calendar>
          </div>
          <div class="filter-item">
            <label>Đến ngày</label>
            <p-calendar [(ngModel)]="toDate" [showIcon]="true" dateFormat="dd/mm/yy"
                        (onSelect)="loadPrintHistory()" (onClear)="loadPrintHistory()"
                        placeholder="Chọn ngày kết thúc" [showButtonBar]="true"></p-calendar>
          </div>
          <div class="filter-item">
            <label>Máy in</label>
            <p-dropdown [options]="printers" [(ngModel)]="selectedPrinterId" 
                        optionLabel="printerName" optionValue="printerId"
                        [showClear]="true" placeholder="Tất cả máy in"
                        (onChange)="loadPrintHistory()"></p-dropdown>
          </div>
        </div>
      </div>

      <p-table [value]="printHistoryList" [rows]="15" [paginator]="true" [scrollable]="true"
               styleClass="p-datatable-gridlines p-datatable-striped custom-table"
               [rowHover]="true" sortField="printedAt" [sortOrder]="-1">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 10%">Mã phiếu</th>
            <th style="width: 15%">Tên máy in</th>
            <th style="width: 12%">Loại in</th>
            <th style="width: 10%">Trạng thái</th>
            <th style="width: 15%">Thời gian</th>
            <th style="width: 15%">Người in</th>
            <th style="width: 23%">Thao tác</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-record>
          <tr [class.error-row]="record.printStatus === 'Failed'">
            <td class="ticket-number-cell">
              <strong>{{ record.ticketNumber }}</strong>
            </td>
            <td>
              <div class="printer-info">
                <i class="pi pi-print"></i>
                {{ record.printerName || 'N/A' }}
              </div>
              <small class="printer-ip" *ngIf="record.printerIp">{{ record.printerIp }}</small>
            </td>
            <td>
              <span [class]="'print-type-badge ' + record.printType.toLowerCase()">
                {{ getPrintTypeLabel(record.printType) }}
              </span>
            </td>
            <td>
              <span [class]="'status-badge ' + (record.printStatus === 'Success' ? 'success' : 'failed')">
                {{ record.printStatus === 'Success' ? 'Thành công' : 'Thất bại' }}
              </span>
            </td>
            <td>{{ record.printedAt | date:'dd/MM/yyyy HH:mm:ss' }}</td>
            <td>{{ record.printedByUserName || 'Hệ thống' }}</td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-refresh" label="In lại" 
                        class="p-button-rounded p-button-info p-button-sm"
                        (click)="reprintTicket(record)"
                        [disabled]="record.printStatus === 'Failed'"
                        *ngIf="record.printType !== 'Reprint'"></button>
                <button pButton icon="pi pi-eye" label="Chi tiết"
                        class="p-button-rounded p-button-text p-button-sm"
                        (click)="viewDetails(record)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="empty-message">
              <i class="pi pi-inbox"></i>
              <p>Chưa có lịch sử in ấn nào</p>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .history-container {
      padding: 2.5rem;
      background: white;
      border-radius: 20px;
      margin: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 1px solid var(--color-primary-100);
      overflow: hidden;
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 1.5rem;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      h2 {
        margin: 0;
        font-family: 'Montserrat', sans-serif;
        font-weight: 900;
        color: var(--color-primary-600);
        letter-spacing: -0.5px;
      }
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .today-count {
      background: var(--color-primary-100);
      color: var(--color-primary-700);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      i { color: var(--color-primary-600); }
    }
    .filter-section {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }
    .filter-row {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
      label {
        font-weight: 600;
        color: var(--color-gray-700);
        font-size: 0.9rem;
      }
    }
    .ticket-number-cell strong {
      font-size: 1.1rem;
      color: var(--color-primary-600);
    }
    .printer-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      i { color: var(--color-gray-500); }
    }
    .printer-ip {
      color: var(--color-gray-400);
      font-size: 0.8rem;
    }
    .print-type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      &.manual { background: #e0f2fe; color: #0369a1; }
      &.auto { background: #dcfce7; color: #15803d; }
      &.reprint { background: #fef3c7; color: #b45309; }
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      &.success { background: #dcfce7; color: #15803d; }
      &.failed { background: #fee2e2; color: #dc2626; }
    }
    .error-row {
      background-color: #fef2f2 !important;
    }
    .empty-message {
      text-align: center;
      padding: 3rem !important;
      color: var(--color-gray-400);
      i {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
      }
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
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
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          padding: 1rem;
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
            padding: 1rem;
            border-bottom: 1px solid #f1f5f9;
            color: var(--color-gray-700);
            font-weight: 500;
            text-align: center;
          }
        }
      }
      .p-calendar, .p-dropdown {
        width: 100%;
      }
    }
    @media (max-width: 768px) {
      .history-container {
        margin: 1rem;
        padding: 1.25rem;
        border-radius: 12px;
      }
      .filter-row {
        flex-direction: column;
      }
    }
  `]
})
export class PrintHistoryComponent implements OnInit {
  printHistoryList: PrintHistory[] = [];
  printers: Printer[] = [];
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectedPrinterId: number | null = null;
  todayPrintCount = 0;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPrinters();
    this.loadPrintHistory();
    this.loadTodayCount();
  }

  loadPrinters(): void {
    this.apiService.getPrinters().subscribe({
      next: (printers) => this.printers = printers,
      error: (err) => console.error('Error loading printers:', err)
    });
  }

  loadPrintHistory(): void {
    const query: any = {};
    if (this.fromDate) query.fromDate = this.fromDate;
    if (this.toDate) query.toDate = this.toDate;
    if (this.selectedPrinterId) query.printerId = this.selectedPrinterId;

    this.apiService.getPrintHistory(query).subscribe({
      next: (data) => this.printHistoryList = data,
      error: (err) => {
        console.error('Error loading print history:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải lịch sử in ấn'
        });
      }
    });
  }

  loadTodayCount(): void {
    this.apiService.getTodayPrintCount().subscribe({
      next: (count) => this.todayPrintCount = count,
      error: (err) => console.error('Error loading today count:', err)
    });
  }

  getPrintTypeLabel(type: string): string {
    switch (type) {
      case 'Manual': return 'Thủ công';
      case 'Auto': return 'Tự động';
      case 'Reprint': return 'In lại';
      default: return type;
    }
  }

  reprintTicket(record: PrintHistory): void {
    if (!record.printerId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Không tìm thấy máy in cho phiếu này'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Bạn có muốn in lại phiếu ${record.ticketNumber}?`,
      header: 'Xác nhận in lại',
      icon: 'pi pi-refresh',
      accept: () => {
        this.apiService.reprintTicket(record.printHistoryId, record.printerId!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã in lại phiếu thành công'
            });
            this.loadPrintHistory();
            this.loadTodayCount();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể in lại phiếu'
            });
          }
        });
      }
    });
  }

  viewDetails(record: PrintHistory): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Chi tiết',
      detail: `Phiếu: ${record.ticketNumber} - Máy in: ${record.printerName || 'N/A'} - Lỗi: ${record.errorMessage || 'Không có'}`
    });
  }

  goBack(): void {
    window.history.back();
  }
}

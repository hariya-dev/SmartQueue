import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Service, Printer, PriorityType, IssueTicketResponse, Room, ServiceQueueDetail, PrintHistory } from '../../core/models';
import { interval, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-kiosk',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, DialogModule, TableModule, InputTextModule, CalendarModule, TagModule, TooltipModule, RouterLink, ToastModule, ConfirmDialogModule],
  templateUrl: './kiosk.component.html',
  styleUrl: './kiosk.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class KioskComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  printers: Printer[] = [];
  rooms: Room[] = [];
  queueDetails: ServiceQueueDetail[] = [];

  selectedService: Service | null = null;
  selectedPriority: PriorityType | null = null;
  selectedPrinter: Printer | null = null;
  selectedRoom: Room | null = null;

  isLoading = false;
  showTicketDialog = false;
  showErrorDialog = false;
  errorMessage = '';
  ticketResult: IssueTicketResponse | null = null;
  currentTime = new Date();
  autoCloseCountdown = 10;

  // Print History
  showPrintHistoryDialog = false;
  printHistory: PrintHistory[] = [];
  filteredPrintHistory: PrintHistory[] = [];
  searchTicketNumber = '';
  printHistoryLoading = false;

  PriorityType = PriorityType;

  private timeSubscription?: Subscription;
  private countdownSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadPrinters();
    this.loadQueueDetails();
    this.startClock();
    // Default to Normal priority
    this.selectedPriority = PriorityType.Normal;

    // Set default printer from user if logged in
    const user = this.authService.currentUserValue;
    if (user && user.printerId) {
      this.selectedPrinter = { printerId: user.printerId } as any;
    }
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
    this.countdownSubscription?.unsubscribe();
  }

  private startClock(): void {
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  loadServices(): void {
    this.apiService.getServices(true).subscribe({
      next: (services) => this.services = services,
      error: (err) => console.error('Error loading services:', err)
    });
  }

  loadPrinters(): void {
    this.apiService.getPrinters().subscribe({
      next: (printers) => this.printers = printers.filter(p => p.isActive),
      error: (err) => console.error('Error loading printers:', err)
    });
  }

  getServiceIcon(code: string): string {
    const iconMap: Record<string, string> = {
      'XN': 'pi pi-filter',
      'SA': 'pi pi-tablet',
      'KN': 'pi pi-heart',
      'KNG': 'pi pi-plus-circle',
      'BLVP': 'pi pi-wallet',
      'TT': 'pi pi-credit-card'
    };
    return iconMap[code] || 'pi pi-briefcase';
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.loadRoomsForService(service.serviceId);
  }

  loadRoomsForService(serviceId: number): void {
    this.apiService.getRooms(serviceId).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.selectedRoom = null;
      },
      error: (err) => console.error('Error loading rooms:', err)
    });
  }

  loadQueueDetails(): void {
    this.apiService.getQueueDetails().subscribe({
      next: (details) => this.queueDetails = details,
      error: (err) => console.error('Error loading queue details:', err)
    });
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
  }

  selectPriority(priority: PriorityType): void {
    this.selectedPriority = priority;
  }

  issueTicket(): void {
    if (!this.selectedService || this.selectedPriority === null) return;

    this.isLoading = true;

    this.apiService.issueTicket({
      serviceCode: this.selectedService.serviceCode,
      priorityType: this.selectedPriority,
      printerId: this.selectedPrinter?.printerId,
      roomId: this.selectedRoom?.roomId
    }).subscribe({
      next: (result) => {
        this.ticketResult = result;
        this.showTicketDialog = true;
        this.isLoading = false;
        this.startAutoCloseCountdown();
      },
      error: (err) => {
        console.error('Error issuing ticket:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.error || err.error?.message || err.error || 'Có lỗi xảy ra. Vui lòng thử lại.';
        this.showErrorDialog = true;
      }
    });
  }

  private startAutoCloseCountdown(): void {
    this.autoCloseCountdown = 10;
    this.countdownSubscription?.unsubscribe();
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.autoCloseCountdown--;
      if (this.autoCloseCountdown <= 0) {
        this.resetKiosk();
      }
    });
  }

  resetKiosk(): void {
    this.countdownSubscription?.unsubscribe();
    this.showTicketDialog = false;
    this.ticketResult = null;
    this.selectedService = null;
    this.selectedRoom = null;
    this.selectedPriority = PriorityType.Normal;
    this.autoCloseCountdown = 10;
    this.isLoading = false;
    this.loadQueueDetails();
  }

  // ========== Print History Methods ==========

  openPrintHistoryDialog(): void {
    this.showPrintHistoryDialog = true;
    this.searchTicketNumber = '';
    this.loadPrintHistory();
  }

  closePrintHistoryDialog(): void {
    this.showPrintHistoryDialog = false;
  }

  loadPrintHistory(): void {
    this.printHistoryLoading = true;
    
    // API defaults to today, so we can pass empty query
    this.apiService.getPrintHistory({}).subscribe({
      next: (history) => {
        this.printHistory = history;
        this.filterPrintHistory();
        this.printHistoryLoading = false;
      },
      error: (err) => {
        console.error('Error loading print history:', err);
        this.printHistoryLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải lịch sử in ấn'
        });
      }
    });
  }

  filterPrintHistory(): void {
    let filtered = [...this.printHistory];

    // Filter by ticket number
    if (this.searchTicketNumber.trim()) {
      const search = this.searchTicketNumber.trim().toLowerCase();
      filtered = filtered.filter(h => 
        h.ticketNumber.toLowerCase().includes(search)
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.printedAt).getTime() - new Date(a.printedAt).getTime());
    this.filteredPrintHistory = filtered;
  }

  onSearchChange(): void {
    this.filterPrintHistory();
  }

  reprintTicket(printHistory: PrintHistory): void {
    if (!this.selectedPrinter) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng chọn máy in'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Bạn có muốn in lại phiếu ${printHistory.ticketNumber} không?`,
      header: 'Xác nhận in lại',
      icon: 'pi pi-print',
      accept: () => {
        this.apiService.reprintTicket(printHistory.printHistoryId, this.selectedPrinter!.printerId).subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã in lại phiếu ${printHistory.ticketNumber}`
              });
              this.loadPrintHistory();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể in lại phiếu'
              });
            }
          },
          error: (err) => {
            console.error('Error reprinting ticket:', err);
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

  getPrintTypeLabel(printType: string): string {
    const labels: Record<string, string> = {
      '0': 'In mới',
      '1': 'In tự động',
      '2': 'In lại'
    };
    return labels[printType] || printType;
  }

  getPrintStatusLabel(printStatus: string): string {
    const labels: Record<string, string> = {
      '0': 'Thành công',
      '1': 'Thất bại',
      '2': 'Đang chờ',
      'Success': 'Thành công',
      'Failed': 'Thất bại',
      'Pending': 'Đang chờ'
    };
    return labels[printStatus] || printStatus;
  }

  getPrintStatusSeverity(printStatus: string): string {
    const severities: Record<string, string> = {
      '0': 'success',
      '1': 'danger',
      '2': 'warning',
      'Success': 'success',
      'Failed': 'danger',
      'Pending': 'warning'
    };
    return severities[printStatus] || 'info';
  }
}

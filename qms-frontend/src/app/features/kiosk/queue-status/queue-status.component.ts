import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api.service';
import { ServiceQueueDetail, Ticket, TicketStatus } from '../../../core/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-queue-status',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, RouterLink, DialogModule, TabViewModule, TagModule, ConfirmDialogModule, ToastModule],
  templateUrl: './queue-status.component.html',
  styleUrl: '../kiosk.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class QueueStatusComponent implements OnInit, OnDestroy {
  queueDetails: ServiceQueueDetail[] = [];
  currentTime = new Date();
  
  // Room detail modal
  showRoomDetail = false;
  selectedRoomId: number | null = null;
  selectedRoomCode: string = '';
  selectedRoomName: string = '';
  roomTickets: Ticket[] = [];
  filteredRoomTickets: Ticket[] = [];
  selectedStatusTab = 0; // 0: Pending, 1: Done, 2: Passed
  isLoadingRoom = false;
  
  TicketStatus = TicketStatus;
  
  private timeSubscription?: Subscription;
  private pollSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadQueueDetails();
    this.startClock();
    // Refresh every 30 seconds
    this.pollSubscription = interval(30000).subscribe(() => this.loadQueueDetails());
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
    this.pollSubscription?.unsubscribe();
  }

  private startClock(): void {
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  loadQueueDetails(): void {
    this.apiService.getQueueDetails().subscribe({
      next: (details) => this.queueDetails = details,
      error: (err) => console.error('Error loading queue details:', err)
    });
  }

  openRoomDetail(roomId: number, roomCode: string, roomName: string): void {
    this.selectedRoomId = roomId;
    this.selectedRoomCode = roomCode;
    this.selectedRoomName = roomName;
    this.selectedStatusTab = 0;
    this.showRoomDetail = true;
    this.loadRoomTickets();
  }

  loadRoomTickets(): void {
    if (!this.selectedRoomId) return;
    
    this.isLoadingRoom = true;
    this.apiService.getTicketsByRoom(this.selectedRoomId).subscribe({
      next: (tickets) => {
        this.roomTickets = tickets;
        this.filterTicketsByStatus();
        this.isLoadingRoom = false;
      },
      error: (err) => {
        console.error('Error loading room tickets:', err);
        this.isLoadingRoom = false;
      }
    });
  }

  filterTicketsByStatus(): void {
    if (this.selectedStatusTab === 0) {
      this.filteredRoomTickets = this.roomTickets.filter(t => t.status === TicketStatus.Pending || t.status === TicketStatus.Calling || t.status === TicketStatus.Serving);
    } else if (this.selectedStatusTab === 1) {
      this.filteredRoomTickets = this.roomTickets.filter(t => t.status === TicketStatus.Done);
    } else if (this.selectedStatusTab === 2) {
      this.filteredRoomTickets = this.roomTickets.filter(t => t.status === TicketStatus.Passed);
    }
  }

  onStatusTabChange(): void {
    this.filterTicketsByStatus();
  }

  returnToQueue(ticket: Ticket): void {
    this.confirmationService.confirm({
      message: `Bạn có chắc muốn trả lại số ${ticket.ticketNumber} vào hàng chờ không?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.returnToQueue(ticket.ticketId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Số ${ticket.ticketNumber} đã được trả vào hàng chờ` });
            this.loadRoomTickets();
          },
          error: (err) => {
            console.error('Error returning to queue:', err);
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể trả số vào hàng chờ' });
          }
        });
      }
    });
  }

  getStatusLabel(status: TicketStatus | number): string {
    const statusMap: Record<number, string> = {
      [TicketStatus.Pending]: 'Đang chờ',
      [TicketStatus.Calling]: 'Đang gọi',
      [TicketStatus.Serving]: 'Đang phục vụ',
      [TicketStatus.Done]: 'Đã hoàn thành',
      [TicketStatus.Passed]: 'Đã bỏ qua'
    };
    return statusMap[status as number] || 'Không xác định';
  }

  getStatusSeverity(status: TicketStatus | number): string {
    switch (status) {
      case TicketStatus.Pending:
      case TicketStatus.Calling:
        return 'warning';
      case TicketStatus.Serving:
        return 'info';
      case TicketStatus.Done:
        return 'success';
      case TicketStatus.Passed:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getPriorityLabel(priority: number): string {
    return priority === 1 ? 'Ưu tiên' : 'Thường';
  }
}

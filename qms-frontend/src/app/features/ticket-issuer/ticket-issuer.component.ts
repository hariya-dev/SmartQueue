import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Service, Printer, PriorityType, IssueTicketResponse, RoomQueueDetail, User } from '../../core/models';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-ticket-issuer',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, DialogModule, TableModule, CardModule, TagModule],
  templateUrl: './ticket-issuer.component.html',
  styleUrl: './ticket-issuer.component.scss'
})
export class TicketIssuerComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  services: Service[] = [];
  printers: Printer[] = [];
  roomDetails: RoomQueueDetail[] = [];
  
  selectedService: Service | null = null;
  selectedPriority: PriorityType = PriorityType.Normal;
  selectedPrinter: Printer | null = null;
  
  isLoading = false;
  showTicketDialog = false;
  showErrorDialog = false;
  errorMessage = '';
  ticketResult: IssueTicketResponse | null = null;
  currentTime = new Date();
  
  private timeSubscription?: Subscription;
  private refreshSubscription?: Subscription;
  
  PriorityType = PriorityType;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadPrinters();
    this.loadRoomDetails();
    
    this.timeSubscription = interval(1000).subscribe(() => this.currentTime = new Date());
    
    // Auto refresh queue status every 10 seconds
    this.refreshSubscription = interval(10000).subscribe(() => this.loadRoomDetails());
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  loadServices(): void {
    this.apiService.getServices(true).subscribe(res => this.services = res);
  }

  loadPrinters(): void {
    this.apiService.getPrinters(this.currentUser?.areaCode).subscribe(res => {
      this.printers = res.filter(p => p.isActive);
      
      // Prioritize user's assigned printer
      if (this.currentUser?.printerId) {
        const assignedPrinter = this.printers.find(p => p.printerId === this.currentUser?.printerId);
        if (assignedPrinter) {
          this.selectedPrinter = assignedPrinter;
        } else if (this.printers.length > 0) {
          this.selectedPrinter = this.printers[0];
        }
      } else if (this.printers.length > 0) {
        this.selectedPrinter = this.printers[0];
      }
    });
  }

  loadRoomDetails(): void {
    this.apiService.getDetailedRoomQueues().subscribe(res => {
      this.roomDetails = res;
    });
  }

  issueTicket(service: Service): void {
    this.selectedService = service;
    this.isLoading = true;
    
    this.apiService.issueTicket({
      serviceCode: service.serviceCode,
      priorityType: this.selectedPriority,
      printerId: this.selectedPrinter?.printerId
    }).subscribe({
      next: (result) => {
        this.ticketResult = result;
        this.showTicketDialog = true;
        this.isLoading = false;
        this.loadRoomDetails();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || err.error?.message || err.error || 'Lỗi khi lấy số. Vui lòng thử lại.';
        this.showErrorDialog = true;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
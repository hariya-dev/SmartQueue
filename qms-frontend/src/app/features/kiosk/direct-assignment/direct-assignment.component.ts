import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Service, Printer, PriorityType, IssueTicketResponse, Room } from '../../../core/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-direct-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, DialogModule, RouterLink],
  templateUrl: './direct-assignment.component.html',
  styleUrl: '../kiosk.component.scss' // Reuse kiosk styles
})
export class DirectAssignmentComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  printers: Printer[] = [];
  rooms: Room[] = [];

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

  PriorityType = PriorityType;

  private timeSubscription?: Subscription;
  private countdownSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadPrinters();
    this.startClock();
    this.selectedPriority = PriorityType.Normal;

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
  }
}

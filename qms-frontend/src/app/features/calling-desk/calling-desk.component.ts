import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { Subscription, interval } from 'rxjs';
import { HubConnectionState } from '@microsoft/signalr';
import { ApiService } from '../../core/services/api.service';
import { SignalRService } from '../../core/services/signalr.service';
import { AuthService } from '../../core/services/auth.service';
import { Room, Ticket, CurrentTicket, PriorityType, TicketStatus } from '../../core/models';
import { minimizeWindow, setAlwaysOnTop } from '../../core/services/window.service';

@Component({
  selector: 'app-calling-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, TagModule, TooltipModule, DialogModule, InputTextModule, CalendarModule],
  templateUrl: './calling-desk.component.html',
  styleUrl: './calling-desk.component.scss'
})
export class CallingDeskComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  currentTicket: CurrentTicket | null = null;
  queue: Ticket[] = [];
  passedTickets: Ticket[] = [];
  doneTickets: Ticket[] = [];
  isLoading = false;
  showTransferDialog = false;
  allRooms: Room[] = [];
  targetRoomId: number | null = null;
  isConnected = false;
  isConnectionLost = false;
  currentTime = new Date();

  // Compact mode
  isCompactMode = false;
  private resizeObserver?: ResizeObserver;

  // Auto-minimize setting
  autoMinimizeOnCallNext = false;
  autoAlwaysOnTop = false;

  stats = {
    processed: 0,
    waiting: 0,
    passed: 0,
    avgTime: 0
  };

  PriorityType = PriorityType;
  TicketStatus = TicketStatus;

  private subscriptions: Subscription[] = [];
  private timeSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private signalRService: SignalRService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadAllRooms();
    this.setupSignalR();
    this.startClock();
    this.loadCompactModeFromStorage();
    this.loadAutoMinimizeSettings();
    this.setupResizeObserver();
  }

  ngAfterViewInit(): void {
    // Auto-toggle compact mode based on window size
    this.checkCompactMode();
  }

  loadAllRooms(): void {
    this.apiService.getRooms().subscribe(rooms => {
      this.allRooms = rooms;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.timeSubscription?.unsubscribe();
    this.resizeObserver?.disconnect();
    if (this.selectedRoom) {
      this.signalRService.leaveRoom(this.selectedRoom.roomId);
    }
  }

  private setupResizeObserver(): void {
    // Observe the desk-wrapper element for size changes
    const wrapper = document.querySelector('.desk-wrapper');
    if (wrapper) {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkCompactMode();
      });
      this.resizeObserver.observe(wrapper);
    }
  }

  private checkCompactMode(): void {
    // Auto-enable compact mode if window is very small
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Auto compact if window is very narrow or short
    if (width < 600 || height < 500) {
      this.isCompactMode = true;
    }
  }

  toggleCompactMode(): void {
    this.isCompactMode = !this.isCompactMode;
    this.saveCompactModeToStorage();
  }

  private loadCompactModeFromStorage(): void {
    const saved = localStorage.getItem('qms_compact_mode');
    if (saved === 'true') {
      this.isCompactMode = true;
    }
  }

  private saveCompactModeToStorage(): void {
    localStorage.setItem('qms_compact_mode', this.isCompactMode.toString());
  }

  private loadAutoMinimizeSettings(): void {
    const autoMinimize = localStorage.getItem('qms_auto_minimize');
    this.autoMinimizeOnCallNext = autoMinimize === 'true';
    
    const alwaysOnTop = localStorage.getItem('qms_always_on_top');
    this.autoAlwaysOnTop = alwaysOnTop === 'true';
    
    // Apply always on top setting if enabled
    if (this.autoAlwaysOnTop) {
      setAlwaysOnTop(true).catch(err => console.error('Error setting always on top:', err));
    }
  }

  toggleAutoMinimize(): void {
    this.autoMinimizeOnCallNext = !this.autoMinimizeOnCallNext;
    localStorage.setItem('qms_auto_minimize', this.autoMinimizeOnCallNext.toString());
  }

  toggleAlwaysOnTop(): void {
    this.autoAlwaysOnTop = !this.autoAlwaysOnTop;
    localStorage.setItem('qms_always_on_top', this.autoAlwaysOnTop.toString());
    setAlwaysOnTop(this.autoAlwaysOnTop).catch(err => console.error('Error setting always on top:', err));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.selectedRoom) return;

    switch (event.key) {
      case 'F1':
        event.preventDefault();
        this.callNext();
        break;
      case 'F2':
        event.preventDefault();
        if (this.currentTicket) this.recall();
        break;
      case 'F3':
        event.preventDefault();
        if (this.currentTicket) this.pass();
        break;
      case 'F4':
        event.preventDefault();
        if (this.currentTicket) this.done();
        break;
    }
  }

  private startClock(): void {
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  loadRooms(): void {
    const user = this.authService.currentUserValue;
    this.apiService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms.filter(r => r.isActive);
        
        // Auto-select room from user profile
        if (user?.roomId) {
          const userRoom = this.rooms.find(r => r.roomId === user.roomId);
          if (userRoom) {
            this.selectedRoom = userRoom;
            this.onRoomChange();
          }
        }
      },
      error: (err) => console.error('Error loading rooms:', err)
    });
  }

  setupSignalR(): void {
    this.signalRService.startConnection();

    this.subscriptions.push(
      this.signalRService.connectionState$.subscribe(state => {
        this.isConnected = state === HubConnectionState.Connected;
        this.isConnectionLost = state !== HubConnectionState.Connected;
        if (this.isConnected && this.selectedRoom) {
          this.signalRService.joinRoom(this.selectedRoom.roomId);
        }
      })
    );

    this.subscriptions.push(
      this.signalRService.ticketCalled$.subscribe(event => {
        if (this.selectedRoom && event.roomCode === this.selectedRoom.roomCode) {
          this.loadAllData();
        }
      })
    );

    this.subscriptions.push(
      this.signalRService.queueUpdated$.subscribe(event => {
        if (this.selectedRoom && event.roomId === this.selectedRoom.roomId) {
          // If queue size increased, notify
          if (event.queueSize > this.queue.length) {
            const newTicket = event.pendingTickets[event.pendingTickets.length - 1];
            this.signalRService.sendBrowserNotification(
              'Có số mới!',
              `Số ${newTicket} vừa vào hàng chờ phòng ${this.selectedRoom.roomCode}`
            );
          }
          this.loadAllData();
        }
      })
    );

    this.subscriptions.push(
      this.signalRService.ticketStatusChanged$.subscribe(event => {
        if (this.selectedRoom && event.roomCode === this.selectedRoom.roomCode) {
          // If a ticket just moved to pending (e.g. transfer), notify
          if (event.newStatus === TicketStatus.Pending) {
            this.signalRService.sendBrowserNotification(
              'Số chuyển đến!',
              `Số ${event.ticketNumber} vừa được chuyển đến phòng của bạn`
            );
          }
          this.loadAllData();
        }
      })
    );

    this.subscriptions.push(
      this.signalRService.reconnected$.subscribe(() => {
        console.log('SignalR reconnected - Refreshing calling desk for sync...');
        window.location.reload();
      })
    );
  }

  onRoomChange(): void {
    if (this.selectedRoom) {
      this.signalRService.joinRoom(this.selectedRoom.roomId);
      this.loadAllData();
    }
  }

  loadAllData(): void {
    if (!this.selectedRoom) return;
    
    this.apiService.getCallingDeskState(this.selectedRoom.roomId).subscribe({
      next: (state) => {
        this.currentTicket = state.currentTicket?.ticketNumber ? state.currentTicket : null;
        this.queue = state.waitingQueue;
        this.passedTickets = state.passedTickets;
        this.doneTickets = state.doneTickets;
        this.stats.waiting = state.totalWaiting;
        this.stats.processed = state.totalProcessed;
        this.stats.passed = state.totalPassed;
      },
      error: (err) => console.error('Error loading calling desk state:', err)
    });
  }

  loadCurrentTicket(): void {
    // Replaced by loadAllData
  }

  loadQueue(): void {
    // Replaced by loadAllData
  }

  loadHistory(): void {
    // Replaced by loadAllData
  }

  returnToQueue(ticket: Ticket): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.apiService.returnToQueue(ticket.ticketId).subscribe({
      next: () => {
        this.loadAllData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error returning to queue:', err);
        this.isLoading = false;
      }
    });
  }

  togglePriority(ticket: Ticket): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.apiService.togglePriority(ticket.ticketId).subscribe({
      next: () => {
        this.loadAllData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error toggling priority:', err);
        this.isLoading = false;
      }
    });
  }

  callNext(): void {
    if (!this.selectedRoom || this.isLoading) return;

    this.isLoading = true;
    // Clear current locally for instant feedback
    const prevTicket = this.currentTicket;
    
    this.apiService.callNext({ roomId: this.selectedRoom.roomId }).subscribe({
      next: (result: any) => {
        if (result.ticketNumber) {
          this.playSound();
          
          // Auto-minimize after successful call if setting enabled
          if (this.autoMinimizeOnCallNext) {
            minimizeWindow().catch(err => console.error('Error minimizing window:', err));
          }
        }
        this.loadAllData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error calling next:', err);
        this.currentTicket = prevTicket; // Revert if error
        this.isLoading = false;
      }
    });
  }

  recall(): void {
    if (!this.selectedRoom || this.isLoading) return;

    this.isLoading = true;
    this.apiService.recall({ roomId: this.selectedRoom.roomId }).subscribe({
      next: () => {
        this.playSound();
        this.loadAllData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error recalling:', err);
        this.isLoading = false;
      }
    });
  }

  pass(): void {
    if (!this.selectedRoom || !this.currentTicket || this.isLoading) return;

    this.isLoading = true;
    const ticketId = this.currentTicket.ticketId;
    this.currentTicket = null; // Instant feedback

    this.apiService.passTicket(ticketId, this.selectedRoom.roomId).subscribe({
      next: () => {
        this.loadAllData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error passing:', err);
        this.loadAllData(); // Reload to fix state
        this.isLoading = false;
      }
    });
  }

  done(): void {
    if (!this.selectedRoom || !this.currentTicket || this.isLoading) return;

    this.isLoading = true;
    const ticketId = this.currentTicket.ticketId;
    this.currentTicket = null; // Instant feedback

    this.apiService.doneTicket(ticketId, this.selectedRoom.roomId).subscribe({
      next: () => {
        this.loadAllData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error completing:', err);
        this.loadAllData(); // Reload to fix state
        this.isLoading = false;
      }
    });
  }

  openTransfer(): void {
    if (!this.currentTicket) return;
    this.targetRoomId = null;
    this.showTransferDialog = true;
  }

  confirmTransfer(): void {
    if (!this.currentTicket || !this.targetRoomId || this.isLoading) return;

    this.isLoading = true;
    const ticketId = this.currentTicket.ticketId;
    const targetRoomId = this.targetRoomId;

    this.apiService.transferTicket(ticketId, undefined, targetRoomId).subscribe({
      next: () => {
        this.showTransferDialog = false;
        this.currentTicket = null;
        this.loadAllData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error transferring ticket:', err);
        this.isLoading = false;
      }
    });
  }

  playSound(): void {
    const audio = new Audio('assets/sounds/call.mp3');
    audio.play().catch(() => {});
  }

  getStatusLabel(status: TicketStatus): string {
    const labels: Record<number, string> = {
      [TicketStatus.Pending]: 'Cho',
      [TicketStatus.Calling]: 'Dang goi',
      [TicketStatus.Serving]: 'Dang xu ly',
      [TicketStatus.Done]: 'Hoan thanh',
      [TicketStatus.Passed]: 'Bo qua',
      [TicketStatus.Cancelled]: 'Huy'
    };
    return labels[status] || 'Unknown';
  }

  getWaitTime(createdAt: Date | string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vua xong';
    if (diffMins < 60) return `${diffMins} phut`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}p`;
  }
}

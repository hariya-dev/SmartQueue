import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TicketCalledEvent, QueueUpdatedEvent, TicketStatusChangedEvent } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private connectionState = new BehaviorSubject<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);

  // Event subjects
  public ticketCalled$ = new Subject<TicketCalledEvent>();
  public queueUpdated$ = new Subject<QueueUpdatedEvent>();
  public ticketStatusChanged$ = new Subject<TicketStatusChangedEvent>();
  public reconnected$ = new Subject<void>();

  public connectionState$ = this.connectionState.asObservable();

  constructor() {
    this.createConnection();
    this.registerEvents();
    this.requestNotificationPermission();
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  public sendBrowserNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'assets/logo/logo.png'
      });
    }
  }

  private createConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/queue`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Always retry every 5 seconds after the first few attempts
          if (retryContext.previousRetryCount < 3) {
            return [0, 2000, 5000][retryContext.previousRetryCount];
          }
          return 5000; // Retry indefinitely every 5s
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.onreconnecting(() => {
      this.connectionState.next(signalR.HubConnectionState.Reconnecting);
      console.log('SignalR reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.next(signalR.HubConnectionState.Connected);
      console.log('SignalR reconnected');
      this.reconnected$.next();
    });

    this.hubConnection.onclose(() => {
      this.connectionState.next(signalR.HubConnectionState.Disconnected);
      console.log('SignalR connection closed');
    });
  }

  private registerEvents(): void {
    this.hubConnection.on('TicketCalled', (event: TicketCalledEvent) => {
      console.log('TicketCalled:', event);
      this.ticketCalled$.next(event);
    });

    this.hubConnection.on('QueueUpdated', (event: QueueUpdatedEvent) => {
      console.log('QueueUpdated:', event);
      this.queueUpdated$.next(event);
    });

    this.hubConnection.on('TicketStatusChanged', (event: TicketStatusChangedEvent) => {
      console.log('TicketStatusChanged:', event);
      this.ticketStatusChanged$.next(event);
    });
  }

  async startConnection(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.start();
        this.connectionState.next(signalR.HubConnectionState.Connected);
        console.log('SignalR connected');
      } catch (err) {
        console.error('SignalR connection error:', err);
        setTimeout(() => this.startConnection(), 5000);
      }
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.stop();
    }
  }

  // Room subscriptions
  async joinRoom(roomId: number): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinRoom', roomId);
    }
  }

  async leaveRoom(roomId: number): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveRoom', roomId);
    }
  }

  // TV subscriptions
  async joinTVProfile(tvProfileId: number): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinTVProfile', tvProfileId);
    }
  }

  async leaveTVProfile(tvProfileId: number): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveTVProfile', tvProfileId);
    }
  }

  // Kiosk subscriptions
  async joinKiosk(kioskId: number): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinKiosk', kioskId);
    }
  }

  // Ticket tracking
  async subscribeToTicket(ticketNumber: string): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('SubscribeToTicket', ticketNumber);
    }
  }

  async unsubscribeFromTicket(ticketNumber: string): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('UnsubscribeFromTicket', ticketNumber);
    }
  }

  // Dashboard
  async joinDashboard(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinDashboard');
    }
  }

  async joinAllRooms(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinAllRooms');
    }
  }
}

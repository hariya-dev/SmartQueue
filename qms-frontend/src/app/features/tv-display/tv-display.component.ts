import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Subscription, interval } from 'rxjs';
import { HubConnectionState } from '@microsoft/signalr';
import { ApiService } from '../../core/services/api.service';
import { SignalRService } from '../../core/services/signalr.service';
import { TVDisplay, TVRoomDisplay, TicketCalledEvent } from '../../core/models';
import { environment } from '../../../environments/environment';

interface CallingRoom {
  roomCode: string;
  currentTicketNumber: string;
  isPriority: boolean;
  isBlinking: boolean;
}

@Component({
  selector: 'app-tv-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tv-display.component.html',
  styleUrl: './tv-display.component.scss'
})
export class TVDisplayComponent implements OnInit, OnDestroy {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  tvProfileId: number = 1;
  tvDisplay: TVDisplay | null = null;
  currentTime = new Date();
  isConnected = false;
  isConnectionLost = false;
  safeAdUrl: SafeResourceUrl | null = null;
  currentAd: any = null;
  safeLogoUrl: SafeUrl | null = null;
  scale: number = 1;
  gridSlots: any[] = [];
  currentAdIndex = 0;
  private adRotationTimer: any = null;

  private subscriptions: Subscription[] = [];
  private blinkingTimeouts: Map<number, any> = new Map();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private signalRService: SignalRService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tvProfileId = +params['id'] || 1;
      this.loadTVDisplay();
    });

    this.setupSignalR();
    this.startClock();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.signalRService.leaveTVProfile(this.tvProfileId);
  }

  loadTVDisplay(): void {
    this.apiService.getTVDisplay(this.tvProfileId).subscribe({
      next: (data) => {
        // Preserve current blinking state before overwriting
        if (this.tvDisplay) {
          data.rooms.forEach(newRoom => {
            const oldRoom = this.tvDisplay?.rooms.find(r => r.roomId === newRoom.roomId);
            if (oldRoom && oldRoom.isBlinking) {
              newRoom.isBlinking = true;
            }
          });
        }
        
        this.tvDisplay = data;
        try {
          this.gridSlots = JSON.parse(data.gridConfigJson || '[]');
        } catch {
          this.gridSlots = [];
        }
        this.updateSafeLogoUrl();
        this.updateAdUrl();
        this.calculateScale();
      },
      error: (err) => console.error('Error loading TV display:', err)
    });
  }

  getRoomData(roomId: number): TVRoomDisplay | undefined {
    return this.tvDisplay?.rooms.find(r => r.roomId === roomId);
  }

  getLayoutStyles(): any {
    if (!this.tvDisplay) return {};
    
    const headerH = this.tvDisplay.headerSizePercent || 10;
    const footerH = this.tvDisplay.showFooter ? (this.tvDisplay.footerSizePercent || 10) : 0;
    const adSize = this.tvDisplay.showAd ? (this.tvDisplay.adSizePercent || 30) : 0;
    
    const isVerticalAd = this.tvDisplay.showAd && ['Top', 'Bottom'].includes(this.tvDisplay.adPosition);
    const isHorizontalAd = this.tvDisplay.showAd && ['Left', 'Right'].includes(this.tvDisplay.adPosition);
    
    // Total vertical reserved space for main content container
    // If ad is Top/Bottom, it takes space from the vertical flow
    const bodyH = 100 - headerH - footerH - (isVerticalAd ? adSize : 0);
    
    // Total horizontal reserved space for main content
    const mainW = isHorizontalAd ? (100 - adSize) : 100;

    const styles: any = {
      'width': `${this.tvDisplay.screenWidth}px`,
      'height': `${this.tvDisplay.screenHeight}px`,
      'transform': `scale(${this.scale})`,
      '--header-h': `${headerH}%`,
      '--footer-h': `${footerH}%`,
      '--ad-size': `${adSize}%`,
      '--main-h': `100%`, // main fills its container height
      '--main-w': `${mainW}%`,
      '--body-h': `${bodyH}%`,
      '--row-gap': `${this.tvDisplay.rowGap ?? 20}px`,
      '--col-gap': `${this.tvDisplay.columnGap ?? 20}px`,
      
      // Font Sizes - with reasonable defaults if 0
      '--hospital-name-fs': `${this.tvDisplay.hospitalNameFontSize || 36}px`,
      '--room-name-fs': `${this.tvDisplay.roomNameFontSize || 32}px`,
      '--counter-number-fs': `${this.tvDisplay.counterNumberFontSize || 28}px`,
      '--ticket-number-fs': `${this.tvDisplay.ticketNumberFontSize || 48}px`,
      '--datetime-fs': `${this.tvDisplay.dateTimeFontSize || 24}px`,
      '--footer-fs': `${this.tvDisplay.footerFontSize || 20}px`,
      
      // Colors - with fallbacks
      '--header-bg': this.tvDisplay.headerBgColor || '#0054a6',
      '--main-bg': this.tvDisplay.mainBgColor || '#ffffff',
      '--footer-bg': this.tvDisplay.footerBgColor || '#f8f9fa',
      '--header-text': this.tvDisplay.headerTextColor || '#ffffff',
      '--main-text': this.tvDisplay.mainTextColor || '#333333',
      '--footer-text': this.tvDisplay.footerTextColor || '#333333',
      '--active-color': this.tvDisplay.activeColor || '#22c55e',
      '--inactive-color': this.tvDisplay.inactiveColor || '#ef4444',
      '--signal-color': this.tvDisplay.connectionStatusColor || '#22c55e'
    };

    return styles;
  }

  getVietnameseDay(): string {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[this.currentTime.getDay()];
  }

  getAdUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Convert relative /uploads/... to absolute backend URL
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${url}`;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calculateScale();
  }

  private calculateScale(): void {
    if (!this.tvDisplay || !this.tvDisplay.screenWidth || !this.tvDisplay.screenHeight) {
      this.scale = 1;
      return;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const scaleX = windowWidth / this.tvDisplay.screenWidth;
    const scaleY = windowHeight / this.tvDisplay.screenHeight;
    
    // Choose the smaller scale to ensure it fits both dimensions
    this.scale = Math.min(scaleX, scaleY);
  }

  private updateSafeLogoUrl(): void {
    if (this.tvDisplay?.logoUrl) {
      this.safeLogoUrl = this.sanitizer.bypassSecurityTrustUrl(this.tvDisplay.logoUrl);
    } else {
      this.safeLogoUrl = null;
    }
  }

  public updateAdUrl(): void {
    const ads = this.tvDisplay?.advertisements?.filter(a => a.isActive) || [];
    
    if (this.tvDisplay?.showAd && ads.length > 0) {
      if (this.currentAdIndex >= ads.length) {
        this.currentAdIndex = 0;
      }
      
      const ad = ads[this.currentAdIndex];
      this.currentAd = ad;
      
      if (ad.adType === 1) { // ExternalLink
        const url = ad.url;
        let videoId = '';

        if (url.includes('youtube.com/watch?v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('embed/')[1].split('?')[0];
        }

        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
          this.safeAdUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        } else {
          this.safeAdUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      } else {
        // Local video - using direct URL
        this.safeAdUrl = null; 
      }

      // Schedule next rotation
      this.scheduleNextAd(ad.durationInSeconds || 30);
    } else {
      this.safeAdUrl = null;
      this.currentAd = null;
      if (this.adRotationTimer) {
        clearTimeout(this.adRotationTimer);
      }
    }
  }

  private scheduleNextAd(duration: number): void {
    if (this.adRotationTimer) {
      clearTimeout(this.adRotationTimer);
    }
    
    const ads = this.tvDisplay?.advertisements?.filter(a => a.isActive) || [];
    if (ads.length <= 1) return;

    this.adRotationTimer = setTimeout(() => {
      this.currentAdIndex = (this.currentAdIndex + 1) % ads.length;
      this.updateAdUrl();
    }, duration * 1000);
  }

  setupSignalR(): void {
    this.signalRService.startConnection().then(() => {
      this.signalRService.joinTVProfile(this.tvProfileId);
      this.signalRService.joinAllRooms();
    });

    this.subscriptions.push(
      this.signalRService.connectionState$.subscribe(state => {
        this.isConnected = state === HubConnectionState.Connected;
        if (this.isConnected) {
          this.signalRService.joinTVProfile(this.tvProfileId);
          this.signalRService.joinAllRooms();
        }
      })
    );

    this.subscriptions.push(
      this.signalRService.ticketCalled$.subscribe(event => {
        this.handleTicketCalled(event);
      })
    );

    this.subscriptions.push(
      this.signalRService.queueUpdated$.subscribe(() => {
        this.loadTVDisplay();
      })
    );

    this.subscriptions.push(
      this.signalRService.reconnected$.subscribe(() => {
        console.log('SignalR reconnected - Refreshing page for sync...');
        window.location.reload();
      })
    );
  }

  handleTicketCalled(event: TicketCalledEvent): void {
    if (this.tvDisplay) {
      const room = this.tvDisplay.rooms.find(r => r.roomCode === event.roomCode);
      if (room) {
        room.currentTicketNumber = event.ticketNumber;
        
        // Clear existing timeout if any
        if (this.blinkingTimeouts.has(room.roomId)) {
          clearTimeout(this.blinkingTimeouts.get(room.roomId));
        }

        room.isBlinking = true;

        // Play notification sound
        this.playSound();

        // Remove blinking after 10 seconds
        const timeout = setTimeout(() => {
          room.isBlinking = false;
          this.blinkingTimeouts.delete(room.roomId);
        }, 10000);

        this.blinkingTimeouts.set(room.roomId, timeout);
      }
    }
  }

  playSound(): void {
    try {
      const audio = new Audio('assets/sounds/call.mp3');
      audio.volume = 1.0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (e) {
      console.log('Audio not available');
    }
  }

  startClock(): void {
    this.subscriptions.push(
      interval(1000).subscribe(() => {
        this.currentTime = new Date();
      })
    );
  }

  startAutoRefresh(): void {
    this.subscriptions.push(
      interval(30000).subscribe(() => {
        this.loadTVDisplay();
      })
    );
  }
}

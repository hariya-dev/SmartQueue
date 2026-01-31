import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { TVDisplay, Room } from '../../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { SliderModule } from 'primeng/slider';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-tv-profiles-management',
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
    DropdownModule,
    MultiSelectModule,
    TagModule,
    SliderModule,
    ColorPickerModule,
    FileUploadModule,
    MessageModule,
    DividerModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="management-container">
      <div class="management-header">
        <div class="header-title">
          <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-plain" (click)="goBack()"></button>
          <h2>Quản lý Màn hình TV</h2>
        </div>
        <button pButton label="Thêm màn hình" icon="pi pi-plus" class="p-button-success" (click)="openNew()"></button>
      </div>

      <p-table [value]="profiles" [rows]="10" [paginator]="true" [scrollable]="true"
               styleClass="p-datatable-gridlines p-datatable-striped custom-table">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 15%">Mã TV</th>
            <th style="width: 20%">Tên màn hình</th>
            <th style="width: 20%">Quầy hiển thị</th>
            <th style="width: 15%">Quảng cáo</th>
            <th style="width: 15%">Trạng thái</th>
            <th style="width: 15%">Thao tác</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-profile>
          <tr>
            <td><strong>{{ profile.tvCode }}</strong></td>
            <td>{{ profile.tvName }}</td>
            <td>
              <span class="room-count-badge">{{ profile.roomIds?.length || 0 }} quầy</span>
            </td>
            <td>
              <p-tag [value]="profile.showAd ? 'Bật' : 'Tắt'" 
                     [severity]="profile.showAd ? 'success' : 'info'"></p-tag>
            </td>
            <td>
              <span [class]="'status-badge ' + (profile.isActive ? 'active' : 'inactive')">
                {{ profile.isActive ? 'Hoạt động' : 'Tạm dừng' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button pButton icon="pi pi-desktop" class="p-button-rounded p-button-secondary p-button-text" 
                        title="Xem thử" (click)="previewTV(profile)"></button>
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text" (click)="editProfile(profile)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" (click)="deleteProfile(profile)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="profileDialog" [style]="{width: '550px'}" header="Chi tiết Màn hình TV" [modal]="true" styleClass="p-fluid custom-dialog">
        <ng-template pTemplate="content">
          <div class="field">
            <label for="code">Mã màn hình</label>
            <input type="text" pInputText id="code" [(ngModel)]="profile.tvCode" required [disabled]="!!profile.tvProfileId" />
            <small class="p-error" *ngIf="submitted && !profile.tvCode">Bắt buộc nhập mã màn hình.</small>
          </div>
          <div class="field">
            <label for="name">Tên màn hình (Vị trí đặt)</label>
            <input type="text" pInputText id="name" [(ngModel)]="profile.tvName" required />
            <small class="p-error" *ngIf="submitted && !profile.tvName">Bắt buộc nhập tên màn hình.</small>
          </div>

          <div class="field">
            <label for="rooms">Chọn quầy hiển thị</label>
            <p-multiSelect [options]="rooms" [(ngModel)]="profile.roomIds" 
                           optionLabel="roomName" optionValue="roomId"
                           placeholder="Chọn danh sách quầy" display="chip"></p-multiSelect>
          </div>

          <div class="layout-config-section">
            <h3 class="section-title">Cấu hình Hiển thị & Cỡ chữ</h3>
            <div class="field">
              <label for="layoutMode">Dạng hiển thị</label>
              <p-dropdown [options]="layoutModes" [(ngModel)]="profile.layoutMode" 
                          optionLabel="label" optionValue="value"></p-dropdown>
            </div>
            
            <div class="grid-2col">
              <div class="field">
                <label>Tên Bệnh viện ({{profile.hospitalNameFontSize}}px)</label>
                <p-slider [(ngModel)]="profile.hospitalNameFontSize" [min]="10" [max]="100"></p-slider>
              </div>
              <div class="field">
                <label>Tên Quầy ({{profile.roomNameFontSize}}px)</label>
                <p-slider [(ngModel)]="profile.roomNameFontSize" [min]="10" [max]="150"></p-slider>
              </div>
            </div>

            <div class="grid-2col">
              <div class="field">
                <label>Số Thứ Tự ({{profile.ticketNumberFontSize}}px)</label>
                <p-slider [(ngModel)]="profile.ticketNumberFontSize" [min]="10" [max]="300"></p-slider>
              </div>
              <div class="field">
                <label>Ngày/Giờ ({{profile.dateTimeFontSize}}px)</label>
                <p-slider [(ngModel)]="profile.dateTimeFontSize" [min]="10" [max]="100"></p-slider>
              </div>
            </div>

            <div class="field">
              <label>Chữ chạy Footer ({{profile.footerFontSize}}px)</label>
              <p-slider [(ngModel)]="profile.footerFontSize" [min]="10" [max]="100"></p-slider>
            </div>

            <div class="grid-2col">
              <div class="field">
                <label>Khoảng cách Hàng ({{profile.rowGap}}px)</label>
                <p-slider [(ngModel)]="profile.rowGap" [min]="0" [max]="100"></p-slider>
              </div>
              <div class="field">
                <label>Khoảng cách Cột ({{profile.columnGap}}px)</label>
                <p-slider [(ngModel)]="profile.columnGap" [min]="0" [max]="100"></p-slider>
              </div>
            </div>

            <div class="grid-2col">
              <div class="field">
                <label for="columns">Số cột</label>
                <input type="number" pInputText id="columns" [(ngModel)]="profile.columnsPerRow" (change)="generateGrid()" />
              </div>
              <div class="field">
                <label for="rows">Số hàng</label>
                <input type="number" pInputText id="rows" [(ngModel)]="profile.rowsCount" (change)="generateGrid()" />
                <small class="text-primary font-bold mt-1" *ngIf="profile && profile.rowsCount && profile.rowsCount > 0">
                  Mỗi hàng chiếm: {{ getCalculatedRowHeight() }}% chiều cao màn hình
                </small>
              </div>
            </div>

            <div class="layout-designer" *ngIf="profile.columnsPerRow && profile.rowsCount">
              <label>Bố cục màn hình (Click để chọn quầy)</label>
              <div class="visual-grid" [style.grid-template-columns]="'repeat(' + profile.columnsPerRow + ', 1fr)'">
                <div *ngFor="let slot of gridSlots; let i = index" 
                     class="grid-slot" 
                     [class.occupied]="!!slot.roomId"
                     (click)="selectSlot(i)">
                  <span *ngIf="!slot.roomId">Trống</span>
                  <span *ngIf="slot.roomId" class="slot-room-name">
                    {{ getRoomName(slot.roomId) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="grid-2col">
              <div class="field">
                <label for="width">Chiều rộng (px)</label>
                <input type="number" pInputText id="width" [(ngModel)]="profile.screenWidth" placeholder="1920" />
              </div>
              <div class="field">
                <label for="height">Chiều cao (px)</label>
                <input type="number" pInputText id="height" [(ngModel)]="profile.screenHeight" placeholder="1080" />
              </div>
            </div>

            <div class="field">
              <label for="headerSize">Chiều cao Header (%)</label>
              <input type="number" pInputText id="headerSize" [(ngModel)]="profile.headerSizePercent" />
            </div>

            <div class="field">
              <label for="logoUrl">Link Logo (Góc trái)</label>
              <input type="text" pInputText id="logoUrl" [(ngModel)]="profile.logoUrl" placeholder="https://.../logo.png" />
            </div>

            <div class="grid-2col">
              <div class="field">
                <label for="timeFormat">Định dạng thời gian</label>
                <p-dropdown [options]="timeFormats" [(ngModel)]="profile.timeFormat" 
                            optionLabel="label" optionValue="value"></p-dropdown>
              </div>
              <div class="field-row" style="margin-top: 2rem;">
                <label for="showDate">Hiển thị ngày</label>
                <p-inputSwitch id="showDate" [(ngModel)]="profile.showDate"></p-inputSwitch>
              </div>
            </div>
          </div>

          <div class="color-config-section">
            <h3 class="section-title">Cấu hình Màu sắc</h3>
            <div class="color-grid">
              <div class="field-color">
                <label>Header Bg</label>
                <p-colorPicker [(ngModel)]="profile.headerBgColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Main Bg</label>
                <p-colorPicker [(ngModel)]="profile.mainBgColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Footer Bg</label>
                <p-colorPicker [(ngModel)]="profile.footerBgColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Header Text</label>
                <p-colorPicker [(ngModel)]="profile.headerTextColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Main Text</label>
                <p-colorPicker [(ngModel)]="profile.mainTextColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Footer Text</label>
                <p-colorPicker [(ngModel)]="profile.footerTextColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Active</label>
                <p-colorPicker [(ngModel)]="profile.activeColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Inactive</label>
                <p-colorPicker [(ngModel)]="profile.inactiveColor"></p-colorPicker>
              </div>
              <div class="field-color">
                <label>Signal</label>
                <p-colorPicker [(ngModel)]="profile.connectionStatusColor"></p-colorPicker>
              </div>
            </div>
          </div>

          <div class="ad-config-section">
            <h3 class="section-title">Hệ thống Quảng cáo (Video)</h3>
            <div class="field-row">
              <label for="showAd">Kích hoạt Quảng cáo</label>
              <p-inputSwitch id="showAd" [(ngModel)]="profile.showAd"></p-inputSwitch>
            </div>

            <div *ngIf="profile.showAd">
              <div class="field" *ngIf="profile.tvProfileId">
                <label>Quản lý Video & Link</label>
                <div class="ad-actions">
                  <p-fileUpload mode="basic" chooseLabel="Tải lên Video" [auto]="true" 
                                customUpload="true" (uploadHandler)="onUploadAd($event)"
                                accept="video/*" class="mr-2"></p-fileUpload>
                  <button pButton label="Thêm Link YouTube" icon="pi pi-link" 
                          class="p-button-outlined p-button-info" (click)="addExternalAd()"></button>
                </div>
                
                <div class="ad-list mt-3">
                  <div *ngFor="let ad of profile.advertisements" class="ad-item">
                    <span class="ad-title">
                      <i [class]="ad.adType === 0 ? 'pi pi-video' : 'pi pi-link'"></i>
                      {{ ad.adTitle }}
                    </span>
                    <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" 
                            (click)="removeAd(ad)"></button>
                  </div>
                </div>
              </div>
              
              <div class="field" *ngIf="!profile.tvProfileId">
                <p-message severity="info" text="Lưu thông tin màn hình trước để quản lý video."></p-message>
              </div>

              <div class="grid-2col">
                <div class="field">
                  <label for="adPos">Vị trí</label>
                  <p-dropdown [options]="positions" [(ngModel)]="profile.adPosition" 
                              optionLabel="label" optionValue="value"></p-dropdown>
                </div>
                <div class="field">
                  <label for="adSize">Kích thước (%)</label>
                  <input type="number" pInputText id="adSize" [(ngModel)]="profile.adSizePercent" placeholder="30" />
                </div>
              </div>
            </div>
          </div>

          <div class="footer-config-section">
            <h3 class="section-title">Cấu hình Chạy chữ (Footer)</h3>
            <div class="field-row">
              <label for="showFooter">Hiển thị chân trang</label>
              <p-inputSwitch id="showFooter" [(ngModel)]="profile.showFooter"></p-inputSwitch>
            </div>

            <div *ngIf="profile.showFooter">
              <div class="field">
                <label for="footerText">Nội dung chạy chữ</label>
                <input type="text" pInputText id="footerText" [(ngModel)]="profile.footerText" 
                       placeholder="Vui lòng chú ý nghe gọi số..." />
              </div>

              <div class="grid-2col">
                <div class="field">
                  <label for="footerPos">Vị trí</label>
                  <p-dropdown [options]="positions" [(ngModel)]="profile.footerPosition" 
                              optionLabel="label" optionValue="value"></p-dropdown>
                </div>
                <div class="field">
                  <label for="footerSize">Kích thước (%)</label>
                  <input type="number" pInputText id="footerSize" [(ngModel)]="profile.footerSizePercent" />
                </div>
              </div>
            </div>
          </div>

          <div class="field-row" style="margin-top: 2rem;">
            <label for="active">Trạng thái hoạt động</label>
            <p-inputSwitch id="active" [(ngModel)]="profile.isActive"></p-inputSwitch>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="Lưu" icon="pi pi-check" class="p-button-primary" (click)="saveProfile()"></button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>
      <p-toast></p-toast>

      <!-- Add External Ad Dialog -->
      <p-dialog [(visible)]="adDialog" [style]="{width: '400px'}" header="Thêm Link YouTube" [modal]="true" styleClass="p-fluid">
        <ng-template pTemplate="content">
          <div class="field">
            <label for="adTitle">Tiêu đề video</label>
            <input type="text" pInputText id="adTitle" [(ngModel)]="newAdTitle" placeholder="VD: Giới thiệu bệnh viện" />
          </div>
          <div class="field">
            <label for="adUrl">Link YouTube (Embed hoặc Watch)</label>
            <input type="text" pInputText id="adUrl" [(ngModel)]="newAdUrl" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
        </ng-template>
        <ng-template pTemplate="footer">
          <button pButton label="Hủy" icon="pi pi-times" class="p-button-text" (click)="adDialog = false"></button>
          <button pButton label="Thêm" icon="pi pi-check" class="p-button-primary" (click)="confirmAddExternalAd()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .management-container { 
      padding: 2.5rem; background: white; border-radius: 20px; 
      margin: 2.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 1px solid var(--color-primary-100);
      overflow: hidden;
    }
    .management-header { 
      display: flex; justify-content: space-between; align-items: center; 
      margin-bottom: 2.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem;
    }
    .header-title { 
      display: flex; align-items: center; gap: 1.5rem; 
      h2 { 
        margin: 0; font-family: 'Montserrat', sans-serif; font-weight: 900; color: var(--color-primary-600); 
        letter-spacing: -0.5px;
      } 
    }
    .room-count-badge { background: #e0f2fe; color: #0369a1; padding: 0.3rem 0.8rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem; }
    .ad-config-section { background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem; border: 1px solid #eef2f6; }
    .layout-config-section { background: #f0f9ff; padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem; border: 1px solid #e0f2fe; }
    .color-config-section { background: #fefce8; padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem; border: 1px solid #fef9c3; }
    .footer-config-section { background: #fff7ed; padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem; border: 1px solid #ffedd5; }
    .color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .field-color { 
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      label { font-size: 0.75rem; font-weight: 700; color: #854d0e; }
    }
    .ad-actions { display: flex; align-items: center; gap: 0.5rem; }
    .ad-list { border: 1px solid #e2e8f0; border-radius: 8px; background: white; }
    .ad-item { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 0.5rem 1rem; border-bottom: 1px solid #f1f5f9;
      &:last-child { border-bottom: none; }
      .ad-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #475569; }
    }
    .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .layout-designer { 
      margin: 1.5rem 0; padding: 1rem; background: #e0f2fe; border-radius: 12px; 
      label { display: block; margin-bottom: 0.75rem; font-weight: 800; color: #0369a1; font-size: 0.9rem; }
    }
    .visual-grid { 
      display: grid; gap: 4px; background: #cbd5e1; padding: 4px; border-radius: 8px; border: 2px solid #94a3b8;
      .grid-slot { 
        aspect-ratio: 16/9; background: #f1f5f9; display: flex; align-items: center; justify-content: center; 
        font-size: 0.75rem; color: #94a3b8; cursor: pointer; border-radius: 4px; border: 1px dashed #cbd5e1;
        transition: all 0.2s;
        &:hover { background: #e2e8f0; border-color: #64748b; }
        &.occupied { background: #0ea5e9; color: white; border-style: solid; font-weight: 700; text-align: center; padding: 4px; }
      }
    }
    .section-title { font-size: 1rem; font-weight: 800; color: var(--color-primary-700); margin-bottom: 1.25rem; margin-top: 0; }
    .status-badge { 
      padding: 0.35rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 800; display: inline-block;
      &.active { background: #dcfce7; color: #15803d; }
      &.inactive { background: #fee2e2; color: #b91c1c; }
    }
    .action-buttons { display: flex; gap: 0.75rem; justify-content: center; }
    .field { margin-bottom: 1.5rem; label { display: block; margin-bottom: 0.6rem; font-weight: 800; color: var(--color-gray-700); } }
    .field-row { 
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1rem; line-height: 1;
      padding: 1rem; background: #f8fafc; border-radius: 8px;
      label { font-weight: 800; color: var(--color-gray-700); margin: 0; display: flex; align-items: center; } 
      p-inputSwitch { display: flex; align-items: center; height: 24px; }
    }
    .p-info { color: var(--color-gray-500); font-size: 0.85rem; margin-top: 0.4rem; display: block; }

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
          background: white; border: none; padding: 1.5rem 0;
          .p-paginator-pages .p-paginator-page.p-highlight {
            background: var(--color-primary-600); color: white;
          }
        }
      }

      .p-multiselect, .p-dropdown {
        width: 100% !important;
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
  `]
})
export class TVProfilesManagementComponent implements OnInit {
  profiles: TVDisplay[] = [];
  rooms: Room[] = [];
  profile: Partial<TVDisplay> = {};
  profileDialog: boolean = false;
  adDialog: boolean = false;
  submitted: boolean = false;
  newAdTitle: string = '';
  newAdUrl: string = '';
  gridSlots: any[] = [];

  positions = [
    { label: 'Phía dưới (Ngang)', value: 'Bottom' },
    { label: 'Phía trên (Ngang)', value: 'Top' },
    { label: 'Bên phải (Dọc)', value: 'Right' },
    { label: 'Bên trái (Dọc)', value: 'Left' }
  ];

  layoutModes = [
    { label: 'Dạng Card (Tên trên, STT dưới)', value: 'Grid' },
    { label: 'Dạng Hàng Ngang (Tên - STT)', value: 'Horizontal' }
  ];

  timeFormats = [
    { label: 'Giờ:Phút:Giây (24h)', value: 'HH:mm:ss' },
    { label: 'Giờ:Phút (24h)', value: 'HH:mm' }
  ];

  constructor(
    private apiService: ApiService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
    this.loadRooms();
  }

  loadProfiles(): void {
    this.apiService.getTVProfiles().subscribe(data => this.profiles = data);
  }

  loadRooms(): void {
    this.apiService.getRooms().subscribe(data => this.rooms = data);
  }

  goBack(): void {
    window.history.back();
  }

  previewTV(profile: TVDisplay): void {
    window.open(`/tv-display/${profile.tvProfileId}`, '_blank');
  }

  openNew(): void {
    this.profile = { 
      isActive: true, 
      showAd: false, 
      adPosition: 'Bottom',
      roomIds: [],
      displayMode: 0, // Specific
      columnsPerRow: 3,
      rowsCount: 2,
      layoutMode: 'Grid',
      screenWidth: 1920,
      screenHeight: 1080,
      headerSizePercent: 10,
      logoUrl: '',
      timeFormat: 'HH:mm:ss',
      showDate: true,
      adSizePercent: 30,
      showFooter: true,
      footerPosition: 'Bottom',
      footerSizePercent: 10,
      gridConfigJson: '[]',
      rowGap: 20,
      columnGap: 20,
      hospitalNameFontSize: 36,
      roomNameFontSize: 32,
      counterNumberFontSize: 28,
      ticketNumberFontSize: 48,
      dateTimeFontSize: 24,
      footerFontSize: 20,
      headerBgColor: '#0054a6',
      mainBgColor: '#ffffff',
      footerBgColor: '#f8f9fa',
      headerTextColor: '#ffffff',
      mainTextColor: '#333333',
      footerTextColor: '#333333',
      activeColor: '#22c55e',
      inactiveColor: '#ef4444',
      connectionStatusColor: '#22c55e'
    };
    this.gridSlots = [];
    this.generateGrid();
    this.submitted = false;
    this.profileDialog = true;
  }

  editProfile(profile: TVDisplay): void {
    this.profile = { 
      ...profile,
      columnsPerRow: profile.columnsPerRow || 3,
      rowsCount: profile.rowsCount || 2,
      layoutMode: profile.layoutMode || 'Grid',
      screenWidth: profile.screenWidth || 1920,
      screenHeight: profile.screenHeight || 1080,
      headerSizePercent: profile.headerSizePercent || 10,
      logoUrl: profile.logoUrl || '',
      timeFormat: profile.timeFormat || 'HH:mm:ss',
      showDate: profile.showDate !== undefined ? profile.showDate : true,
      adSizePercent: profile.adSizePercent || 30,
      adPosition: profile.adPosition || 'Bottom',
      showFooter: profile.showFooter !== undefined ? profile.showFooter : true,
      footerPosition: profile.footerPosition || 'Bottom',
      footerSizePercent: profile.footerSizePercent || 10,
      gridConfigJson: profile.gridConfigJson || '[]',
      rowGap: profile.rowGap !== undefined ? profile.rowGap : 20,
      columnGap: profile.columnGap !== undefined ? profile.columnGap : 20,
      hospitalNameFontSize: profile.hospitalNameFontSize || 36,
      roomNameFontSize: profile.roomNameFontSize || 32,
      counterNumberFontSize: profile.counterNumberFontSize || 28,
      ticketNumberFontSize: profile.ticketNumberFontSize || 48,
      dateTimeFontSize: profile.dateTimeFontSize || 24,
      footerFontSize: profile.footerFontSize || 20,
      headerBgColor: profile.headerBgColor || '#0054a6',
      mainBgColor: profile.mainBgColor || '#ffffff',
      footerBgColor: profile.footerBgColor || '#f8f9fa',
      headerTextColor: profile.headerTextColor || '#ffffff',
      mainTextColor: profile.mainTextColor || '#333333',
      footerTextColor: profile.footerTextColor || '#333333',
      activeColor: profile.activeColor || '#22c55e',
      inactiveColor: profile.inactiveColor || '#ef4444',
      connectionStatusColor: profile.connectionStatusColor || '#22c55e',
      advertisements: profile.advertisements || []
    };
    try {
      this.gridSlots = JSON.parse(this.profile.gridConfigJson || '[]');
    } catch {
      this.gridSlots = [];
    }
    this.generateGrid();
    this.profileDialog = true;
  }

  generateGrid(): void {
    const cols = this.profile.columnsPerRow || 1;
    const rows = this.profile.rowsCount || 1;
    const total = cols * rows;
    
    // Maintain existing room assignments if possible
    const currentSlots = [...this.gridSlots];
    this.gridSlots = [];
    for (let i = 0; i < total; i++) {
      this.gridSlots.push(currentSlots[i] || { roomId: null });
    }
  }

  selectSlot(index: number): void {
    if (!this.profile.roomIds || this.profile.roomIds.length === 0) {
      this.messageService.add({severity:'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn danh sách quầy hiển thị trước'});
      return;
    }

    const availableRooms = this.rooms.filter(r => this.profile.roomIds?.includes(r.roomId));
    
    // Cycle through selected rooms for this slot
    const currentRoomId = this.gridSlots[index].roomId;
    if (!currentRoomId) {
      this.gridSlots[index].roomId = availableRooms[0].roomId;
    } else {
      const currentIndex = availableRooms.findIndex(r => r.roomId === currentRoomId);
      if (currentIndex === -1 || currentIndex === availableRooms.length - 1) {
        this.gridSlots[index].roomId = null; // Back to empty
      } else {
        this.gridSlots[index].roomId = availableRooms[currentIndex + 1].roomId;
      }
    }
  }

  getCalculatedRowHeight(): string {
    if (!this.profile) return '0';
    const header = this.profile.headerSizePercent ?? 0;
    const footer = this.profile.showFooter ? (this.profile.footerSizePercent ?? 0) : 0;
    const adSize = this.profile.showAd ? (this.profile.adSizePercent ?? 0) : 0;
    const rows = this.profile.rowsCount || 1;
    
    // Ads only take vertical space if they are Top or Bottom
    const isVerticalAd = this.profile.showAd && ['Top', 'Bottom'].includes(this.profile.adPosition || 'Bottom');
    
    const remaining = 100 - header - footer - (isVerticalAd ? adSize : 0);
    const perRow = remaining / rows;
    return perRow > 0 ? perRow.toFixed(2) : '0';
  }

  getRoomName(roomId: number): string {
    return this.rooms.find(r => r.roomId === roomId)?.roomName || 'Quầy';
  }

  hideDialog(): void {
    this.profileDialog = false;
    this.submitted = false;
  }

  saveProfile(): void {
    this.submitted = true;
    this.profile.gridConfigJson = JSON.stringify(this.gridSlots);

    if (this.profile.tvCode && this.profile.tvName) {
      if (this.profile.tvProfileId) {
        this.apiService.updateTVProfile(this.profile.tvProfileId, this.profile).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Cập nhật cấu hình TV thành công'});
            this.loadProfiles();
            this.profileDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể cập nhật'})
        });
      } else {
        this.apiService.createTVProfile(this.profile).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Thêm cấu hình TV thành công'});
            this.loadProfiles();
            this.profileDialog = false;
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: err.error?.error || 'Không thể thêm mới'})
        });
      }
    }
  }

  deleteProfile(profile: TVDisplay): void {
    this.confirmationService.confirm({
      message: `Xóa cấu hình màn hình "${profile.tvName}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteTVProfile(profile.tvProfileId).subscribe({
          next: () => {
            this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Đã xóa'});
            this.loadProfiles();
          },
          error: (err) => this.messageService.add({severity:'error', summary: 'Lỗi', detail: 'Không thể xóa'})
        });
      }
    });
  }

  // Advertisement Management
  onUploadAd(event: any): void {
    const file = event.files[0];
    if (file) {
      this.apiService.uploadAdVideo(file).subscribe({
        next: (res) => {
          this.addAdToList(file.name, res.url, 0); // TVAdType.Video
          this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Tải lên video thành công'});
        },
        error: () => this.messageService.add({severity:'error', summary: 'Lỗi', detail: 'Không thể tải lên video'})
      });
    }
  }

  addExternalAd(): void {
    if (!this.profile.tvProfileId) {
      this.messageService.add({severity:'warn', summary: 'Thông báo', detail: 'Vui lòng lưu thông tin màn hình trước khi thêm quảng cáo'});
      return;
    }
    this.newAdTitle = '';
    this.newAdUrl = '';
    this.adDialog = true;
  }

  confirmAddExternalAd(): void {
    if (this.newAdTitle && this.newAdUrl) {
      this.addAdToList(this.newAdTitle, this.newAdUrl, 1); // TVAdType.ExternalLink
      this.adDialog = false;
    } else {
      this.messageService.add({severity:'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ tiêu đề và link'});
    }
  }

  private addAdToList(title: string, url: string, type: number): void {
    if (!this.profile.tvProfileId) {
      // For new profile, just add to local array (will be saved when profile is created - wait, backend might need them separately)
      // Actually, my backend AddAd requires a profileId. 
      // So maybe I should disable Ad upload until profile is created.
      this.messageService.add({severity:'warn', summary: 'Thông báo', detail: 'Vui lòng lưu thông tin màn hình trước khi thêm quảng cáo'});
      return;
    }

    const adRequest = {
      adTitle: title,
      url: url,
      adType: type,
      displayOrder: (this.profile.advertisements?.length || 0) + 1,
      durationInSeconds: 30
    };

    this.apiService.addTVAd(this.profile.tvProfileId, adRequest).subscribe({
      next: (ad) => {
        if (!this.profile.advertisements) this.profile.advertisements = [];
        this.profile.advertisements.push(ad);
        this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Đã thêm quảng cáo'});
      }
    });
  }

  removeAd(ad: any): void {
    this.apiService.deleteTVAd(ad.tvAdId).subscribe({
      next: () => {
        this.profile.advertisements = this.profile.advertisements?.filter(a => a.tvAdId !== ad.tvAdId);
        this.messageService.add({severity:'success', summary: 'Thành công', detail: 'Đã xóa quảng cáo'});
      }
    });
  }
}

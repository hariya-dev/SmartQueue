import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrioritySetting, Service, Room, PriorityStrategy } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-priority-settings-management',
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
    InputNumberModule,
    TagModule
  ],
  templateUrl: './priority-settings-management.component.html',
  styleUrl: './priority-settings-management.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class PrioritySettingsManagementComponent implements OnInit {
  prioritySettings: PrioritySetting[] = [];
  services: Service[] = [];
  rooms: Room[] = [];
  
  showDialog = false;
  isEditMode = false;
  isLoading = false;
  
  selectedSetting: PrioritySetting | null = null;
  formData: Partial<PrioritySetting> = {};
  
  strategyOptions = [
    { label: 'Ưu tiên (Strict)', value: PriorityStrategy.Strict },
    { label: 'Xen kẽ (Interleaved)', value: PriorityStrategy.Interleaved }
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadPrioritySettings();
    this.loadServices();
    this.loadRooms();
  }

  loadPrioritySettings(): void {
    this.apiService.getPrioritySettings().subscribe({
      next: (data) => this.prioritySettings = data,
      error: (err) => {
        console.error('Error loading priority settings:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách cấu hình ưu tiên'
        });
      }
    });
  }

  loadServices(): void {
    this.apiService.getServices(true).subscribe({
      next: (data) => this.services = data,
      error: (err) => console.error('Error loading services:', err)
    });
  }

  loadRooms(): void {
    this.apiService.getRooms().subscribe({
      next: (data) => this.rooms = data,
      error: (err) => console.error('Error loading rooms:', err)
    });
  }

  openAddDialog(): void {
    this.isEditMode = false;
    this.formData = {
      serviceId: undefined,
      roomId: undefined,
      strategy: PriorityStrategy.Strict,
      interleaveInterval: 5,
      isActive: true
    };
    this.showDialog = true;
  }

  openEditDialog(setting: PrioritySetting): void {
    this.isEditMode = true;
    this.selectedSetting = setting;
    this.formData = { ...setting };
    this.showDialog = true;
  }

  onStrategyChange(event: any): void {
    // Force update to ensure *ngIf condition works
    this.formData.strategy = event.value;
    // Trigger change detection
    this.isInterleavedStrategy();
  }

  isInterleavedStrategy(): boolean {
    return this.formData.strategy === PriorityStrategy.Interleaved;
  }

  saveSettings(): void {
    if (!this.validateForm()) return;

    this.isLoading = true;
    const payload: any = {
      serviceId: this.formData.serviceId ?? null,
      roomId: this.formData.roomId ?? null,
      strategy: this.formData.strategy,
      interleaveInterval: this.formData.interleaveInterval,
      isActive: this.formData.isActive
    };

    if (this.isEditMode && this.selectedSetting) {
      this.apiService.updatePrioritySetting(this.selectedSetting.prioritySettingId, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cấu hình ưu tiên đã được cập nhật'
          });
          this.loadPrioritySettings();
          this.showDialog = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating setting:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể cập nhật cấu hình ưu tiên'
          });
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.createPrioritySetting(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cấu hình ưu tiên đã được tạo'
          });
          this.loadPrioritySettings();
          this.showDialog = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating setting:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tạo cấu hình ưu tiên'
          });
          this.isLoading = false;
        }
      });
    }
  }

  deleteSetting(setting: PrioritySetting): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn xóa cấu hình ưu tiên này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deletePrioritySetting(setting.prioritySettingId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Cấu hình ưu tiên đã được xóa'
            });
            this.loadPrioritySettings();
          },
          error: (err) => {
            console.error('Error deleting setting:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể xóa cấu hình ưu tiên'
            });
          }
        });
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.strategy) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng chọn chiến lược ưu tiên'
      });
      return false;
    }

    if (this.formData.strategy === PriorityStrategy.Interleaved && (this.formData.interleaveInterval || 0) <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Khoảng cách xen kẽ phải lớn hơn 0'
      });
      return false;
    }

    return true;
  }

  getStrategyLabel(strategy: number): string {
    const option = this.strategyOptions.find(o => o.value === strategy);
    return option ? option.label : 'Không xác định';
  }

  getServiceName(serviceId?: number): string {
    if (!serviceId) return 'Toàn bộ dịch vụ';
    const service = this.services.find(s => s.serviceId === serviceId);
    return service ? service.serviceName : 'Không xác định';
  }

  getRoomName(roomId?: number): string {
    if (!roomId) return 'Toàn bộ phòng';
    const room = this.rooms.find(r => r.roomId === roomId);
    return room ? room.roomName : 'Không xác định';
  }
}

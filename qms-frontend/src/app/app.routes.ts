import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
    title: 'Đăng nhập - QMS'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Quản trị - QMS'
  },
  {
    path: 'admin/services',
    loadComponent: () => import('./features/admin/services-management/services-management.component').then(m => m.ServicesManagementComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Quản lý Dịch vụ - QMS'
  },
  {
    path: 'admin/rooms',
    loadComponent: () => import('./features/admin/rooms-management/rooms-management.component').then(m => m.RoomsManagementComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Quản lý Phòng - QMS'
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users-management/users-management.component').then(m => m.UsersManagementComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Quản lý Người dùng - QMS'
  },
  {
    path: 'admin/printers',
    loadComponent: () => import('./features/admin/printers-management/printers-management.component').then(m => m.PrintersManagementComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Quản lý Máy in - QMS'
  },
  {
    path: 'admin/print-history',
    loadComponent: () => import('./features/admin/print-history/print-history.component').then(m => m.PrintHistoryComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin, UserRole.TicketIssuer] },
    title: 'Lịch sử In ấn - QMS'
  },
  {
    path: 'admin/working-sessions',
    loadComponent: () => import('./features/admin/working-sessions-management/working-sessions-management.component').then(m => m.WorkingSessionsManagementComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Cấu hình Thời gian - QMS'
  },
  {
    path: 'admin/tv-profiles',
    loadComponent: () => import('./features/admin/tv-profiles-management/tv-profiles-management.component').then(m => m.TVProfilesManagementComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Cấu hình TV - QMS'
  },
  {
    path: 'admin/priority-settings',
    loadComponent: () => import('./features/admin/priority-settings-management/priority-settings-management.component').then(m => m.PrioritySettingsManagementComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Cấu hình Ưu Tiên - QMS'
  },
  {
    path: 'admin/statistics',
    loadComponent: () => import('./features/admin/statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin] },
    title: 'Thống kê Báo cáo - QMS'
  },
  {
    path: 'kiosk',
    loadComponent: () => import('./features/kiosk/kiosk.component').then(m => m.KioskComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin, UserRole.Kiosk] },
    title: 'Lấy số - QMS'
  },
  {
    path: 'kiosk/direct-assignment',
    loadComponent: () => import('./features/kiosk/direct-assignment/direct-assignment.component').then(m => m.DirectAssignmentComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin, UserRole.Kiosk] },
    title: 'Chỉ định phòng - QMS'
  },
  {
    path: 'kiosk/queue-status',
    loadComponent: () => import('./features/kiosk/queue-status/queue-status.component').then(m => m.QueueStatusComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin, UserRole.Kiosk] },
    title: 'Chi tiết hàng chờ - QMS'
  },
  {
    path: 'ticket-issuer',
    loadComponent: () => import('./features/ticket-issuer/ticket-issuer.component').then(m => m.TicketIssuerComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin, UserRole.TicketIssuer] },
    title: 'Cấp số - QMS'
  },
  {
    path: 'calling-desk',
    loadComponent: () => import('./features/calling-desk/calling-desk.component').then(m => m.CallingDeskComponent),
    canActivate: [authGuard],
    data: { roles: [UserRole.Admin, UserRole.Doctor] },
    title: 'Quầy gọi số - QMS'
  },
  {
    path: 'tv-display',
    loadComponent: () => import('./features/tv-display/tv-display.component').then(m => m.TVDisplayComponent),
    title: 'Màn hình hiển thị - QMS'
  },
  {
    path: 'tv-display/:id',
    loadComponent: () => import('./features/tv-display/tv-display.component').then(m => m.TVDisplayComponent),
    title: 'Màn hình hiển thị - QMS'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

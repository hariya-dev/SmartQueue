import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Service,
  Room,
  Ticket,
  IssueTicketRequest,
  IssueTicketResponse,
  CallNextResponse,
  CallingDeskRequest,
  CurrentTicket,
  CallingDeskState,
  QueueStatus,
  RoomQueue,
  RoomQueueDetail,
  TVDisplay,
  Kiosk,
  Printer,
  TicketStatusDto,
  WorkingSession,
  DashboardStats,
  StatisticsDto,
  StatisticsQueryRequest,
  HourlyStatisticsDto,
  ServiceQueueDetail,
  PrintHistory,
  PrintHistoryQuery,
  PrioritySetting
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Services
  getServices(activeOnly = true): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`, {
      params: { activeOnly: activeOnly.toString() }
    });
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/services/${id}`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}/services`, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/services/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}`);
  }

  // Rooms
  getRooms(serviceId?: number): Observable<Room[]> {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId.toString();
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`, { params });
  }

  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/rooms/${id}`);
  }

  createRoom(room: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/rooms`, room);
  }

  updateRoom(id: number, room: Partial<Room>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/rooms/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rooms/${id}`);
  }

  // Tickets
  issueTicket(request: IssueTicketRequest): Observable<IssueTicketResponse> {
    return this.http.post<IssueTicketResponse>(`${this.baseUrl}/tickets/issue`, request);
  }

  getTicket(ticketNumber: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/tickets/${ticketNumber}`);
  }

  getTicketStatus(ticketNumber: string): Observable<TicketStatusDto> {
    return this.http.get<TicketStatusDto>(`${this.baseUrl}/tickets/${ticketNumber}/status`);
  }

  getQueueDetails(): Observable<ServiceQueueDetail[]> {
    return this.http.get<ServiceQueueDetail[]>(`${this.baseUrl}/tickets/queue-details`);
  }

  getTicketsByRoom(roomId: number, status?: number): Observable<Ticket[]> {
    const params: any = {};
    if (status !== undefined) params.status = status.toString();
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets/room/${roomId}`, { params });
  }

  // Calling Desk
  callNext(request: CallingDeskRequest): Observable<CallNextResponse> {
    return this.http.post<CallNextResponse>(`${this.baseUrl}/calling-desk/next`, request);
  }

  recall(request: CallingDeskRequest): Observable<CallNextResponse> {
    return this.http.post<CallNextResponse>(`${this.baseUrl}/calling-desk/recall`, request);
  }

  passTicket(ticketId: number, roomId: number, reason?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/calling-desk/pass`, { ticketId, roomId, reason });
  }

  doneTicket(ticketId: number, roomId: number, postProcessBranchId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/calling-desk/done`, { ticketId, roomId, postProcessBranchId });
  }

  returnToQueue(ticketId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/calling-desk/return-to-queue/${ticketId}`, {});
  }

  transferTicket(ticketId: number, targetServiceId?: number, targetRoomId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/calling-desk/transfer`, { ticketId, targetServiceId, targetRoomId });
  }

  togglePriority(ticketId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/calling-desk/toggle-priority/${ticketId}`, {});
  }

  getCurrentTicket(roomId: number): Observable<CurrentTicket> {
    return this.http.get<CurrentTicket>(`${this.baseUrl}/calling-desk/current/${roomId}`);
  }

  getCallingDeskState(roomId: number): Observable<CallingDeskState> {
    return this.http.get<CallingDeskState>(`${this.baseUrl}/calling-desk/state/${roomId}`);
  }

  getQueue(roomId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/calling-desk/queue/${roomId}`);
  }

  // Queue
  getQueueStatus(roomId: number): Observable<QueueStatus> {
    return this.http.get<QueueStatus>(`${this.baseUrl}/queue/status/${roomId}`);
  }

  getRoomQueues(serviceId?: number): Observable<RoomQueue[]> {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId.toString();
    return this.http.get<RoomQueue[]>(`${this.baseUrl}/queue/rooms`, { params });
  }

  getDetailedRoomQueues(serviceId?: number): Observable<RoomQueueDetail[]> {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId.toString();
    return this.http.get<RoomQueueDetail[]>(`${this.baseUrl}/queue/rooms/detailed`, { params });
  }

  getTVDisplay(tvProfileId: number): Observable<TVDisplay> {
    return this.http.get<TVDisplay>(`${this.baseUrl}/queue/tv/${tvProfileId}`);
  }

  // TV Profiles Management
  getTVProfiles(): Observable<TVDisplay[]> {
    return this.http.get<TVDisplay[]>(`${this.baseUrl}/tv-profiles`);
  }

  getTVProfile(id: number): Observable<TVDisplay> {
    return this.http.get<TVDisplay>(`${this.baseUrl}/tv-profiles/${id}`);
  }

  createTVProfile(profile: any): Observable<TVDisplay> {
    return this.http.post<TVDisplay>(`${this.baseUrl}/tv-profiles`, profile);
  }

  updateTVProfile(id: number, profile: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/tv-profiles/${id}`, profile);
  }

  deleteTVProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tv-profiles/${id}`);
  }

  // TV Ads
  uploadAdVideo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/tv-profiles/upload-video`, formData);
  }

  addTVAd(profileId: number, ad: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tv-profiles/${profileId}/ads`, ad);
  }

  deleteTVAd(adId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tv-profiles/ads/${adId}`);
  }

  // Kiosks
  getKiosks(): Observable<Kiosk[]> {
    return this.http.get<Kiosk[]>(`${this.baseUrl}/kiosks`);
  }

  sendHeartbeat(kioskId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/kiosks/${kioskId}/heartbeat`, {});
  }

  // Printers
  getPrinters(areaCode?: string): Observable<Printer[]> {
    const params: any = {};
    if (areaCode) params.areaCode = areaCode;
    return this.http.get<Printer[]>(`${this.baseUrl}/printers`, { params });
  }

  getPrinter(id: number): Observable<Printer> {
    return this.http.get<Printer>(`${this.baseUrl}/printers/${id}`);
  }

  createPrinter(printer: Partial<Printer>): Observable<Printer> {
    return this.http.post<Printer>(`${this.baseUrl}/printers`, printer);
  }

  updatePrinter(id: number, printer: Partial<Printer>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/printers/${id}`, printer);
  }

  deletePrinter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/printers/${id}`);
  }

  checkPrinterHealth(printerId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/printers/${printerId}/health-check`, {});
  }

  // Print History
  getPrintHistory(query: PrintHistoryQuery): Observable<PrintHistory[]> {
    const params: any = {};
    if (query.fromDate) params.fromDate = query.fromDate.toISOString();
    if (query.toDate) params.toDate = query.toDate.toISOString();
    if (query.printerId) params.printerId = query.printerId.toString();
    return this.http.get<PrintHistory[]>(`${this.baseUrl}/PrintHistory`, { params });
  }

  getPrintHistoryById(printHistoryId: number): Observable<PrintHistory> {
    return this.http.get<PrintHistory>(`${this.baseUrl}/PrintHistory/${printHistoryId}`);
  }

  getTodayPrintCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/PrintHistory/today-count`);
  }

  reprintTicket(printHistoryId: number, printerId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/PrintHistory/${printHistoryId}/reprint?printerId=${printerId}`, {});
  }

  // Tauri Native Printing
  printViaTauri(ticketData: any): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/print/tauri-print`, ticketData);
  }

  getTauriPrinters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/print/tauri-printers`);
  }

  // Working Sessions
  getWorkingSessions(): Observable<WorkingSession[]> {
    return this.http.get<WorkingSession[]>(`${this.baseUrl}/workingSessions`);
  }

  createWorkingSession(session: Partial<WorkingSession>): Observable<WorkingSession> {
    return this.http.post<WorkingSession>(`${this.baseUrl}/workingSessions`, session);
  }

  updateWorkingSession(id: number, session: Partial<WorkingSession>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/workingSessions/${id}`, session);
  }

  deleteWorkingSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/workingSessions/${id}`);
  }

  toggleWorkingSession(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/workingSessions/${id}/toggle`, {});
  }

  // Statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/statistics/dashboard`);
  }

  getStatistics(request: StatisticsQueryRequest): Observable<StatisticsDto[]> {
    const params: any = {};
    if (request.startDate) params.startDate = request.startDate;
    if (request.endDate) params.endDate = request.endDate;
    if (request.serviceId) params.serviceId = request.serviceId.toString();
    if (request.roomId) params.roomId = request.roomId.toString();
    if (request.groupBy) params.groupBy = request.groupBy;
    return this.http.get<StatisticsDto[]>(`${this.baseUrl}/statistics`, { params });
  }

  getHourlyStatistics(request: StatisticsQueryRequest): Observable<HourlyStatisticsDto[]> {
    const params: any = {};
    if (request.startDate) params.startDate = request.startDate;
    if (request.endDate) params.endDate = request.endDate;
    if (request.serviceId) params.serviceId = request.serviceId.toString();
    if (request.roomId) params.roomId = request.roomId.toString();
    return this.http.get<HourlyStatisticsDto[]>(`${this.baseUrl}/statistics/hourly`, { params });
  }

  exportStatistics(request: StatisticsQueryRequest): Observable<Blob> {
    const params: any = {};
    if (request.startDate) params.startDate = request.startDate;
    if (request.endDate) params.endDate = request.endDate;
    if (request.serviceId) params.serviceId = request.serviceId.toString();
    if (request.roomId) params.roomId = request.roomId.toString();
    return this.http.get(`${this.baseUrl}/statistics/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Priority Settings
  getPrioritySettings(serviceId?: number): Observable<PrioritySetting[]> {
    const params: any = {};
    if (serviceId) params.serviceId = serviceId.toString();
    return this.http.get<PrioritySetting[]>(`${this.baseUrl}/prioritysettings`, { params });
  }

  getPrioritySetting(id: number): Observable<PrioritySetting> {
    return this.http.get<PrioritySetting>(`${this.baseUrl}/prioritysettings/${id}`);
  }

  createPrioritySetting(setting: Partial<PrioritySetting>): Observable<PrioritySetting> {
    return this.http.post<PrioritySetting>(`${this.baseUrl}/prioritysettings`, setting);
  }

  updatePrioritySetting(id: number, setting: Partial<PrioritySetting>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/prioritysettings/${id}`, setting);
  }

  deletePrioritySetting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/prioritysettings/${id}`);
  }
}

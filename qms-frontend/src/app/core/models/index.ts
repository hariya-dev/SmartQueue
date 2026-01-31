export enum TicketStatus {
  Pending = 0,
  Calling = 1,
  Serving = 2,
  Done = 3,
  Passed = 4,
  Cancelled = 5
}

export enum PriorityType {
  Normal = 0,
  Priority = 1
}

export interface Service {
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  isActive: boolean;
  displayOrder: number;
  roomCount: number;
}

export interface Room {
  roomId: number;
  serviceId: number;
  serviceCode: string;
  roomCode: string;
  roomName: string;
  isActive: boolean;
  maxQueueSize?: number;
  currentQueueSize: number;
}

export interface Ticket {
  ticketId: number;
  ticketNumber: string;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  roomId: number;
  roomCode: string;
  roomName: string;
  priorityType: PriorityType;
  status: TicketStatus;
  issuedAt: Date;
  calledAt?: Date;
  servingAt?: Date;
  completedAt?: Date;
  waitTimeSeconds?: number;
  serviceTimeSeconds?: number;
}

export interface IssueTicketRequest {
  serviceCode: string;
  priorityType: PriorityType;
  kioskId?: number;
  printerId?: number;
  roomId?: number;
}

export interface IssueTicketResponse {
  ticketId: number;
  ticketNumber: string;
  serviceCode: string;
  serviceName: string;
  roomCode: string;
  roomName: string;
  priorityType: PriorityType;
  queuePosition: number;
  estimatedWaitMinutes: number;
  issuedAt: Date;
}

export interface TicketStatusDto {
  ticketId: number;
  ticketNumber: string;
  status: TicketStatus;
  queuePosition: number;
  estimatedWaitMinutes: number;
}

export interface CallingDeskRequest {
  roomId: number;
  userId?: number;
}

export interface CallNextResponse {
  ticketId: number;
  ticketNumber: string;
  serviceCode: string;
  serviceName: string;
  priorityType: PriorityType;
  roomCode: string;
  roomName: string;
  remainingInQueue: number;
}

export interface CurrentTicket {
  ticketId: number;
  ticketNumber: string;
  serviceCode: string;
  serviceName: string;
  priorityType: PriorityType;
  status: TicketStatus;
  calledAt?: Date;
  servingAt?: Date;
}

export interface CallingDeskState {
  currentTicket?: CurrentTicket;
  waitingQueue: Ticket[];
  passedTickets: Ticket[];
  doneTickets: Ticket[];
  totalWaiting: number;
  totalProcessed: number;
  totalPassed: number;
}

export interface QueueStatus {
  roomId: number;
  roomCode: string;
  roomName: string;
  totalPending: number;
  totalPriority: number;
  totalNormal: number;
  avgWaitTimeMinutes: number;
  currentTicket?: Ticket;
  lastUpdated: Date;
}

export enum UserRole {
  Admin = 0,
  Doctor = 1,
  Kiosk = 2,
  TV = 3,
  TicketIssuer = 4
}

export interface User {
  userId: number;
  username: string;
  fullName: string;
  role: UserRole;
  roomId?: number;
  roomCode?: string;
  printerId?: number;
  printerName?: string;
  areaCode?: string;
  isActive: boolean;
}

export interface LoginResponse {
  userId: number;
  username: string;
  fullName: string;
  role: UserRole;
  roomId?: number;
  roomCode?: string;
  printerId?: number;
  printerName?: string;
  areaCode?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface RoomQueue {
  roomId: number;
  roomCode: string;
  roomName: string;
  queueSize: number;
  priorityCount: number;
  normalCount: number;
}

export interface RoomQueueDetail {
  roomId: number;
  roomCode: string;
  roomName: string;
  totalTickets: number;
  pendingCount: number;
  callingCount: number;
  servingCount: number;
  doneCount: number;
  passedCount: number;
  cancelledCount: number;
}

export enum TVAdType {
  Video = 0,
  ExternalLink = 1
}

export interface TVAd {
  tvAdId: number;
  tvProfileId: number;
  adTitle: string;
  url: string;
  adType: TVAdType;
  displayOrder: number;
  durationInSeconds: number;
  isActive: boolean;
}

export interface TVDisplay {
  tvProfileId: number;
  tvCode: string;
  tvName: string;
  displayMode: number;
  isActive: boolean;
  showAd: boolean;
  adVideoUrl?: string;
  adPosition: string;
  columnsPerRow: number;
  rowsCount: number;
  layoutMode: string;
  screenWidth: number;
  screenHeight: number;
  headerSizePercent: number;
  logoUrl?: string;
  timeFormat: string;
  showDate: boolean;
  adSizePercent: number;
  showFooter: boolean;
  footerText?: string;
  footerPosition: string;
  footerSizePercent: number;
  hospitalNameFontSize: number;
  roomNameFontSize: number;
  counterNumberFontSize: number;
  ticketNumberFontSize: number;
  dateTimeFontSize: number;
  footerFontSize: number;
  headerBgColor: string;
  mainBgColor: string;
  footerBgColor: string;
  headerTextColor: string;
  mainTextColor: string;
  footerTextColor: string;
  activeColor: string;
  inactiveColor: string;
  connectionStatusColor: string;
  gridConfigJson?: string;
  rowGap: number;
  columnGap: number;
  roomIds: number[];
  rooms: TVRoomDisplay[];
  advertisements: TVAd[];
}

export interface TVRoomDisplay {
  roomId: number;
  roomCode: string;
  roomName: string;
  currentTicketNumber?: string;
  isBlinking: boolean;
  waitingTickets: string[];
}

export interface TicketCalledEvent {
  ticketId: number;
  ticketNumber: string;
  roomCode: string;
  roomName: string;
  serviceCode: string;
  priorityType: PriorityType;
  action: 'call' | 'recall';
}

export interface QueueUpdatedEvent {
  roomId: number;
  roomCode: string;
  queueSize: number;
  pendingTickets: string[];
}

export interface ServiceQueueDetail {
  serviceId: number;
  serviceName: string;
  serviceCode: string;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
  rooms: QueueSummaryRoom[];
}

export interface QueueSummaryRoom {
  roomId: number;
  roomCode: string;
  roomName: string;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface TicketStatusChangedEvent {
  ticketId: number;
  ticketNumber: string;
  oldStatus: TicketStatus;
  newStatus: TicketStatus;
  roomCode: string;
}

export interface Kiosk {
  kioskId: number;
  kioskCode: string;
  kioskName: string;
  location?: string;
  defaultPrinterId?: number;
  defaultPrinterName?: string;
  isActive: boolean;
  lastHeartbeat?: Date;
}

export interface Printer {
  printerId: number;
  printerCode: string;
  printerName: string;
  printerType?: string;
  connectionType?: string;
  ipAddress?: string;
  location?: string;
  areaCode?: string;
  isActive: boolean;
  status: number;
  lastHealthCheck?: Date;
}

export interface WorkingSession {
  workingSessionId: number;
  sessionName: string;
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
  isActive: boolean;
}

export interface StatisticsDto {
  roomId: number;
  roomCode: string;
  serviceId: number;
  serviceCode: string;
  date: string | Date;
  totalProcessed: number;
  totalPassed: number;
  totalCancelled: number;
  avgWaitTimeSeconds: number;
  avgServiceTimeSeconds: number;
  maxQueueSize: number;
}

export interface HourlyStatisticsDto {
  hour: number;
  totalTickets: number;
  totalProcessed: number;
  totalPassed: number;
  totalCancelled: number;
}

export interface DashboardStats {
  totalServicesActive: number;
  totalRoomsActive: number;
  totalTicketsToday: number;
  totalProcessedToday: number;
  totalWaitingNow: number;
  avgWaitTimeMinutes: number;
  roomStats: RoomStats[];
}

export interface RoomStats {
  roomId: number;
  roomCode: string;
  serviceCode: string;
  currentQueueSize: number;
  processedToday: number;
  avgWaitTimeMinutes: number;
  hasActiveTicket: boolean;
}

export interface StatisticsQueryRequest {
  startDate?: string;
  endDate?: string;
  serviceId?: number;
  roomId?: number;
  groupBy?: string;
}

export enum PrintType {
  Manual = 0,
  Auto = 1,
  Reprint = 2
}

export enum PrintStatus {
  Success = 0,
  Failed = 1,
  Pending = 2
}

export interface PrintHistory {
  printHistoryId: number;
  ticketId: number;
  ticketNumber: string;
  printerId?: number;
  printerName?: string;
  printerIp?: string;
  printType: string;
  printStatus: string;
  errorMessage?: string;
  printedAt: Date;
  printedByUserId?: number;
  printedByUserName?: string;
}

export interface PrintHistoryQuery {
  fromDate?: Date;
  toDate?: Date;
  printerId?: number;
}

export interface PrinterSettings {
  autoPrintOnRemoteTicket: boolean;
  autoPrintOnLocalTicket: boolean;
  autoMinimizeOnCallNext: boolean;
  defaultPrinterId?: number;
  soundEnabled: boolean;
  notificationDuration: number;
}

export enum PriorityStrategy {
  Strict = 0,
  Weighted = 1,
  TimeSlice = 2,
  Interleaved = 3
}

export interface PrioritySetting {
  prioritySettingId: number;
  serviceId?: number;
  roomId?: number;
  strategy: PriorityStrategy;
  weightedRatio: number;
  timeSliceMinutes: number;
  interleaveInterval: number;
  isActive: boolean;
  service?: Service;
  room?: Room;
}

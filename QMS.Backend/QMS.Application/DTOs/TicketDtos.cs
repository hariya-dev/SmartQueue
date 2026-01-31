using QMS.Core.Enums;

namespace QMS.Application.DTOs;

public record PrintHistoryDto(
    long PrintHistoryId,
    long TicketId,
    string TicketNumber,
    int? PrinterId,
    string? PrinterName,
    string? PrinterIp,
    string PrintType,
    string PrintStatus,
    string? ErrorMessage,
    DateTime PrintedAt,
    int? PrintedByUserId,
    string? PrintedByUserName
);

public record IssueTicketRequest(
    string ServiceCode,
    PriorityType PriorityType,
    int? KioskId,
    int? PrinterId,
    int? RoomId = null
);

public record IssueTicketResponse(
    long TicketId,
    string TicketNumber,
    string ServiceCode,
    string ServiceName,
    string RoomCode,
    string RoomName,
    PriorityType PriorityType,
    int QueuePosition,
    int EstimatedWaitMinutes,
    DateTime IssuedAt
);

public record TicketDto(
    long TicketId,
    string TicketNumber,
    int ServiceId,
    string ServiceCode,
    string ServiceName,
    int RoomId,
    string RoomCode,
    string RoomName,
    PriorityType PriorityType,
    TicketStatus Status,
    DateTime IssuedAt,
    DateTime? CalledAt,
    DateTime? ServingAt,
    DateTime? CompletedAt,
    int? WaitTimeSeconds,
    int? ServiceTimeSeconds
);

public record TicketStatusDto(
    long TicketId,
    string TicketNumber,
    TicketStatus Status,
    int QueuePosition,
    int EstimatedWaitMinutes
);

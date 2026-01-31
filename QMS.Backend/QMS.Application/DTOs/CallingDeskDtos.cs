using QMS.Core.Enums;

namespace QMS.Application.DTOs;

public record CallingDeskRequest(
    int RoomId,
    int? UserId
);

public record CallNextResponse(
    long TicketId,
    string TicketNumber,
    string ServiceCode,
    string ServiceName,
    PriorityType PriorityType,
    string RoomCode,
    string RoomName,
    int RemainingInQueue
);

public record PassTicketRequest(
    long TicketId,
    int RoomId,
    string? Reason
);

public record DoneTicketRequest(
    long TicketId,
    int RoomId,
    int? PostProcessBranchId
);

public record TransferTicketRequest(
    long TicketId,
    int? TargetServiceId,
    int? TargetRoomId
);

public record CurrentTicketDto(
    long TicketId,
    string TicketNumber,
    string ServiceCode,
    string ServiceName,
    PriorityType PriorityType,
    TicketStatus Status,
    DateTime? CalledAt,
    DateTime? ServingAt
);

public record CallingDeskStateDto(
    CurrentTicketDto? CurrentTicket,
    IEnumerable<TicketDto> WaitingQueue,
    IEnumerable<TicketDto> PassedTickets,
    IEnumerable<TicketDto> DoneTickets,
    int TotalWaiting,
    int TotalProcessed,
    int TotalPassed
);

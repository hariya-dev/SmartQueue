namespace QMS.Application.DTOs;

public record RoomDto(
    int RoomId,
    int ServiceId,
    string ServiceCode,
    string RoomCode,
    string RoomName,
    bool IsActive,
    int? MaxQueueSize,
    int CurrentQueueSize
);

public record CreateRoomRequest(
    int ServiceId,
    string RoomCode,
    string RoomName,
    int? MaxQueueSize
);

public record UpdateRoomRequest(
    string RoomName,
    bool IsActive,
    int? MaxQueueSize
);

public record RoomQueueDto(
    int RoomId,
    string RoomCode,
    string RoomName,
    int QueueSize,
    int PriorityCount,
    int NormalCount
);

public record RoomQueueDetailDto(
    int RoomId,
    string RoomCode,
    string RoomName,
    int TotalTickets,
    int PendingCount,
    int CallingCount,
    int ServingCount,
    int DoneCount,
    int PassedCount,
    int CancelledCount
);

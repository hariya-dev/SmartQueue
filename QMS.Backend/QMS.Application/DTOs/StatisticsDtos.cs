namespace QMS.Application.DTOs;

public record StatisticsDto(
    int RoomId,
    string RoomCode,
    int ServiceId,
    string ServiceCode,
    DateOnly Date,
    int TotalProcessed,
    int TotalPassed,
    int TotalCancelled,
    int AvgWaitTimeSeconds,
    int AvgServiceTimeSeconds,
    int MaxQueueSize
);

public record HourlyStatisticsDto(
    int Hour,
    int TotalTickets,
    int TotalProcessed,
    int TotalPassed,
    int TotalCancelled
);

public record DashboardStatsDto(
    int TotalServicesActive,
    int TotalRoomsActive,
    int TotalTicketsToday,
    int TotalProcessedToday,
    int TotalWaitingNow,
    int AvgWaitTimeMinutes,
    List<RoomStatsDto> RoomStats
);

public record RoomStatsDto(
    int RoomId,
    string RoomCode,
    string ServiceCode,
    int CurrentQueueSize,
    int ProcessedToday,
    int AvgWaitTimeMinutes,
    bool HasActiveTicket
);

public record StatisticsQueryRequest(
    DateOnly? StartDate,
    DateOnly? EndDate,
    int? ServiceId,
    int? RoomId,
    string GroupBy = "day" // "hour" or "day"
);

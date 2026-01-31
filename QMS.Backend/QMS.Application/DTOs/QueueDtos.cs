using QMS.Core.Enums;

namespace QMS.Application.DTOs;

public record QueueStatusDto(
    int RoomId,
    string RoomCode,
    string RoomName,
    int TotalPending,
    int TotalPriority,
    int TotalNormal,
    int AvgWaitTimeMinutes,
    TicketDto? CurrentTicket,
    DateTime LastUpdated
);

public record TVDisplayDto(
    int TVProfileId,
    string TVCode,
    string TVName,
    bool ShowAd,
    string? AdVideoUrl,
    string AdPosition,
    int ColumnsPerRow,
    int RowsCount,
    string LayoutMode,
    int ScreenWidth,
    int ScreenHeight,
    int HeaderSizePercent,
    string? LogoUrl,
    string TimeFormat,
    bool ShowDate,
    int AdSizePercent,
    bool ShowFooter,
    string? FooterText,
    string FooterPosition,
    int FooterSizePercent,
    int HospitalNameFontSize,
    int RoomNameFontSize,
    int CounterNumberFontSize,
    int TicketNumberFontSize,
    int DateTimeFontSize,
    int FooterFontSize,
    string HeaderBgColor,
    string MainBgColor,
    string FooterBgColor,
    string HeaderTextColor,
    string MainTextColor,
    string FooterTextColor,
    string ActiveColor,
    string InactiveColor,
    string ConnectionStatusColor,
    string? GridConfigJson,
    int RowGap,
    int ColumnGap,
    List<TVRoomDisplayDto> Rooms,
    List<TVAdDto> Advertisements
);

public record TVRoomDisplayDto(
    int RoomId,
    string RoomCode,
    string RoomName,
    string? CurrentTicketNumber,
    bool IsBlinking,
    List<string> WaitingTickets
);

public record TicketCalledEvent(
    long TicketId,
    string TicketNumber,
    string RoomCode,
    string RoomName,
    string ServiceCode,
    PriorityType PriorityType,
    string Action // "call", "recall"
);

public record QueueUpdatedEvent(
    int RoomId,
    string RoomCode,
    int QueueSize,
    List<string> PendingTickets
);

public record ServiceQueueDetailDto(
    int ServiceId,
    string ServiceName,
    string ServiceCode,
    int PendingCount,
    int CompletedCount,
    int CancelledCount,
    List<QueueSummaryRoomDto> Rooms
);

public record QueueSummaryRoomDto(
    int RoomId,
    string RoomCode,
    string RoomName,
    int PendingCount,
    int CompletedCount,
    int CancelledCount
);

public record TicketStatusChangedEvent(
    long TicketId,
    string TicketNumber,
    TicketStatus OldStatus,
    TicketStatus NewStatus,
    string RoomCode
);

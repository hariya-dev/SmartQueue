using System;

namespace QMS.Application.DTOs;

public record WorkingSessionDto(
    int WorkingSessionId,
    string SessionName,
    string StartTime, // Format HH:mm
    string EndTime,   // Format HH:mm
    DayOfWeek? DayOfWeek,
    bool IsActive
);

public record CreateWorkingSessionRequest(
    string SessionName,
    string StartTime,
    string EndTime,
    DayOfWeek? DayOfWeek
);

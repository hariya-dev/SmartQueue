using System;

namespace QMS.Core.Entities;

public class WorkingSession : BaseEntity
{
    public int WorkingSessionId { get; set; }
    public string SessionName { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public DayOfWeek? DayOfWeek { get; set; } // Null means all days
    public bool IsActive { get; set; } = true;
}

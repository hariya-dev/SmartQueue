namespace QMS.Core.Entities;

public class QueueStatistic
{
    public long StatId { get; set; }
    public int RoomId { get; set; }
    public int ServiceId { get; set; }
    public DateOnly StatDate { get; set; }
    public int? StatHour { get; set; }
    public int TotalProcessed { get; set; }
    public int TotalPassed { get; set; }
    public int TotalCancelled { get; set; }
    public int AvgWaitTimeSeconds { get; set; }
    public int AvgServiceTimeSeconds { get; set; }
    public int MaxQueueSize { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Room Room { get; set; } = null!;
    public virtual Service Service { get; set; } = null!;
}

using QMS.Core.Enums;

namespace QMS.Core.Entities;

public class Ticket : BaseEntity
{
    public long TicketId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public int RoomId { get; set; }
    public PriorityType PriorityType { get; set; } = PriorityType.Normal;
    public TicketStatus Status { get; set; } = TicketStatus.Pending;
    public int? KioskId { get; set; }
    public int? PrinterId { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateOnly IssuedDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateTime? CalledAt { get; set; }
    public DateTime? ServingAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? WaitTimeSeconds { get; set; }
    public int? ServiceTimeSeconds { get; set; }
    public int? PostProcessBranchId { get; set; }
    public int? CalledByUserId { get; set; }
    
    // Navigation properties
    public virtual Service Service { get; set; } = null!;
    public virtual Room Room { get; set; } = null!;
    public virtual Kiosk? Kiosk { get; set; }
    public virtual Printer? Printer { get; set; }
    public virtual PostProcessBranch? PostProcessBranch { get; set; }
    public virtual User? CalledByUser { get; set; }
}

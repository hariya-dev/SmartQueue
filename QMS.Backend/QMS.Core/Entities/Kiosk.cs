namespace QMS.Core.Entities;

public class Kiosk : BaseEntity
{
    public int KioskId { get; set; }
    public string KioskCode { get; set; } = string.Empty;
    public string KioskName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public int? DefaultPrinterId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastHeartbeat { get; set; }
    
    // Navigation properties
    public virtual Printer? DefaultPrinter { get; set; }
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

using QMS.Core.Enums;

namespace QMS.Core.Entities;

public class Printer : BaseEntity
{
    public int PrinterId { get; set; }
    public string PrinterCode { get; set; } = string.Empty;
    public string PrinterName { get; set; } = string.Empty;
    public string? PrinterType { get; set; }
    public string? ConnectionType { get; set; }
    public string? IpAddress { get; set; }
    public string? Location { get; set; }
    public string? AreaCode { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastHealthCheck { get; set; }
    public PrinterStatus Status { get; set; } = PrinterStatus.Online;
    
    // Navigation properties
    public virtual ICollection<Kiosk> Kiosks { get; set; } = new List<Kiosk>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}

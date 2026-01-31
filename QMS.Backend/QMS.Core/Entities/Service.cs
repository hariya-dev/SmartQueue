namespace QMS.Core.Entities;

public class Service : BaseEntity
{
    public int ServiceId { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    
    // Navigation properties
    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public virtual ICollection<TicketSequence> TicketSequences { get; set; } = new List<TicketSequence>();
    public virtual ICollection<PrioritySetting> PrioritySettings { get; set; } = new List<PrioritySetting>();
}

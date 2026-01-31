namespace QMS.Core.Entities;

public class TicketSequence
{
    public int SequenceId { get; set; }
    public int ServiceId { get; set; }
    public DateOnly SequenceDate { get; set; }
    public int NormalLastNumber { get; set; }
    public int PriorityLastNumber { get; set; }
    
    // Navigation properties
    public virtual Service Service { get; set; } = null!;
}

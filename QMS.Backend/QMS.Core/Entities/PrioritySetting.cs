using QMS.Core.Enums;

namespace QMS.Core.Entities;

public class PrioritySetting : BaseEntity
{
    public int PrioritySettingId { get; set; }
    public int? ServiceId { get; set; }
    public int? RoomId { get; set; }
    public PriorityStrategy Strategy { get; set; } = PriorityStrategy.Strict;
    public int InterleaveInterval { get; set; } = 5; // N normal tickets per 1 priority ticket
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual Service? Service { get; set; }
    public virtual Room? Room { get; set; }
}

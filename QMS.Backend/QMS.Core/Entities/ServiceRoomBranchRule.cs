namespace QMS.Core.Entities;

public class ServiceRoomBranchRule : BaseEntity
{
    public int RuleId { get; set; }
    public int? ServiceId { get; set; }
    public int? RoomId { get; set; }
    public int PostProcessBranchId { get; set; }
    public bool IsDefault { get; set; }
    public int Priority { get; set; }
    
    // Navigation properties
    public virtual Service? Service { get; set; }
    public virtual Room? Room { get; set; }
    public virtual PostProcessBranch PostProcessBranch { get; set; } = null!;
}

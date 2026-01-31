namespace QMS.Core.Entities;

public class PostProcessBranch : BaseEntity
{
    public int PostProcessBranchId { get; set; }
    public string BranchCode { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public virtual ICollection<ServiceRoomBranchRule> BranchRules { get; set; } = new List<ServiceRoomBranchRule>();
}

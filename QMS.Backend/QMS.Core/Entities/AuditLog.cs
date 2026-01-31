namespace QMS.Core.Entities;

public class AuditLog
{
    public long AuditLogId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public long EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public string? Details { get; set; }
    public string? IPAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual User? User { get; set; }
}

using QMS.Core.Enums;

namespace QMS.Core.Entities;

public class User : BaseEntity
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Doctor;
    public int? RoomId { get; set; }
    public int? PrinterId { get; set; }
    public string? AreaCode { get; set; }
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    
    // Navigation properties
    public virtual Room? Room { get; set; }
    public virtual Printer? Printer { get; set; }
    public virtual ICollection<Ticket> CalledTickets { get; set; } = new List<Ticket>();
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}

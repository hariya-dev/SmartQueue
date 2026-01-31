namespace QMS.Core.Entities;

public class Room : BaseEntity
{
    public int RoomId { get; set; }
    public int ServiceId { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public string RoomName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int? MaxQueueSize { get; set; }
    
    // Navigation properties
    public virtual Service Service { get; set; } = null!;
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public virtual ICollection<TVProfileRoom> TVProfileRooms { get; set; } = new List<TVProfileRoom>();
    public virtual ICollection<PrioritySetting> PrioritySettings { get; set; } = new List<PrioritySetting>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}

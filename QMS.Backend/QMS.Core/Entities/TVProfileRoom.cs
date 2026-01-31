namespace QMS.Core.Entities;

public class TVProfileRoom
{
    public int TVProfileRoomId { get; set; }
    public int TVProfileId { get; set; }
    public int RoomId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual TVProfile TVProfile { get; set; } = null!;
    public virtual Room Room { get; set; } = null!;
}

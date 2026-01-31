using System.ComponentModel.DataAnnotations;

namespace QMS.Core.Entities;

public enum TVAdType
{
    Video = 0,
    ExternalLink = 1
}

public class TVAd : BaseEntity
{
    [Key]
    public int TVAdId { get; set; }
    
    public int TVProfileId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string AdTitle { get; set; } = string.Empty;
    
    [Required]
    public string Url { get; set; } = string.Empty;
    
    public TVAdType AdType { get; set; } = TVAdType.Video;
    
    public int DisplayOrder { get; set; } = 0;
    
    public int DurationInSeconds { get; set; } = 30; // Useful for links or static content
    
    public bool IsActive { get; set; } = true;
    
    // Navigation property
    public virtual TVProfile? TVProfile { get; set; }
}

using QMS.Core.Enums;

namespace QMS.Core.Entities;

public class TVProfile : BaseEntity
{
    public int TVProfileId { get; set; }
    public string TVCode { get; set; } = string.Empty;
    public string TVName { get; set; } = string.Empty;
    public TVDisplayMode DisplayMode { get; set; } = TVDisplayMode.Specific;
    public bool IsActive { get; set; } = true;
    
    // Advertisement settings
    public bool ShowAd { get; set; } = false;
    public string? AdVideoUrl { get; set; } // Embedded link (YouTube etc)
    public string AdPosition { get; set; } = "Bottom"; // Top, Bottom, Right, Left
    
    // Advanced Layout settings
    public int ColumnsPerRow { get; set; } = 3;
    public int RowsCount { get; set; } = 2;
    public string LayoutMode { get; set; } = "Grid"; // Grid, Horizontal
    public int ScreenWidth { get; set; } = 1920;
    public int ScreenHeight { get; set; } = 1080;
    public int HeaderSizePercent { get; set; } = 10;
    public string? LogoUrl { get; set; }
    public string TimeFormat { get; set; } = "HH:mm:ss"; // HH:mm:ss or HH:mm
    public bool ShowDate { get; set; } = true;
    public int AdSizePercent { get; set; } = 30; // Percentage of screen the ad takes
    
    // Footer settings
    public bool ShowFooter { get; set; } = true;
    public string? FooterText { get; set; }
    public string FooterPosition { get; set; } = "Bottom"; // Top, Bottom, Left, Right
    public int FooterSizePercent { get; set; } = 10;
    
    // Font Size Customization (px)
    public int HospitalNameFontSize { get; set; } = 36;
    public int RoomNameFontSize { get; set; } = 32;
    public int CounterNumberFontSize { get; set; } = 28;
    public int TicketNumberFontSize { get; set; } = 48;
    public int DateTimeFontSize { get; set; } = 24;
    public int FooterFontSize { get; set; } = 20;

    // Color Customization (Hex)
    public string HeaderBgColor { get; set; } = "#0054a6";
    public string MainBgColor { get; set; } = "#ffffff";
    public string FooterBgColor { get; set; } = "#f8f9fa";
    public string HeaderTextColor { get; set; } = "#ffffff";
    public string MainTextColor { get; set; } = "#333333";
    public string FooterTextColor { get; set; } = "#333333";
    public string ActiveColor { get; set; } = "#22c55e";
    public string InactiveColor { get; set; } = "#ef4444";
    public string ConnectionStatusColor { get; set; } = "#22c55e";
    
    public string? GridConfigJson { get; set; } // Detailed JSON for custom positions
    
    public int RowGap { get; set; } = 20; // px
    public int ColumnGap { get; set; } = 20; // px
    
    // Navigation properties
    public virtual ICollection<TVProfileRoom> TVProfileRooms { get; set; } = new List<TVProfileRoom>();
    public virtual ICollection<TVAd> Advertisements { get; set; } = new List<TVAd>();
}

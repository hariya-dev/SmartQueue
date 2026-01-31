using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QMS.API.Services;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Infrastructure.Data;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/tv-profiles")]
public class TVProfilesController : ControllerBase
{
    private readonly QMSDbContext _context;
    private readonly INotificationService _notificationService;

    public TVProfilesController(QMSDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TVProfileDto>>> GetTVProfiles()
    {
        var profiles = await _context.TVProfiles
            .Include(t => t.TVProfileRooms)
            .Include(t => t.Advertisements)
            .Select(t => new TVProfileDto(
                t.TVProfileId,
                t.TVCode,
                t.TVName,
                t.DisplayMode,
                t.IsActive,
                t.ShowAd,
                t.AdVideoUrl,
                t.AdPosition,
                t.ColumnsPerRow,
                t.RowsCount,
                t.LayoutMode,
                t.ScreenWidth,
                t.ScreenHeight,
                t.HeaderSizePercent,
                t.LogoUrl,
                t.TimeFormat,
                t.ShowDate,
                t.AdSizePercent,
                t.ShowFooter,
                t.FooterText,
                t.FooterPosition,
                t.FooterSizePercent,
                t.HospitalNameFontSize,
                t.RoomNameFontSize,
                t.CounterNumberFontSize,
                t.TicketNumberFontSize,
                t.DateTimeFontSize,
                t.FooterFontSize,
                t.HeaderBgColor,
                t.MainBgColor,
                t.FooterBgColor,
                t.HeaderTextColor,
                t.MainTextColor,
                t.FooterTextColor,
                t.ActiveColor,
                t.InactiveColor,
                t.ConnectionStatusColor,
                t.GridConfigJson,
                t.RowGap,
                t.ColumnGap,
                t.TVProfileRooms.Select(r => r.RoomId).ToList(),
                t.Advertisements.OrderBy(a => a.DisplayOrder).Select(a => new TVAdDto(
                    a.TVAdId, a.TVProfileId, a.AdTitle, a.Url, a.AdType, a.DisplayOrder, a.DurationInSeconds, a.IsActive
                )).ToList()
            ))
            .ToListAsync();

        return Ok(profiles);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<TVProfileDto>> GetTVProfile(int id)
    {
        var profile = await _context.TVProfiles
            .Include(t => t.TVProfileRooms)
            .Include(t => t.Advertisements)
            .Where(t => t.TVProfileId == id)
            .Select(t => new TVProfileDto(
                t.TVProfileId,
                t.TVCode,
                t.TVName,
                t.DisplayMode,
                t.IsActive,
                t.ShowAd,
                t.AdVideoUrl,
                t.AdPosition,
                t.ColumnsPerRow,
                t.RowsCount,
                t.LayoutMode,
                t.ScreenWidth,
                t.ScreenHeight,
                t.HeaderSizePercent,
                t.LogoUrl,
                t.TimeFormat,
                t.ShowDate,
                t.AdSizePercent,
                t.ShowFooter,
                t.FooterText,
                t.FooterPosition,
                t.FooterSizePercent,
                t.HospitalNameFontSize,
                t.RoomNameFontSize,
                t.CounterNumberFontSize,
                t.TicketNumberFontSize,
                t.DateTimeFontSize,
                t.FooterFontSize,
                t.HeaderBgColor,
                t.MainBgColor,
                t.FooterBgColor,
                t.HeaderTextColor,
                t.MainTextColor,
                t.FooterTextColor,
                t.ActiveColor,
                t.InactiveColor,
                t.ConnectionStatusColor,
                t.GridConfigJson,
                t.RowGap,
                t.ColumnGap,
                t.TVProfileRooms.Select(r => r.RoomId).ToList(),
                t.Advertisements.OrderBy(a => a.DisplayOrder).Select(a => new TVAdDto(
                    a.TVAdId, a.TVProfileId, a.AdTitle, a.Url, a.AdType, a.DisplayOrder, a.DurationInSeconds, a.IsActive
                )).ToList()
            ))
            .FirstOrDefaultAsync();

        if (profile == null)
            return NotFound(new { error = $"TV Profile not found: {id}" });

        return Ok(profile);
    }

    [HttpPost]
    public async Task<ActionResult<TVProfileDto>> CreateTVProfile([FromBody] CreateTVProfileRequest request)
    {
        if (await _context.TVProfiles.AnyAsync(t => t.TVCode == request.TVCode))
            return BadRequest(new { error = $"TV code already exists: {request.TVCode}" });

        var profile = new TVProfile
        {
            TVCode = request.TVCode,
            TVName = request.TVName,
            DisplayMode = request.DisplayMode,
            IsActive = true,
            ShowAd = request.ShowAd,
            AdVideoUrl = request.AdVideoUrl,
            AdPosition = request.AdPosition,
            ColumnsPerRow = request.ColumnsPerRow,
            RowsCount = request.RowsCount,
            LayoutMode = request.LayoutMode,
            ScreenWidth = request.ScreenWidth,
            ScreenHeight = request.ScreenHeight,
            HeaderSizePercent = request.HeaderSizePercent,
            LogoUrl = request.LogoUrl,
            TimeFormat = request.TimeFormat,
            ShowDate = request.ShowDate,
            AdSizePercent = request.AdSizePercent,
            ShowFooter = request.ShowFooter,
            FooterText = request.FooterText,
            FooterPosition = request.FooterPosition,
            FooterSizePercent = request.FooterSizePercent,
            HospitalNameFontSize = request.HospitalNameFontSize,
            RoomNameFontSize = request.RoomNameFontSize,
            CounterNumberFontSize = request.CounterNumberFontSize,
            TicketNumberFontSize = request.TicketNumberFontSize,
            DateTimeFontSize = request.DateTimeFontSize,
            FooterFontSize = request.FooterFontSize,
            HeaderBgColor = request.HeaderBgColor,
            MainBgColor = request.MainBgColor,
            FooterBgColor = request.FooterBgColor,
            HeaderTextColor = request.HeaderTextColor,
            MainTextColor = request.MainTextColor,
            FooterTextColor = request.FooterTextColor,
            ActiveColor = request.ActiveColor,
            InactiveColor = request.InactiveColor,
            ConnectionStatusColor = request.ConnectionStatusColor,
            GridConfigJson = request.GridConfigJson,
            RowGap = request.RowGap,
            ColumnGap = request.ColumnGap
        };

        if (request.DisplayMode == TVDisplayMode.Specific && request.RoomIds.Any())
        {
            foreach (var roomId in request.RoomIds)
            {
                profile.TVProfileRooms.Add(new TVProfileRoom
                {
                    RoomId = roomId
                });
            }
        }

        _context.TVProfiles.Add(profile);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTVProfile), new { id = profile.TVProfileId }, await GetTVProfileResponse(profile.TVProfileId));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateTVProfile(int id, [FromBody] UpdateTVProfileRequest request)
    {
        var profile = await _context.TVProfiles
            .Include(t => t.TVProfileRooms)
            .FirstOrDefaultAsync(t => t.TVProfileId == id);

        if (profile == null)
            return NotFound(new { error = $"TV Profile not found: {id}" });

        profile.TVName = request.TVName;
        profile.DisplayMode = request.DisplayMode;
        profile.IsActive = request.IsActive;
        profile.ShowAd = request.ShowAd;
        profile.AdVideoUrl = request.AdVideoUrl;
        profile.AdPosition = request.AdPosition;
        profile.ColumnsPerRow = request.ColumnsPerRow;
        profile.RowsCount = request.RowsCount;
        profile.LayoutMode = request.LayoutMode;
        profile.ScreenWidth = request.ScreenWidth;
        profile.ScreenHeight = request.ScreenHeight;
        profile.HeaderSizePercent = request.HeaderSizePercent;
        profile.LogoUrl = request.LogoUrl;
        profile.TimeFormat = request.TimeFormat;
        profile.ShowDate = request.ShowDate;
        profile.AdSizePercent = request.AdSizePercent;
        profile.ShowFooter = request.ShowFooter;
        profile.FooterText = request.FooterText;
        profile.FooterPosition = request.FooterPosition;
        profile.FooterSizePercent = request.FooterSizePercent;
        profile.HospitalNameFontSize = request.HospitalNameFontSize;
        profile.RoomNameFontSize = request.RoomNameFontSize;
        profile.CounterNumberFontSize = request.CounterNumberFontSize;
        profile.TicketNumberFontSize = request.TicketNumberFontSize;
        profile.DateTimeFontSize = request.DateTimeFontSize;
        profile.FooterFontSize = request.FooterFontSize;
        profile.HeaderBgColor = request.HeaderBgColor;
        profile.MainBgColor = request.MainBgColor;
        profile.FooterBgColor = request.FooterBgColor;
        profile.HeaderTextColor = request.HeaderTextColor;
        profile.MainTextColor = request.MainTextColor;
        profile.FooterTextColor = request.FooterTextColor;
        profile.ActiveColor = request.ActiveColor;
        profile.InactiveColor = request.InactiveColor;
        profile.ConnectionStatusColor = request.ConnectionStatusColor;
        profile.GridConfigJson = request.GridConfigJson;
        profile.RowGap = request.RowGap;
        profile.ColumnGap = request.ColumnGap;

        _context.TVProfileRooms.RemoveRange(profile.TVProfileRooms);

        if (request.DisplayMode == TVDisplayMode.Specific && request.RoomIds.Any())
        {
            foreach (var roomId in request.RoomIds)
            {
                profile.TVProfileRooms.Add(new TVProfileRoom
                {
                    TVProfileId = id,
                    RoomId = roomId
                });
            }
        }

        await _context.SaveChangesAsync();
        await _notificationService.NotifyTVProfileUpdatedAsync(id);

        return NoContent();
    }

    private async Task<TVProfileDto?> GetTVProfileResponse(int id)
    {
        return await _context.TVProfiles
            .Include(t => t.TVProfileRooms)
            .Include(t => t.Advertisements)
            .Where(t => t.TVProfileId == id)
            .Select(t => new TVProfileDto(
                t.TVProfileId,
                t.TVCode,
                t.TVName,
                t.DisplayMode,
                t.IsActive,
                t.ShowAd,
                t.AdVideoUrl,
                t.AdPosition,
                t.ColumnsPerRow,
                t.RowsCount,
                t.LayoutMode,
                t.ScreenWidth,
                t.ScreenHeight,
                t.HeaderSizePercent,
                t.LogoUrl,
                t.TimeFormat,
                t.ShowDate,
                t.AdSizePercent,
                t.ShowFooter,
                t.FooterText,
                t.FooterPosition,
                t.FooterSizePercent,
                t.HospitalNameFontSize,
                t.RoomNameFontSize,
                t.CounterNumberFontSize,
                t.TicketNumberFontSize,
                t.DateTimeFontSize,
                t.FooterFontSize,
                t.HeaderBgColor,
                t.MainBgColor,
                t.FooterBgColor,
                t.HeaderTextColor,
                t.MainTextColor,
                t.FooterTextColor,
                t.ActiveColor,
                t.InactiveColor,
                t.ConnectionStatusColor,
                t.GridConfigJson,
                t.RowGap,
                t.ColumnGap,
                t.TVProfileRooms.Select(r => r.RoomId).ToList(),
                t.Advertisements.OrderBy(a => a.DisplayOrder).Select(a => new TVAdDto(
                    a.TVAdId, a.TVProfileId, a.AdTitle, a.Url, a.AdType, a.DisplayOrder, a.DurationInSeconds, a.IsActive
                )).ToList()
            ))
            .FirstOrDefaultAsync();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTVProfile(int id)
    {
        var profile = await _context.TVProfiles.FindAsync(id);
        if (profile == null)
            return NotFound(new { error = $"TV Profile not found: {id}" });

        _context.TVProfiles.Remove(profile);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/ads")]
    public async Task<ActionResult<TVAdDto>> AddAd(int id, [FromBody] CreateTVAdRequest request)
    {
        var profile = await _context.TVProfiles.FindAsync(id);
        if (profile == null) return NotFound(new { error = "TV Profile not found" });

        var ad = new TVAd
        {
            TVProfileId = id,
            AdTitle = request.AdTitle,
            Url = request.Url,
            AdType = request.AdType,
            DisplayOrder = request.DisplayOrder,
            DurationInSeconds = request.DurationInSeconds,
            IsActive = true
        };

        _context.TVAds.Add(ad);
        await _context.SaveChangesAsync();

        return Ok(new TVAdDto(ad.TVAdId, ad.TVProfileId, ad.AdTitle, ad.Url, ad.AdType, ad.DisplayOrder, ad.DurationInSeconds, ad.IsActive));
    }

    [HttpDelete("ads/{adId}")]
    public async Task<ActionResult> DeleteAd(int adId)
    {
        var ad = await _context.TVAds.FindAsync(adId);
        if (ad == null) return NotFound();

        // If it's a local video, we might want to delete the file, but for now let's just remove the record
        _context.TVAds.Remove(ad);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("upload-video")]
    public async Task<ActionResult<string>> UploadVideo(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/videos/{fileName}";
        return Ok(new { url = relativePath });
    }
}

public record CreateTVAdRequest(string AdTitle, string Url, TVAdType AdType, int DisplayOrder, int DurationInSeconds);
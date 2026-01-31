using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Infrastructure.Data;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class PrioritySettingsController : ControllerBase
{
    private readonly QMSDbContext _context;

    public PrioritySettingsController(QMSDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PrioritySettingDto>>> GetPrioritySettings([FromQuery] int? serviceId)
    {
        var query = _context.PrioritySettings.AsQueryable();

        if (serviceId.HasValue)
            query = query.Where(p => p.ServiceId == serviceId.Value);

        var settings = await query
            .Include(p => p.Service)
            .Include(p => p.Room)
            .OrderBy(p => p.ServiceId == null)
            .ThenBy(p => p.RoomId == null)
            .ThenBy(p => p.PrioritySettingId)
            .ToListAsync();

        return Ok(settings.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PrioritySettingDto>> GetPrioritySetting(int id)
    {
        var setting = await _context.PrioritySettings
            .Include(p => p.Service)
            .Include(p => p.Room)
            .FirstOrDefaultAsync(p => p.PrioritySettingId == id);

        if (setting == null)
            return NotFound(new { error = $"Priority setting not found: {id}" });

        return Ok(MapToDto(setting));
    }

    [HttpPost]
    public async Task<ActionResult<PrioritySettingDto>> CreatePrioritySetting([FromBody] PrioritySettingDto dto)
    {
        var entity = new PrioritySetting
        {
            ServiceId = dto.ServiceId,
            RoomId = dto.RoomId,
            Strategy = (PriorityStrategy)dto.Strategy,
            InterleaveInterval = dto.InterleaveInterval,
            IsActive = dto.IsActive
        };

        _context.PrioritySettings.Add(entity);
        await _context.SaveChangesAsync();

        var result = await _context.PrioritySettings
            .Include(p => p.Service)
            .Include(p => p.Room)
            .FirstAsync(p => p.PrioritySettingId == entity.PrioritySettingId);

        return CreatedAtAction(nameof(GetPrioritySetting), new { id = entity.PrioritySettingId }, MapToDto(result));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PrioritySettingDto>> UpdatePrioritySetting(int id, [FromBody] PrioritySettingDto dto)
    {
        var setting = await _context.PrioritySettings.FindAsync(id);
        if (setting == null)
            return NotFound(new { error = $"Priority setting not found: {id}" });

        setting.ServiceId = dto.ServiceId;
        setting.RoomId = dto.RoomId;
        setting.Strategy = (PriorityStrategy)dto.Strategy;
        setting.InterleaveInterval = dto.InterleaveInterval;
        setting.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        var result = await _context.PrioritySettings
            .Include(p => p.Service)
            .Include(p => p.Room)
            .FirstAsync(p => p.PrioritySettingId == setting.PrioritySettingId);

        return Ok(MapToDto(result));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePrioritySetting(int id)
    {
        var setting = await _context.PrioritySettings.FindAsync(id);
        if (setting == null)
            return NotFound(new { error = $"Priority setting not found: {id}" });

        _context.PrioritySettings.Remove(setting);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static PrioritySettingDto MapToDto(PrioritySetting entity)
    {
        return new PrioritySettingDto(
            entity.PrioritySettingId,
            entity.ServiceId,
            entity.RoomId,
            (int)entity.Strategy,
            entity.InterleaveInterval,
            entity.IsActive,
            entity.Service?.ServiceName,
            entity.Room?.RoomName
        );
    }
}

public record PrioritySettingDto(
    int PrioritySettingId,
    int? ServiceId,
    int? RoomId,
    int Strategy,
    int InterleaveInterval,
    bool IsActive,
    string? ServiceName,
    string? RoomName
);

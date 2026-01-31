using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Core.Entities;
using QMS.Infrastructure.Data;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class WorkingSessionsController : ControllerBase
{
    private readonly QMSDbContext _context;

    public WorkingSessionsController(QMSDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkingSessionDto>>> GetWorkingSessions()
    {
        var sessions = await _context.WorkingSessions
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .Select(s => new WorkingSessionDto(
                s.WorkingSessionId,
                s.SessionName,
                s.StartTime.ToString(@"hh\:mm"),
                s.EndTime.ToString(@"hh\:mm"),
                s.DayOfWeek,
                s.IsActive
            ))
            .ToListAsync();

        return Ok(sessions);
    }

    [HttpPost]
    public async Task<ActionResult<WorkingSessionDto>> CreateWorkingSession([FromBody] CreateWorkingSessionRequest request)
    {
        if (!TimeSpan.TryParse(request.StartTime, out var startTime) || !TimeSpan.TryParse(request.EndTime, out var endTime))
        {
            return BadRequest(new { error = "Invalid time format. Use HH:mm" });
        }

        var session = new WorkingSession
        {
            SessionName = request.SessionName,
            StartTime = startTime,
            EndTime = endTime,
            DayOfWeek = request.DayOfWeek,
            IsActive = true
        };

        _context.WorkingSessions.Add(session);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWorkingSessions), null, new WorkingSessionDto(
            session.WorkingSessionId,
            session.SessionName,
            session.StartTime.ToString(@"hh\:mm"),
            session.EndTime.ToString(@"hh\:mm"),
            session.DayOfWeek,
            session.IsActive
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkingSession(int id, [FromBody] CreateWorkingSessionRequest request)
    {
        var session = await _context.WorkingSessions.FindAsync(id);
        if (session == null) return NotFound();

        if (!TimeSpan.TryParse(request.StartTime, out var startTime) || !TimeSpan.TryParse(request.EndTime, out var endTime))
        {
            return BadRequest(new { error = "Invalid time format. Use HH:mm" });
        }

        session.SessionName = request.SessionName;
        session.StartTime = startTime;
        session.EndTime = endTime;
        session.DayOfWeek = request.DayOfWeek;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkingSession(int id)
    {
        var session = await _context.WorkingSessions.FindAsync(id);
        if (session == null) return NotFound();

        _context.WorkingSessions.Remove(session);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> ToggleSession(int id)
    {
        var session = await _context.WorkingSessions.FindAsync(id);
        if (session == null) return NotFound();

        session.IsActive = !session.IsActive;
        await _context.SaveChangesAsync();
        return Ok(new { isActive = session.IsActive });
    }
}

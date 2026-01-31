using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Infrastructure.Data;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin,Doctor,Kiosk,TicketIssuer")]
[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly QMSDbContext _context;

    public RoomsController(QMSDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms([FromQuery] int? serviceId = null)
    {
        var query = _context.Rooms
            .Include(r => r.Service)
            .AsQueryable();

        if (serviceId.HasValue)
            query = query.Where(r => r.ServiceId == serviceId.Value);

        var rooms = await query
            .Select(r => new RoomDto(
                r.RoomId,
                r.ServiceId,
                r.Service.ServiceCode,
                r.RoomCode,
                r.RoomName,
                r.IsActive,
                r.MaxQueueSize,
                r.Tickets.Count(t => t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling)
            ))
            .ToListAsync();

        return Ok(rooms);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoomDto>> GetRoom(int id)
    {
        var room = await _context.Rooms
            .Include(r => r.Service)
            .Where(r => r.RoomId == id)
            .Select(r => new RoomDto(
                r.RoomId,
                r.ServiceId,
                r.Service.ServiceCode,
                r.RoomCode,
                r.RoomName,
                r.IsActive,
                r.MaxQueueSize,
                r.Tickets.Count(t => t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling)
            ))
            .FirstOrDefaultAsync();

        if (room == null)
            return NotFound(new { error = $"Room not found: {id}" });

        return Ok(room);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<RoomDto>> CreateRoom([FromBody] CreateRoomRequest request)
    {
        var service = await _context.Services.FindAsync(request.ServiceId);
        if (service == null)
            return BadRequest(new { error = $"Service not found: {request.ServiceId}" });

        if (await _context.Rooms.AnyAsync(r => r.RoomCode == request.RoomCode))
            return BadRequest(new { error = $"Room code already exists: {request.RoomCode}" });

        var room = new Room
        {
            ServiceId = request.ServiceId,
            RoomCode = request.RoomCode,
            RoomName = request.RoomName,
            MaxQueueSize = request.MaxQueueSize,
            IsActive = true
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRoom), new { id = room.RoomId }, new RoomDto(
            room.RoomId,
            room.ServiceId,
            service.ServiceCode,
            room.RoomCode,
            room.RoomName,
            room.IsActive,
            room.MaxQueueSize,
            0
        ));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateRoom(int id, [FromBody] UpdateRoomRequest request)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room == null)
            return NotFound(new { error = $"Room not found: {id}" });

        room.RoomName = request.RoomName;
        room.IsActive = request.IsActive;
        room.MaxQueueSize = request.MaxQueueSize;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRoom(int id)
    {
        var room = await _context.Rooms
            .Include(r => r.Tickets.Where(t => t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling))
            .FirstOrDefaultAsync(r => r.RoomId == id);

        if (room == null)
            return NotFound(new { error = $"Room not found: {id}" });

        if (room.Tickets.Any())
            return BadRequest(new { error = "Cannot delete room with active tickets" });

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

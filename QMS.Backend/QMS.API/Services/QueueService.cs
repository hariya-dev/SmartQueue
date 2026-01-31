using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Infrastructure.Data;

namespace QMS.API.Services;

public class QueueService : IQueueService
{
    private readonly QMSDbContext _context;

    public QueueService(QMSDbContext context)
    {
        _context = context;
    }

    public async Task<QueueStatusDto> GetQueueStatusAsync(int roomId)
    {
        var room = await _context.Rooms
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.RoomId == roomId)
            ?? throw new ArgumentException($"Room not found: {roomId}");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var pendingTickets = await _context.Tickets
            .Where(t => t.RoomId == roomId && t.Status == TicketStatus.Pending && t.IssuedDate == today)
            .ToListAsync();

        var currentTicket = await _context.Tickets
            .Include(t => t.Service)
            .Include(t => t.Room)
            .Where(t => t.RoomId == roomId && t.IssuedDate == today &&
                (t.Status == TicketStatus.Calling || t.Status == TicketStatus.Serving))
            .FirstOrDefaultAsync();

        var avgWaitTime = await _context.Tickets
            .Where(t => t.RoomId == roomId && 
                t.WaitTimeSeconds.HasValue &&
                t.IssuedDate == today)
            .AverageAsync(t => (double?)t.WaitTimeSeconds) ?? 0;

        TicketDto? currentTicketDto = null;
        if (currentTicket != null)
        {
            currentTicketDto = new TicketDto(
                currentTicket.TicketId,
                currentTicket.TicketNumber,
                currentTicket.ServiceId,
                currentTicket.Service.ServiceCode,
                currentTicket.Service.ServiceName,
                currentTicket.RoomId,
                currentTicket.Room.RoomCode,
                currentTicket.Room.RoomName,
                currentTicket.PriorityType,
                currentTicket.Status,
                currentTicket.IssuedAt,
                currentTicket.CalledAt,
                currentTicket.ServingAt,
                currentTicket.CompletedAt,
                currentTicket.WaitTimeSeconds,
                currentTicket.ServiceTimeSeconds
            );
        }

        return new QueueStatusDto(
            room.RoomId,
            room.RoomCode,
            room.RoomName,
            pendingTickets.Count,
            pendingTickets.Count(t => t.PriorityType == PriorityType.Priority),
            pendingTickets.Count(t => t.PriorityType == PriorityType.Normal),
            (int)(avgWaitTime / 60),
            currentTicketDto,
            DateTime.UtcNow
        );
    }

    public async Task<IEnumerable<RoomQueueDto>> GetRoomQueuesAsync(int? serviceId = null)
    {
        var query = _context.Rooms
            .Include(r => r.Service)
            .Where(r => r.IsActive);

        if (serviceId.HasValue)
            query = query.Where(r => r.ServiceId == serviceId.Value);

        var rooms = await query.ToListAsync();
        var result = new List<RoomQueueDto>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var room in rooms)
        {
            var pendingTickets = await _context.Tickets
                .Where(t => t.RoomId == room.RoomId && t.IssuedDate == today &&
                    (t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling))
                .ToListAsync();

            result.Add(new RoomQueueDto(
                room.RoomId,
                room.RoomCode,
                room.RoomName,
                pendingTickets.Count,
                pendingTickets.Count(t => t.PriorityType == PriorityType.Priority),
                pendingTickets.Count(t => t.PriorityType == PriorityType.Normal)
            ));
        }

        return result;
    }

    public async Task<IEnumerable<RoomQueueDetailDto>> GetDetailedRoomQueuesAsync(int? serviceId = null)
    {
        var query = _context.Rooms
            .Include(r => r.Service)
            .Where(r => r.IsActive);

        if (serviceId.HasValue)
            query = query.Where(r => r.ServiceId == serviceId.Value);

        var rooms = await query.ToListAsync();
        var result = new List<RoomQueueDetailDto>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var room in rooms)
        {
            var tickets = await _context.Tickets
                .Where(t => t.RoomId == room.RoomId && t.IssuedDate == today)
                .ToListAsync();

            result.Add(new RoomQueueDetailDto(
                room.RoomId,
                room.RoomCode,
                room.RoomName,
                tickets.Count,
                tickets.Count(t => t.Status == TicketStatus.Pending),
                tickets.Count(t => t.Status == TicketStatus.Calling),
                tickets.Count(t => t.Status == TicketStatus.Serving),
                tickets.Count(t => t.Status == TicketStatus.Done),
                tickets.Count(t => t.Status == TicketStatus.Passed),
                tickets.Count(t => t.Status == TicketStatus.Cancelled)
            ));
        }

        return result;
    }

    public async Task<TVDisplayDto> GetTVDisplayAsync(int tvProfileId)
    {
        var tvProfile = await _context.TVProfiles
            .Include(t => t.TVProfileRooms)
                .ThenInclude(tr => tr.Room)
            .Include(t => t.Advertisements)
            .FirstOrDefaultAsync(t => t.TVProfileId == tvProfileId)
            ?? throw new ArgumentException($"TV Profile not found: {tvProfileId}");

        var roomDisplays = new List<TVRoomDisplayDto>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        IEnumerable<Room> rooms;
        if (tvProfile.DisplayMode == TVDisplayMode.All)
        {
            rooms = await _context.Rooms
                .Where(r => r.IsActive)
                .ToListAsync();
        }
        else
        {
            rooms = tvProfile.TVProfileRooms.Select(tr => tr.Room);
        }

        foreach (var room in rooms)
        {
            var roomTickets = await _context.Tickets
                .Where(t => t.RoomId == room.RoomId && t.IssuedDate == today &&
                    (t.Status == TicketStatus.Pending || 
                     t.Status == TicketStatus.Calling ||
                     t.Status == TicketStatus.Serving))
                .ToListAsync();

            var callingTicket = roomTickets.FirstOrDefault(t => t.Status == TicketStatus.Calling);
            var servingTicket = roomTickets.FirstOrDefault(t => t.Status == TicketStatus.Serving);
            var currentTicket = callingTicket ?? servingTicket;
            
            var waitingTickets = roomTickets
                .Where(t => t.Status == TicketStatus.Pending)
                .OrderByDescending(t => t.PriorityType)
                .ThenBy(t => t.IssuedAt)
                .Take(5)
                .Select(t => t.TicketNumber)
                .ToList();

            roomDisplays.Add(new TVRoomDisplayDto(
                room.RoomId,
                room.RoomCode,
                room.RoomName,
                currentTicket?.TicketNumber,
                false, // Blinking is handled by events, not by polling state
                waitingTickets
            ));
        }

        return new TVDisplayDto(
            tvProfile.TVProfileId,
            tvProfile.TVCode,
            tvProfile.TVName,
            tvProfile.ShowAd,
            tvProfile.AdVideoUrl,
            tvProfile.AdPosition,
            tvProfile.ColumnsPerRow,
            tvProfile.RowsCount,
            tvProfile.LayoutMode,
            tvProfile.ScreenWidth,
            tvProfile.ScreenHeight,
            tvProfile.HeaderSizePercent,
            tvProfile.LogoUrl,
            tvProfile.TimeFormat,
            tvProfile.ShowDate,
            tvProfile.AdSizePercent,
            tvProfile.ShowFooter,
            tvProfile.FooterText,
            tvProfile.FooterPosition,
            tvProfile.FooterSizePercent,
            tvProfile.HospitalNameFontSize,
            tvProfile.RoomNameFontSize,
            tvProfile.CounterNumberFontSize,
            tvProfile.TicketNumberFontSize,
            tvProfile.DateTimeFontSize,
            tvProfile.FooterFontSize,
            tvProfile.HeaderBgColor,
            tvProfile.MainBgColor,
            tvProfile.FooterBgColor,
            tvProfile.HeaderTextColor,
            tvProfile.MainTextColor,
            tvProfile.FooterTextColor,
            tvProfile.ActiveColor,
            tvProfile.InactiveColor,
            tvProfile.ConnectionStatusColor,
            tvProfile.GridConfigJson,
            tvProfile.RowGap,
            tvProfile.ColumnGap,
            roomDisplays,
            tvProfile.Advertisements.OrderBy(a => a.DisplayOrder).Select(a => new TVAdDto(
                a.TVAdId, a.TVProfileId, a.AdTitle, a.Url, a.AdType, a.DisplayOrder, a.DurationInSeconds, a.IsActive
            )).ToList()
        );
    }
}

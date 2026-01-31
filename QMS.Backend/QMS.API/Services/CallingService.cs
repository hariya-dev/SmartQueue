using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Core.Interfaces;
using QMS.Infrastructure.Data;

namespace QMS.API.Services;

public class CallingService : ICallingService
{
    private readonly QMSDbContext _context;
    private readonly ITicketRepository _ticketRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public CallingService(
        QMSDbContext context,
        ITicketRepository ticketRepository,
        IUnitOfWork unitOfWork,
        INotificationService notificationService)
    {
        _context = context;
        _ticketRepository = ticketRepository;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<CallNextResponse?> CallNextAsync(CallingDeskRequest request)
    {
        var room = await _context.Rooms
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.RoomId == request.RoomId)
            ?? throw new ArgumentException($"Room not found: {request.RoomId}");

        var currentTicket = await _ticketRepository.GetCurrentServingTicketByRoomAsync(request.RoomId);
        if (currentTicket != null)
        {
            throw new InvalidOperationException("Please complete or pass the current ticket before calling the next one.");
        }

        var prioritySetting = await _context.PrioritySettings
            .FirstOrDefaultAsync(p => 
                (p.RoomId == request.RoomId || p.ServiceId == room.ServiceId || (p.RoomId == null && p.ServiceId == null)) 
                && p.IsActive);

        var strategy = prioritySetting?.Strategy ?? PriorityStrategy.Strict;
        var interleaveInterval = prioritySetting?.InterleaveInterval ?? 5;
        
        var nextTicket = await _ticketRepository.GetNextTicketAsync(request.RoomId, strategy, interleaveInterval);
        
        if (nextTicket == null)
            return null;

        nextTicket.Status = TicketStatus.Calling;
        nextTicket.CalledAt = DateTime.UtcNow;
        nextTicket.CalledByUserId = request.UserId;
        
        if (nextTicket.WaitTimeSeconds == null && nextTicket.IssuedAt != default)
        {
            nextTicket.WaitTimeSeconds = (int)(DateTime.UtcNow - nextTicket.IssuedAt).TotalSeconds;
        }

        await _unitOfWork.SaveChangesAsync();

        var remainingInQueue = await _ticketRepository.GetQueueSizeByRoomAsync(request.RoomId);

        await _notificationService.NotifyTicketCalledAsync(new TicketCalledEvent(
            nextTicket.TicketId,
            nextTicket.TicketNumber,
            room.RoomCode,
            room.RoomName,
            room.Service.ServiceCode,
            nextTicket.PriorityType,
            "call"
        ));

        return new CallNextResponse(
            nextTicket.TicketId,
            nextTicket.TicketNumber,
            room.Service.ServiceCode,
            room.Service.ServiceName,
            nextTicket.PriorityType,
            room.RoomCode,
            room.RoomName,
            remainingInQueue
        );
    }

    public async Task<CallNextResponse?> RecallAsync(CallingDeskRequest request)
    {
        var room = await _context.Rooms
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.RoomId == request.RoomId)
            ?? throw new ArgumentException($"Room not found: {request.RoomId}");

        var currentTicket = await _ticketRepository.GetCurrentServingTicketByRoomAsync(request.RoomId);
        
        if (currentTicket == null)
            return null;

        currentTicket.Status = TicketStatus.Calling;
        currentTicket.CalledAt = DateTime.UtcNow;
        
        await _unitOfWork.SaveChangesAsync();

        var remainingInQueue = await _ticketRepository.GetQueueSizeByRoomAsync(request.RoomId);

        await _notificationService.NotifyTicketCalledAsync(new TicketCalledEvent(
            currentTicket.TicketId,
            currentTicket.TicketNumber,
            room.RoomCode,
            room.RoomName,
            room.Service.ServiceCode,
            currentTicket.PriorityType,
            "recall"
        ));

        return new CallNextResponse(
            currentTicket.TicketId,
            currentTicket.TicketNumber,
            room.Service.ServiceCode,
            room.Service.ServiceName,
            currentTicket.PriorityType,
            room.RoomCode,
            room.RoomName,
            remainingInQueue
        );
    }

    public async Task<bool> PassAsync(PassTicketRequest request)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Room)
            .FirstOrDefaultAsync(t => t.TicketId == request.TicketId)
            ?? throw new ArgumentException($"Ticket not found: {request.TicketId}");

        var oldStatus = ticket.Status;
        ticket.Status = TicketStatus.Passed;
        ticket.CompletedAt = DateTime.UtcNow;
        
        await _unitOfWork.SaveChangesAsync();

        await _notificationService.NotifyTicketStatusChangedAsync(new TicketStatusChangedEvent(
            ticket.TicketId,
            ticket.TicketNumber,
            oldStatus,
            TicketStatus.Passed,
            ticket.Room.RoomCode
        ));

        return true;
    }

    public async Task<bool> DoneAsync(DoneTicketRequest request)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Room)
            .FirstOrDefaultAsync(t => t.TicketId == request.TicketId)
            ?? throw new ArgumentException($"Ticket not found: {request.TicketId}");

        var oldStatus = ticket.Status;
        ticket.Status = TicketStatus.Done;
        ticket.CompletedAt = DateTime.UtcNow;
        ticket.PostProcessBranchId = request.PostProcessBranchId;
        
        if (ticket.ServingAt.HasValue)
        {
            ticket.ServiceTimeSeconds = (int)(DateTime.UtcNow - ticket.ServingAt.Value).TotalSeconds;
        }

        await _unitOfWork.SaveChangesAsync();

        await _notificationService.NotifyTicketStatusChangedAsync(new TicketStatusChangedEvent(
            ticket.TicketId,
            ticket.TicketNumber,
            oldStatus,
            TicketStatus.Done,
            ticket.Room.RoomCode
        ));

        return true;
    }

    public async Task<bool> ReturnToQueueAsync(long ticketId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Room)
            .FirstOrDefaultAsync(t => t.TicketId == ticketId)
            ?? throw new ArgumentException($"Ticket not found: {ticketId}");

        var oldStatus = ticket.Status;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        
        ticket.Status = TicketStatus.Pending;
        ticket.IssuedDate = today; // Update to today so it appears in active queue
        ticket.IssuedAt = DateTime.UtcNow; // Set to now so it's at the end of the new queue
        ticket.CalledAt = null;
        ticket.ServingAt = null;
        ticket.CompletedAt = null;
        ticket.CalledByUserId = null;
        ticket.WaitTimeSeconds = null;
        ticket.ServiceTimeSeconds = null;
        
        await _unitOfWork.SaveChangesAsync();

        await _notificationService.NotifyTicketStatusChangedAsync(new TicketStatusChangedEvent(
            ticket.TicketId,
            ticket.TicketNumber,
            oldStatus,
            TicketStatus.Pending,
            ticket.Room.RoomCode
        ));

        // Notify queue updated
        var queueSize = await _ticketRepository.GetQueueSizeByRoomAsync(ticket.RoomId);
        await _notificationService.NotifyQueueUpdatedAsync(new QueueUpdatedEvent(
            ticket.RoomId,
            ticket.Room.RoomCode,
            queueSize,
            new List<string> { ticket.TicketNumber }
        ));

        return true;
    }

    public async Task<bool> TogglePriorityAsync(long ticketId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Room)
            .FirstOrDefaultAsync(t => t.TicketId == ticketId)
            ?? throw new ArgumentException($"Ticket not found: {ticketId}");

        ticket.PriorityType = ticket.PriorityType == PriorityType.Priority 
            ? PriorityType.Normal 
            : PriorityType.Priority;

        await _unitOfWork.SaveChangesAsync();

        // Notify queue updated to trigger refresh
        var queueSize = await _ticketRepository.GetQueueSizeByRoomAsync(ticket.RoomId);
        await _notificationService.NotifyQueueUpdatedAsync(new QueueUpdatedEvent(
            ticket.RoomId,
            ticket.Room?.RoomCode ?? "",
            queueSize,
            new List<string> { ticket.TicketNumber }
        ));

        return true;
    }

    public async Task<bool> TransferAsync(TransferTicketRequest request)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Room)
            .FirstOrDefaultAsync(t => t.TicketId == request.TicketId)
            ?? throw new ArgumentException($"Ticket not found: {request.TicketId}");

        var oldRoomId = ticket.RoomId;
        var oldRoomCode = ticket.Room?.RoomCode ?? "";
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Update target
        if (request.TargetServiceId.HasValue)
            ticket.ServiceId = request.TargetServiceId.Value;
        
        if (request.TargetRoomId.HasValue)
            ticket.RoomId = request.TargetRoomId.Value;

        // Reset state to Pending
        ticket.Status = TicketStatus.Pending;
        ticket.IssuedDate = today;
        ticket.IssuedAt = DateTime.UtcNow; // Set to now so it's at the end of the new queue
        ticket.CalledAt = null;
        ticket.ServingAt = null;
        ticket.CompletedAt = null;
        ticket.CalledByUserId = null;
        ticket.WaitTimeSeconds = null;
        ticket.ServiceTimeSeconds = null;

        await _unitOfWork.SaveChangesAsync();

        // Notify old room to clear the ticket from current display
        await _notificationService.NotifyTicketStatusChangedAsync(new TicketStatusChangedEvent(
            ticket.TicketId,
            ticket.TicketNumber,
            TicketStatus.Calling, 
            TicketStatus.Pending,
            oldRoomCode
        ));

        // Notify new room queue updated
        var targetRoom = await _context.Rooms.FindAsync(ticket.RoomId);
        await _notificationService.NotifyQueueUpdatedAsync(new QueueUpdatedEvent(
            ticket.RoomId,
            targetRoom?.RoomCode ?? "",
            await _ticketRepository.GetQueueSizeByRoomAsync(ticket.RoomId),
            new List<string> { ticket.TicketNumber }
        ));

        return true;
    }

    public async Task<CallingDeskStateDto> GetCallingDeskStateAsync(int roomId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        
        var tickets = await _context.Tickets
            .Include(t => t.Service)
            .Include(t => t.Room)
            .Where(t => t.RoomId == roomId && t.IssuedDate == today)
            .ToListAsync();

        var current = tickets.FirstOrDefault(t => t.Status == TicketStatus.Calling || t.Status == TicketStatus.Serving);
        
        CurrentTicketDto? currentDto = null;
        if (current != null)
        {
            currentDto = new CurrentTicketDto(
                current.TicketId,
                current.TicketNumber,
                current.Service.ServiceCode,
                current.Service.ServiceName,
                current.PriorityType,
                current.Status,
                current.CalledAt,
                current.ServingAt
            );
        }

        var waiting = tickets
            .Where(t => t.Status == TicketStatus.Pending)
            .OrderByDescending(t => t.PriorityType)
            .ThenBy(t => t.IssuedAt)
            .Select(t => MapToTicketDto(t))
            .ToList();

        var passed = tickets
            .Where(t => t.Status == TicketStatus.Passed)
            .OrderByDescending(t => t.CompletedAt)
            .Select(t => MapToTicketDto(t))
            .ToList();

        var done = tickets
            .Where(t => t.Status == TicketStatus.Done)
            .OrderByDescending(t => t.CompletedAt)
            .Select(t => MapToTicketDto(t))
            .ToList();

        return new CallingDeskStateDto(
            currentDto,
            waiting,
            passed,
            done,
            waiting.Count,
            done.Count,
            passed.Count
        );
    }

    private static TicketDto MapToTicketDto(Ticket t) => new TicketDto(
        t.TicketId,
        t.TicketNumber,
        t.ServiceId,
        t.Service.ServiceCode,
        t.Service.ServiceName,
        t.RoomId,
        t.Room.RoomCode,
        t.Room.RoomName,
        t.PriorityType,
        t.Status,
        t.IssuedAt,
        t.CalledAt,
        t.ServingAt,
        t.CompletedAt,
        t.WaitTimeSeconds,
        t.ServiceTimeSeconds
    );

    public async Task<CurrentTicketDto?> GetCurrentTicketAsync(int roomId)
    {
        var ticket = await _ticketRepository.GetCurrentServingTicketByRoomAsync(roomId);
        
        if (ticket == null)
            return null;

        return new CurrentTicketDto(
            ticket.TicketId,
            ticket.TicketNumber,
            ticket.Service.ServiceCode,
            ticket.Service.ServiceName,
            ticket.PriorityType,
            ticket.Status,
            ticket.CalledAt,
            ticket.ServingAt
        );
    }

    public async Task<IEnumerable<TicketDto>> GetQueueAsync(int roomId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var tickets = await _context.Tickets
            .Include(t => t.Service)
            .Include(t => t.Room)
            .Where(t => t.RoomId == roomId && t.Status == TicketStatus.Pending && t.IssuedDate == today)
            .OrderByDescending(t => t.PriorityType)
            .ThenBy(t => t.IssuedAt)
            .ToListAsync();

        return tickets.Select(t => new TicketDto(
            t.TicketId,
            t.TicketNumber,
            t.ServiceId,
            t.Service.ServiceCode,
            t.Service.ServiceName,
            t.RoomId,
            t.Room.RoomCode,
            t.Room.RoomName,
            t.PriorityType,
            t.Status,
            t.IssuedAt,
            t.CalledAt,
            t.ServingAt,
            t.CompletedAt,
            t.WaitTimeSeconds,
            t.ServiceTimeSeconds
        ));
    }
}

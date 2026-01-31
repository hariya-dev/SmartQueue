using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Core.Interfaces;
using QMS.Infrastructure.Data;

namespace QMS.API.Services;

public class TicketService : ITicketService
{
    private readonly QMSDbContext _context;
    private readonly ITicketRepository _ticketRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IPrintService _printService;
    private readonly IPrintHistoryService _printHistoryService;

    public TicketService(
        QMSDbContext context,
        ITicketRepository ticketRepository,
        IRoomRepository roomRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        IPrintService printService,
        IPrintHistoryService printHistoryService)
    {
        _context = context;
        _ticketRepository = ticketRepository;
        _roomRepository = roomRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _printService = printService;
        _printHistoryService = printHistoryService;
    }

    public async Task<IssueTicketResponse> IssueTicketAsync(IssueTicketRequest request)
    {
        var service = await _serviceRepository.GetByCodeAsync(request.ServiceCode)
            ?? throw new ArgumentException($"Service not found: {request.ServiceCode}");

        if (!service.IsActive)
            throw new InvalidOperationException($"Service is not active: {request.ServiceCode}");

        Room room;
        if (request.RoomId.HasValue)
        {
            room = await _roomRepository.GetByIdAsync(request.RoomId.Value)
                ?? throw new ArgumentException($"Room not found: {request.RoomId.Value}");
            
            // Validate if room supports this service
            var serviceRooms = await _context.ServiceRoomBranchRules
                .Where(r => r.ServiceId == service.ServiceId && r.RoomId == room.RoomId)
                .AnyAsync();
            
            if (!serviceRooms)
            {
                // Fallback to check if it's a direct assigned room regardless of rules? 
                // Usually we should follow rules, but user said "chỉ định phòng khám".
                // I will allow it but maybe log or just allow if it exists.
            }
        }
        else
        {
            room = await _roomRepository.GetRoomWithLeastQueueAsync(service.ServiceId)
                ?? throw new InvalidOperationException($"No available room for service: {request.ServiceCode}");
        }

        // Check Working Sessions
        var now = DateTime.Now;
        var currentTime = now.TimeOfDay;
        var currentDay = now.DayOfWeek;
        
        var activeSessions = await _context.WorkingSessions
            .Where(s => s.IsActive)
            .ToListAsync();
        
        if (activeSessions.Any())
        {
            var isWithinSession = activeSessions.Any(s => 
                (s.DayOfWeek == null || s.DayOfWeek == currentDay) && 
                currentTime >= s.StartTime && 
                currentTime < s.EndTime);
        
            if (!isWithinSession)
            {
                var sessionInfo = string.Join(", ", activeSessions
                    .Where(s => s.DayOfWeek == null || s.DayOfWeek == currentDay)
                    .Select(s => $"{s.StartTime:hh\\:mm} - {s.EndTime:hh\\:mm}"));
                        
                throw new InvalidOperationException($"Hiện tại không phải thời gian lấy số. Vui lòng quay lại vào các khung giờ: {sessionInfo}");
            }
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Lấy cấu hình đầu tiên
            var prioritySetting = await _context.PrioritySettings
                .Where(p => (p.RoomId == room.RoomId || p.ServiceId == null) && p.IsActive)
                .FirstOrDefaultAsync();
            
            var ticketNumber = await GenerateTicketNumberAsync(service.ServiceId, request.ServiceCode, request.PriorityType);
            
            var ticket = new Ticket
            {
                TicketNumber = ticketNumber,
                ServiceId = service.ServiceId,
                RoomId = room.RoomId,
                PriorityType = request.PriorityType, // Giữ nguyên từ request
                Status = TicketStatus.Pending,
                KioskId = request.KioskId,
                PrinterId = request.PrinterId,
                IssuedAt = DateTime.UtcNow,
                IssuedDate = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            // Áp dụng logic sắp xếp cho ticket ưu tiên
            if (request.PriorityType == PriorityType.Priority)
            {
                if (prioritySetting?.Strategy == PriorityStrategy.Interleaved)
                {
                    // Xen kẽ: chèn vào vị trí xen kẽ
                    await ApplyInterleavedPriorityInsertionAsync(ticket, room.RoomId);
                }
                else
                {
                    // Strict: lên đầu hàng
                    await ApplyStrictPriorityInsertionAsync(ticket, room.RoomId);
                }
            }

            await _ticketRepository.AddAsync(ticket);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            var queuePosition = await _ticketRepository.GetQueueSizeByRoomAsync(room.RoomId);
            var estimatedWait = queuePosition * 5;

            await _notificationService.NotifyQueueUpdatedAsync(new QueueUpdatedEvent(
                room.RoomId,
                room.RoomCode,
                queuePosition,
                new List<string> { ticketNumber }
            ));

            var response = new IssueTicketResponse(
                ticket.TicketId,
                ticket.TicketNumber,
                service.ServiceCode,
                service.ServiceName,
                room.RoomCode,
                room.RoomName,
                ticket.PriorityType,
                queuePosition,
                estimatedWait,
                ticket.IssuedAt
            );

            // Handle Printing
            if (request.PrinterId.HasValue)
            {
                var printer = await _context.Printers.FindAsync(request.PrinterId.Value);
                if (printer != null && !string.IsNullOrEmpty(printer.IpAddress))
                {
                    var printType = request.KioskId.HasValue ? PrintType.Auto : PrintType.Manual;
                    
                    try
                    {
                       //await _printService.PrintTicketAsync(response, printer.IpAddress);
                        
                        // Record successful print
                        await _printHistoryService.AddPrintHistoryAsync(new PrintHistoryDto(
                            0, // New ID will be generated
                            ticket.TicketId,
                            ticket.TicketNumber,
                            printer.PrinterId,
                            printer.PrinterName,
                            printer.IpAddress,
                            printType.ToString(),
                            PrintStatus.Success.ToString(),
                            null,
                            DateTime.UtcNow,
                            null,
                            null
                        ));
                    }
                    catch (Exception ex)
                    {
                        // Record failed print
                        await _printHistoryService.AddPrintHistoryAsync(new PrintHistoryDto(
                            0,
                            ticket.TicketId,
                            ticket.TicketNumber,
                            printer.PrinterId,
                            printer.PrinterName,
                            printer.IpAddress,
                            printType.ToString(),
                            PrintStatus.Failed.ToString(),
                            ex.Message,
                            DateTime.UtcNow,
                            null,
                            null
                        ));
                    }
                }
            }

            return response;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    private async Task ApplyInterleavedPriorityInsertionAsync(Ticket newTicket, int roomId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        
        // Lấy interval từ cấu hình
        var prioritySetting = await _context.PrioritySettings
            .Where(p => (p.RoomId == roomId || p.ServiceId == null) && p.IsActive)
            .FirstOrDefaultAsync();
        
        var interval = prioritySetting?.InterleaveInterval ?? 5;
        
        // Get all pending tickets ordered by IssuedAt
        var pendingTickets = await _context.Tickets
            .Where(t => t.RoomId == roomId && 
                        t.Status == TicketStatus.Pending && 
                        t.IssuedDate == today)
            .OrderBy(t => t.IssuedAt)
            .ToListAsync();
        
        if (!pendingTickets.Any())
        {
            return;
        }
        
        // Tìm vị trí của ticket ưu tiên cuối cùng (PriorityType == Priority)
        var lastPriorityIndex = -1;
        for (int i = pendingTickets.Count - 1; i >= 0; i--)
        {
            if (pendingTickets[i].PriorityType == PriorityType.Priority)
            {
                lastPriorityIndex = i;
                break;
            }
        }
        
        // Tính số vị trí còn lại sau ticket ưu tiên cuối
        var remainingAfterLastPriority = pendingTickets.Count - 1 - lastPriorityIndex;
        
        DateTime insertIssuedAt;
        
        if (lastPriorityIndex == -1)
        {
            // Chưa có ticket ưu tiên nào, chèn vào vị trí 'interval'
            if (pendingTickets.Count >= interval)
            {
                var beforeTicket = pendingTickets[interval - 2];
                var afterTicket = pendingTickets[interval - 1];
                insertIssuedAt = beforeTicket.IssuedAt.AddTicks((afterTicket.IssuedAt.Ticks - beforeTicket.IssuedAt.Ticks) / 2);
            }
            else
            {
                insertIssuedAt = DateTime.UtcNow;
            }
        }
        else if (remainingAfterLastPriority >= interval)
        {
            // Đủ vị trí: chèn vào vị trí (lastPriorityIndex + 1) + interval
            var insertIndex = lastPriorityIndex + 1 + interval;
            
            if (insertIndex <= pendingTickets.Count)
            {
                var beforeTicket = pendingTickets[insertIndex - 2];
                var afterTicket = pendingTickets[insertIndex - 1];
                insertIssuedAt = beforeTicket.IssuedAt.AddTicks((afterTicket.IssuedAt.Ticks - beforeTicket.IssuedAt.Ticks) / 2);
            }
            else
            {
                insertIssuedAt = DateTime.UtcNow;
            }
        }
        else
        {
            // Không đủ vị chèn vào cuối (sau ticket ưu tiên cuối)
            var lastPriorityTicket = pendingTickets[lastPriorityIndex];
            insertIssuedAt = lastPriorityTicket.IssuedAt.AddSeconds(1);
        }
        
        newTicket.IssuedAt = insertIssuedAt;
    }
    
    private async Task ApplyStrictPriorityInsertionAsync(Ticket newTicket, int roomId)
    {
        // Đưa ticket ưu tiên lên đầu hàng bằng cách đặt IssuedAt trước tất cả ticket thường
        var earliestTicket = await _context.Tickets
            .Where(t => t.RoomId == roomId && 
                        t.Status == TicketStatus.Pending && 
                        t.IssuedDate == DateOnly.FromDateTime(DateTime.UtcNow))
            .OrderBy(t => t.IssuedAt)
            .FirstOrDefaultAsync();
        
        if (earliestTicket != null)
        {
            newTicket.IssuedAt = earliestTicket.IssuedAt.AddTicks(-1);
        }
    }

    private async Task<string> GenerateTicketNumberAsync(int serviceId, string serviceCode, PriorityType priorityType)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        
        var sequence = await _context.TicketSequences
            .FirstOrDefaultAsync(s => s.ServiceId == serviceId && s.SequenceDate == today);

        if (sequence == null)
        {
            sequence = new TicketSequence
            {
                ServiceId = serviceId,
                SequenceDate = today,
                NormalLastNumber = 0,
                PriorityLastNumber = 0
            };
            _context.TicketSequences.Add(sequence);
        }

        int number;
        string prefix;
        
        if (priorityType == PriorityType.Priority)
        {
            sequence.PriorityLastNumber++;
            number = sequence.PriorityLastNumber;
            prefix = $"{serviceCode}-U";
        }
        else
        {
            sequence.NormalLastNumber++;
            number = sequence.NormalLastNumber;
            prefix = $"{serviceCode}-";
        }

        await _context.SaveChangesAsync();
        
        return $"{prefix}{number:D4}";
    }

    public async Task<TicketDto?> GetTicketByNumberAsync(string ticketNumber)
    {
        var ticket = await _ticketRepository.GetByTicketNumberAsync(ticketNumber);
        return ticket == null ? null : MapToDto(ticket);
    }

    public async Task<TicketDto?> GetTicketByIdAsync(long ticketId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Service)
            .Include(t => t.Room)
            .FirstOrDefaultAsync(t => t.TicketId == ticketId);
        
        return ticket == null ? null : MapToDto(ticket);
    }

    public async Task<TicketStatusDto> GetTicketStatusAsync(string ticketNumber)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var ticket = await _ticketRepository.GetByTicketNumberAsync(ticketNumber)
            ?? throw new ArgumentException($"Ticket not found for today: {ticketNumber}");

        var queuePosition = 0;
        if (ticket.Status == TicketStatus.Pending)
        {
            queuePosition = await _context.Tickets
                .CountAsync(t => t.RoomId == ticket.RoomId && 
                    t.Status == TicketStatus.Pending &&
                    t.IssuedDate == today &&
                    (t.PriorityType > ticket.PriorityType || 
                        (t.PriorityType == ticket.PriorityType && t.IssuedAt < ticket.IssuedAt)));
            queuePosition++;
        }

        return new TicketStatusDto(
            ticket.TicketId,
            ticket.TicketNumber,
            ticket.Status,
            queuePosition,
            queuePosition * 5
        );
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByRoomAsync(int roomId, TicketStatus? status = null)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = _context.Tickets
            .Include(t => t.Service)
            .Include(t => t.Room)
            .Where(t => t.RoomId == roomId && t.IssuedDate == today);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        // Lấy cấu hình để xác định cách sắp xếp
        var prioritySetting = await _context.PrioritySettings
            .Where(p => (p.RoomId == roomId || p.ServiceId == null) && p.IsActive)
            .FirstOrDefaultAsync();

        List<Ticket> tickets;
        
        // Sắp xếp theo cấu hình: Xen kẽ thì theo IssuedAt, không thì ưu tiên lên đầu
        if (prioritySetting?.Strategy == PriorityStrategy.Interleaved)
        {
            tickets = await query
                .OrderBy(t => t.IssuedAt)
                .ToListAsync();
        }
        else
        {
            tickets = await query
                .OrderByDescending(t => t.PriorityType)
                .ThenBy(t => t.IssuedAt)
                .ToListAsync();
        }

        return tickets.Select(MapToDto);
    }

    public async Task<IEnumerable<ServiceQueueDetailDto>> GetServiceQueueDetailsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var services = await _context.Services
            .Where(s => s.IsActive)
            .Include(s => s.Rooms.Where(r => r.IsActive))
            .ToListAsync();

        var result = new List<ServiceQueueDetailDto>();

        foreach (var service in services)
        {
            var serviceTickets = await _context.Tickets
                .Where(t => t.ServiceId == service.ServiceId && t.IssuedDate == today)
                .ToListAsync();

            var rooms = new List<QueueSummaryRoomDto>();
            foreach (var room in service.Rooms)
            {
                var roomTickets = serviceTickets.Where(t => t.RoomId == room.RoomId).ToList();
                rooms.Add(new QueueSummaryRoomDto(
                    room.RoomId,
                    room.RoomCode,
                    room.RoomName,
                    roomTickets.Count(t => t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling),
                    roomTickets.Count(t => t.Status == TicketStatus.Done),
                    roomTickets.Count(t => t.Status == TicketStatus.Cancelled || t.Status == TicketStatus.Passed)
                ));
            }

            result.Add(new ServiceQueueDetailDto(
                service.ServiceId,
                service.ServiceName,
                service.ServiceCode,
                serviceTickets.Count(t => t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling),
                serviceTickets.Count(t => t.Status == TicketStatus.Done),
                serviceTickets.Count(t => t.Status == TicketStatus.Cancelled || t.Status == TicketStatus.Passed),
                rooms
            ));
        }

        return result;
    }

    private static TicketDto MapToDto(Ticket ticket) => new(
        ticket.TicketId,
        ticket.TicketNumber,
        ticket.ServiceId,
        ticket.Service.ServiceCode,
        ticket.Service.ServiceName,
        ticket.RoomId,
        ticket.Room.RoomCode,
        ticket.Room.RoomName,
        ticket.PriorityType,
        ticket.Status,
        ticket.IssuedAt,
        ticket.CalledAt,
        ticket.ServingAt,
        ticket.CompletedAt,
        ticket.WaitTimeSeconds,
        ticket.ServiceTimeSeconds
    );
}

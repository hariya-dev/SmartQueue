using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Infrastructure.Data;

namespace QMS.API.Services;

public class PrintHistoryService : IPrintHistoryService
{
    private readonly QMSDbContext _context;
    private readonly IPrintService _printService;

    public PrintHistoryService(QMSDbContext context, IPrintService printService)
    {
        _context = context;
        _printService = printService;
    }

    public async Task<IEnumerable<PrintHistoryDto>> GetPrintHistoryAsync(
        DateTime? fromDate = null, 
        DateTime? toDate = null, 
        int? printerId = null)
    {
        var query = _context.PrintHistories.AsQueryable();

        // Default to today if no date filters provided
        if (!fromDate.HasValue && !toDate.HasValue)
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);
            query = query.Where(p => p.PrintedAt >= today && p.PrintedAt < tomorrow);
        }
        else
        {
            if (fromDate.HasValue)
                query = query.Where(p => p.PrintedAt >= fromDate.Value);
            
            if (toDate.HasValue)
                query = query.Where(p => p.PrintedAt <= toDate.Value);
        }
        
        if (printerId.HasValue)
            query = query.Where(p => p.PrinterId == printerId.Value);

        var results = await query
            .OrderByDescending(p => p.PrintedAt)
            .Take(100)
            .ToListAsync();

        return results.Select(MapToDto);
    }

    public async Task<PrintHistoryDto?> GetPrintHistoryByIdAsync(long printHistoryId)
    {
        var entity = await _context.PrintHistories
            .FirstOrDefaultAsync(p => p.PrintHistoryId == printHistoryId);

        return entity == null ? null : MapToDto(entity);
    }

    public async Task<PrintHistoryDto> AddPrintHistoryAsync(PrintHistoryDto dto)
    {
        var entity = new PrintHistory
        {
            TicketId = dto.TicketId,
            TicketNumber = dto.TicketNumber,
            PrinterId = dto.PrinterId,
            PrinterName = dto.PrinterName,
            PrinterIp = dto.PrinterIp,
            PrintType = (PrintType)Enum.Parse(typeof(PrintType), dto.PrintType),
            PrintStatus = (PrintStatus)Enum.Parse(typeof(PrintStatus), dto.PrintStatus),
            ErrorMessage = dto.ErrorMessage,
            PrintedAt = dto.PrintedAt,
            PrintedByUserId = dto.PrintedByUserId,
            PrintedByUserName = dto.PrintedByUserName
        };

        _context.PrintHistories.Add(entity);
        await _context.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<bool> ReprintTicketAsync(long printHistoryId, int printerId)
    {
        var printHistory = await _context.PrintHistories
            .Include(p => p.Ticket)
                .ThenInclude(t => t.Service)
            .Include(p => p.Ticket)
                .ThenInclude(t => t.Room)
            .FirstOrDefaultAsync(p => p.PrintHistoryId == printHistoryId);

        if (printHistory == null || printHistory.Ticket == null)
            return false;

        var printer = await _context.Printers.FindAsync(printerId);
        if (printer == null || string.IsNullOrEmpty(printer.IpAddress))
            return false;

        try
        {
            var ticketResponse = new IssueTicketResponse(
                printHistory.Ticket.TicketId,
                printHistory.TicketNumber,
                printHistory.Ticket.Service?.ServiceCode ?? string.Empty,
                printHistory.Ticket.Service?.ServiceName ?? string.Empty,
                printHistory.Ticket.Room?.RoomCode ?? string.Empty,
                printHistory.Ticket.Room?.RoomName ?? string.Empty,
                printHistory.Ticket.PriorityType,
                0, // Queue position not relevant for reprint
                0, // Estimated wait not relevant for reprint
                printHistory.Ticket.IssuedAt
            );

            await _printService.PrintTicketAsync(ticketResponse, printer.IpAddress);

            // Record the reprint
            var reprintDto = new PrintHistoryDto(
                0, // New ID will be generated
                printHistory.TicketId,
                printHistory.TicketNumber,
                printer.PrinterId,
                printer.PrinterName,
                printer.IpAddress,
                PrintType.Reprint.ToString(),
                PrintStatus.Success.ToString(),
                null,
                DateTime.UtcNow,
                null,
                null
            );

            await AddPrintHistoryAsync(reprintDto);
            return true;
        }
        catch (Exception ex)
        {
            // Log error and record failed reprint
            var failedReprintDto = new PrintHistoryDto(
                0,
                printHistory.TicketId,
                printHistory.TicketNumber,
                printer.PrinterId,
                printer.PrinterName,
                printer.IpAddress,
                PrintType.Reprint.ToString(),
                PrintStatus.Failed.ToString(),
                ex.Message,
                DateTime.UtcNow,
                null,
                null
            );

            await AddPrintHistoryAsync(failedReprintDto);
            return false;
        }
    }

    public async Task<int> GetTodayPrintCountAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await _context.PrintHistories
            .CountAsync(p => p.PrintedAt >= today);
    }

    private static PrintHistoryDto MapToDto(PrintHistory entity)
    {
        return new PrintHistoryDto(
            entity.PrintHistoryId,
            entity.TicketId,
            entity.TicketNumber,
            entity.PrinterId,
            entity.PrinterName,
            entity.PrinterIp,
            entity.PrintType.ToString(),
            entity.PrintStatus.ToString(),
            entity.ErrorMessage,
            entity.PrintedAt,
            entity.PrintedByUserId,
            entity.PrintedByUserName
        );
    }
}

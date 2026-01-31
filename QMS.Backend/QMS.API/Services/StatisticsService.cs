using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Infrastructure.Data;
using System.Data;

namespace QMS.API.Services;

public class StatisticsService : IStatisticsService
{
    private readonly QMSDbContext _context;

    public StatisticsService(QMSDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        
        var totalServices = await _context.Services.CountAsync(s => s.IsActive);
        var totalRooms = await _context.Rooms.CountAsync(r => r.IsActive);
        
        var todayTickets = await _context.Tickets
            .Where(t => t.IssuedDate == today)
            .ToListAsync();

        var totalTicketsToday = todayTickets.Count;
        var totalProcessedToday = todayTickets.Count(t => t.Status == TicketStatus.Done);
        var totalWaitingNow = todayTickets.Count(t => t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling);
        
        var avgWaitTime = todayTickets
            .Where(t => t.WaitTimeSeconds.HasValue)
            .Average(t => (double?)t.WaitTimeSeconds) ?? 0;

        var roomStats = await _context.Rooms
            .Where(r => r.IsActive)
            .Select(r => new RoomStatsDto(
                r.RoomId,
                r.RoomCode,
                r.Service.ServiceCode,
                _context.Tickets.Count(t => t.RoomId == r.RoomId && t.IssuedDate == today && (t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling)),
                _context.Tickets.Count(t => t.RoomId == r.RoomId && t.IssuedDate == today && t.Status == TicketStatus.Done),
                (int)((_context.Tickets.Where(t => t.RoomId == r.RoomId && t.IssuedDate == today && t.WaitTimeSeconds.HasValue).Average(t => (double?)t.WaitTimeSeconds) ?? 0) / 60),
                _context.Tickets.Any(t => t.RoomId == r.RoomId && t.IssuedDate == today && (t.Status == TicketStatus.Calling || t.Status == TicketStatus.Serving))
            ))
            .ToListAsync();

        return new DashboardStatsDto(
            totalServices,
            totalRooms,
            totalTicketsToday,
            totalProcessedToday,
            totalWaitingNow,
            (int)(avgWaitTime / 60),
            roomStats
        );
    }

    public async Task<IEnumerable<StatisticsDto>> GetStatisticsAsync(StatisticsQueryRequest request)
    {
        var query = _context.Tickets
            .Include(t => t.Room)
            .Include(t => t.Service)
            .AsQueryable();

        if (request.StartDate.HasValue)
            query = query.Where(t => t.IssuedDate >= request.StartDate.Value);
        
        if (request.EndDate.HasValue)
            query = query.Where(t => t.IssuedDate <= request.EndDate.Value);

        if (request.ServiceId.HasValue)
            query = query.Where(t => t.ServiceId == request.ServiceId.Value);

        if (request.RoomId.HasValue)
            query = query.Where(t => t.RoomId == request.RoomId.Value);

        var tickets = await query.ToListAsync();

        var stats = tickets
            .GroupBy(t => new { t.RoomId, t.Room.RoomCode, t.ServiceId, t.Service.ServiceCode, t.IssuedDate })
            .Select(g => new StatisticsDto(
                g.Key.RoomId,
                g.Key.RoomCode,
                g.Key.ServiceId,
                g.Key.ServiceCode,
                g.Key.IssuedDate,
                g.Count(t => t.Status == TicketStatus.Done),
                g.Count(t => t.Status == TicketStatus.Passed),
                g.Count(t => t.Status == TicketStatus.Cancelled),
                (int)(g.Where(t => t.WaitTimeSeconds.HasValue).Average(t => t.WaitTimeSeconds) ?? 0),
                (int)(g.Where(t => t.ServiceTimeSeconds.HasValue).Average(t => t.ServiceTimeSeconds) ?? 0),
                0 // MaxQueueSize is harder to calc from raw tickets, usually tracked in real-time or snapshot
            ))
            .OrderBy(s => s.Date)
            .ToList();

        return stats;
    }

    public async Task<IEnumerable<HourlyStatisticsDto>> GetHourlyStatisticsAsync(StatisticsQueryRequest request)
    {
        var query = _context.Tickets.AsQueryable();

        if (request.StartDate.HasValue)
            query = query.Where(t => t.IssuedDate >= request.StartDate.Value);
        
        if (request.EndDate.HasValue)
            query = query.Where(t => t.IssuedDate <= request.EndDate.Value);

        if (request.ServiceId.HasValue)
            query = query.Where(t => t.ServiceId == request.ServiceId.Value);

        if (request.RoomId.HasValue)
            query = query.Where(t => t.RoomId == request.RoomId.Value);

        var tickets = await query.ToListAsync();

        var hourlyStats = tickets
            .GroupBy(t => t.IssuedAt.Hour)
            .Select(g => new HourlyStatisticsDto(
                g.Key,
                g.Count(),
                g.Count(t => t.Status == TicketStatus.Done),
                g.Count(t => t.Status == TicketStatus.Passed),
                g.Count(t => t.Status == TicketStatus.Cancelled)
            ))
            .OrderBy(h => h.Hour)
            .ToList();

        // Ensure all hours 7-18 are present if it's for a typical workday
        var result = new List<HourlyStatisticsDto>();
        for (int i = 7; i <= 18; i++)
        {
            var existing = hourlyStats.FirstOrDefault(h => h.Hour == i);
            result.Add(existing ?? new HourlyStatisticsDto(i, 0, 0, 0, 0));
        }

        return result;
    }

    public async Task<byte[]> ExportStatisticsToExcelAsync(StatisticsQueryRequest request)
    {
        var stats = await GetStatisticsAsync(request);
        
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Thống kê QMS");

        // Headers
        worksheet.Cell(1, 1).Value = "Ngày";
        worksheet.Cell(1, 2).Value = "Phòng";
        worksheet.Cell(1, 3).Value = "Dịch vụ";
        worksheet.Cell(1, 4).Value = "Thành công";
        worksheet.Cell(1, 5).Value = "Bỏ lượt";
        worksheet.Cell(1, 6).Value = "Hủy";
        worksheet.Cell(1, 7).Value = "TG Chờ TB (s)";
        worksheet.Cell(1, 8).Value = "TG Xử lý TB (s)";

        var headerRow = worksheet.Range("A1:H1");
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.LightBlue;

        int row = 2;
        foreach (var s in stats)
        {
            worksheet.Cell(row, 1).Value = s.Date.ToString("dd/MM/yyyy");
            worksheet.Cell(row, 2).Value = s.RoomCode;
            worksheet.Cell(row, 3).Value = s.ServiceCode;
            worksheet.Cell(row, 4).Value = s.TotalProcessed;
            worksheet.Cell(row, 5).Value = s.TotalPassed;
            worksheet.Cell(row, 6).Value = s.TotalCancelled;
            worksheet.Cell(row, 7).Value = s.AvgWaitTimeSeconds;
            worksheet.Cell(row, 8).Value = s.AvgServiceTimeSeconds;
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}

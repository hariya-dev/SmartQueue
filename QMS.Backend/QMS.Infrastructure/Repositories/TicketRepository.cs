using Microsoft.EntityFrameworkCore;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Core.Interfaces;
using QMS.Infrastructure.Data;

namespace QMS.Infrastructure.Repositories;

public class TicketRepository : Repository<Ticket>, ITicketRepository
{
    public TicketRepository(QMSDbContext context) : base(context)
    {
    }

    public async Task<Ticket?> GetByTicketNumberAsync(string ticketNumber)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _dbSet
            .Include(t => t.Service)
            .Include(t => t.Room)
            .OrderByDescending(t => t.IssuedAt)
            .FirstOrDefaultAsync(t => t.TicketNumber == ticketNumber && t.IssuedDate == today);
    }

    public async Task<IEnumerable<Ticket>> GetPendingTicketsByRoomAsync(int roomId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _dbSet
            .Where(t => t.RoomId == roomId && t.Status == TicketStatus.Pending && t.IssuedDate == today)
            .OrderBy(t => t.IssuedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetTicketsByRoomAndStatusAsync(int roomId, params TicketStatus[] statuses)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _dbSet
            .Where(t => t.RoomId == roomId && statuses.Contains(t.Status) && t.IssuedDate == today)
            .OrderBy(t => t.IssuedAt)
            .ToListAsync();
    }

    public async Task<int> GetQueueSizeByRoomAsync(int roomId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _dbSet
            .CountAsync(t => t.RoomId == roomId && t.IssuedDate == today &&
                (t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling));
    }

    public async Task<Ticket?> GetCurrentServingTicketByRoomAsync(int roomId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _dbSet
            .Include(t => t.Service)
            .FirstOrDefaultAsync(t => t.RoomId == roomId && t.IssuedDate == today &&
                (t.Status == TicketStatus.Calling || t.Status == TicketStatus.Serving));
    }

    public async Task<Ticket?> GetNextTicketAsync(int roomId, PriorityStrategy strategy, int interleaveInterval = 5)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = _dbSet
            .Where(t => t.RoomId == roomId && t.Status == TicketStatus.Pending && t.IssuedDate == today);

        return strategy switch
        {
            PriorityStrategy.Strict => await query
                .OrderByDescending(t => t.PriorityType)
                .ThenBy(t => t.IssuedAt)
                .FirstOrDefaultAsync(),
            
            PriorityStrategy.Interleaved => await GetNextInterleavedTicketAsync(query, interleaveInterval),
            
            _ => await query
                .OrderByDescending(t => t.PriorityType)
                .ThenBy(t => t.IssuedAt)
                .FirstOrDefaultAsync()
        };
    }

    private async Task<Ticket?> GetNextInterleavedTicketAsync(IQueryable<Ticket> query, int interval)
    {
        // Get recently processed tickets count (last 2 hours)
        var roomId = query.FirstOrDefault()?.RoomId ?? 0;
        var twoHoursAgo = DateTime.UtcNow.AddHours(-2);
        
        var recentDone = await _context.Tickets
            .CountAsync(t => t.RoomId == roomId && 
                t.IssuedDate == DateOnly.FromDateTime(DateTime.UtcNow) &&
                t.Status == TicketStatus.Done &&
                t.CompletedAt >= twoHoursAgo);
        
        var recentPriority = await _context.Tickets
            .CountAsync(t => t.RoomId == roomId && 
                t.IssuedDate == DateOnly.FromDateTime(DateTime.UtcNow) &&
                t.Status == TicketStatus.Done &&
                t.PriorityType == PriorityType.Priority &&
                t.CompletedAt >= twoHoursAgo);
        
        // Calculate position in current cycle
        var normalSinceLastPriority = recentDone - (recentPriority * interval);
        
        // Check if there's priority ticket waiting too long (more than interval * 5 minutes)
        var oldestPriorityWaitTime = await query
            .Where(t => t.PriorityType == PriorityType.Priority)
            .MinAsync(t => (int?)EF.Functions.DateDiffMinute(t.IssuedAt, DateTime.UtcNow));
        
        // If we've served enough normal tickets OR priority waited too long, serve priority next
        if (normalSinceLastPriority >= interval || 
            (oldestPriorityWaitTime.HasValue && oldestPriorityWaitTime.Value > interval * 2))
        {
            return await query
                .Where(t => t.PriorityType == PriorityType.Priority)
                .OrderBy(t => t.IssuedAt)
                .FirstOrDefaultAsync();
        }
        
        // Serve normal ticket
        return await query
            .Where(t => t.PriorityType == PriorityType.Normal)
            .OrderBy(t => t.IssuedAt)
            .FirstOrDefaultAsync();
    }
}

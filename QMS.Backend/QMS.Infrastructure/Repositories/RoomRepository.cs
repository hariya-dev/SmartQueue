using Microsoft.EntityFrameworkCore;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Core.Interfaces;
using QMS.Infrastructure.Data;

namespace QMS.Infrastructure.Repositories;

public class RoomRepository : Repository<Room>, IRoomRepository
{
    public RoomRepository(QMSDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Room>> GetActiveRoomsByServiceAsync(int serviceId)
    {
        return await _dbSet
            .Where(r => r.ServiceId == serviceId && r.IsActive)
            .ToListAsync();
    }

    public async Task<Room?> GetByCodeAsync(string roomCode)
    {
        return await _dbSet
            .Include(r => r.Service)
            .FirstOrDefaultAsync(r => r.RoomCode == roomCode);
    }

    public async Task<Room?> GetRoomWithLeastQueueAsync(int serviceId)
    {
        var rooms = await _dbSet
            .Where(r => r.ServiceId == serviceId && r.IsActive)
            .Select(r => new
            {
                Room = r,
                QueueSize = r.Tickets.Count(t => 
                    t.Status == TicketStatus.Pending || t.Status == TicketStatus.Calling)
            })
            .OrderBy(x => x.QueueSize)
            .FirstOrDefaultAsync();

        return rooms?.Room;
    }
}

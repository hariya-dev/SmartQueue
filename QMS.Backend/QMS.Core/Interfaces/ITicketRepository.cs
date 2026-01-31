using QMS.Core.Entities;
using QMS.Core.Enums;

namespace QMS.Core.Interfaces;

public interface ITicketRepository : IRepository<Ticket>
{
    Task<Ticket?> GetByTicketNumberAsync(string ticketNumber);
    Task<IEnumerable<Ticket>> GetPendingTicketsByRoomAsync(int roomId);
    Task<IEnumerable<Ticket>> GetTicketsByRoomAndStatusAsync(int roomId, params TicketStatus[] statuses);
    Task<int> GetQueueSizeByRoomAsync(int roomId);
    Task<Ticket?> GetCurrentServingTicketByRoomAsync(int roomId);
    Task<Ticket?> GetNextTicketAsync(int roomId, PriorityStrategy strategy, int interleaveInterval = 5);
}

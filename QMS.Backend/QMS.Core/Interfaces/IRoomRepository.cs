using QMS.Core.Entities;

namespace QMS.Core.Interfaces;

public interface IRoomRepository : IRepository<Room>
{
    Task<IEnumerable<Room>> GetActiveRoomsByServiceAsync(int serviceId);
    Task<Room?> GetByCodeAsync(string roomCode);
    Task<Room?> GetRoomWithLeastQueueAsync(int serviceId);
}

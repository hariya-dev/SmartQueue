using Microsoft.EntityFrameworkCore;
using QMS.Core.Entities;
using QMS.Core.Interfaces;
using QMS.Infrastructure.Data;

namespace QMS.Infrastructure.Repositories;

public class ServiceRepository : Repository<Service>, IServiceRepository
{
    public ServiceRepository(QMSDbContext context) : base(context)
    {
    }

    public async Task<Service?> GetByCodeAsync(string serviceCode)
    {
        return await _dbSet
            .Include(s => s.Rooms.Where(r => r.IsActive))
            .FirstOrDefaultAsync(s => s.ServiceCode == serviceCode);
    }

    public async Task<IEnumerable<Service>> GetActiveServicesAsync()
    {
        return await _dbSet
            .Where(s => s.IsActive)
            .OrderBy(s => s.DisplayOrder)
            .ToListAsync();
    }
}

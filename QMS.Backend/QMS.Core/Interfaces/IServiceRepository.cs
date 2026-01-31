using QMS.Core.Entities;

namespace QMS.Core.Interfaces;

public interface IServiceRepository : IRepository<Service>
{
    Task<Service?> GetByCodeAsync(string serviceCode);
    Task<IEnumerable<Service>> GetActiveServicesAsync();
}

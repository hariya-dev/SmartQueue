using Microsoft.EntityFrameworkCore;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data;

public class QMSDbContext : DbContext
{
    public QMSDbContext(DbContextOptions<QMSDbContext> options) : base(options)
    {
    }

    public DbSet<Service> Services => Set<Service>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<Kiosk> Kiosks => Set<Kiosk>();
    public DbSet<Printer> Printers => Set<Printer>();
    public DbSet<TVProfile> TVProfiles => Set<TVProfile>();
    public DbSet<TVProfileRoom> TVProfileRooms => Set<TVProfileRoom>();
    public DbSet<PostProcessBranch> PostProcessBranches => Set<PostProcessBranch>();
    public DbSet<ServiceRoomBranchRule> ServiceRoomBranchRules => Set<ServiceRoomBranchRule>();
    public DbSet<TicketSequence> TicketSequences => Set<TicketSequence>();
    public DbSet<PrioritySetting> PrioritySettings => Set<PrioritySetting>();
    public DbSet<QueueStatistic> QueueStatistics => Set<QueueStatistic>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<WorkingSession> WorkingSessions => Set<WorkingSession>();
    public DbSet<TVAd> TVAds => Set<TVAd>();
    public DbSet<PrintHistory> PrintHistories => Set<PrintHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(QMSDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}

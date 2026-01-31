using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class QueueStatisticConfiguration : IEntityTypeConfiguration<QueueStatistic>
{
    public void Configure(EntityTypeBuilder<QueueStatistic> builder)
    {
        builder.HasKey(q => q.StatId);
        
        builder.HasIndex(q => new { q.RoomId, q.StatDate, q.StatHour })
            .IsUnique();
            
        builder.HasIndex(q => q.StatDate);
            
        builder.HasOne(q => q.Room)
            .WithMany()
            .HasForeignKey(q => q.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(q => q.Service)
            .WithMany()
            .HasForeignKey(q => q.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

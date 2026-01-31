using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class PrioritySettingConfiguration : IEntityTypeConfiguration<PrioritySetting>
{
    public void Configure(EntityTypeBuilder<PrioritySetting> builder)
    {
        builder.HasKey(p => p.PrioritySettingId);
            
        builder.HasOne(p => p.Service)
            .WithMany(s => s.PrioritySettings)
            .HasForeignKey(p => p.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(p => p.Room)
            .WithMany(r => r.PrioritySettings)
            .HasForeignKey(p => p.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.HasKey(s => s.ServiceId);
        
        builder.Property(s => s.ServiceCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(s => s.ServiceName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.HasIndex(s => s.ServiceCode)
            .IsUnique();
            
        builder.HasMany(s => s.Rooms)
            .WithOne(r => r.Service)
            .HasForeignKey(r => r.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

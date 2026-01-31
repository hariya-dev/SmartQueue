using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.HasKey(r => r.RoomId);
        
        builder.Property(r => r.RoomCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(r => r.RoomName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.HasIndex(r => r.RoomCode)
            .IsUnique();
            
        builder.HasIndex(r => new { r.ServiceId, r.IsActive });
            
        builder.HasMany(r => r.Tickets)
            .WithOne(t => t.Room)
            .HasForeignKey(t => t.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

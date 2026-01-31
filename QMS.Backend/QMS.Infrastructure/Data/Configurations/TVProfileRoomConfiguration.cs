using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class TVProfileRoomConfiguration : IEntityTypeConfiguration<TVProfileRoom>
{
    public void Configure(EntityTypeBuilder<TVProfileRoom> builder)
    {
        builder.HasKey(t => t.TVProfileRoomId);
        
        builder.HasIndex(t => new { t.TVProfileId, t.RoomId })
            .IsUnique();
            
        builder.HasOne(t => t.TVProfile)
            .WithMany(p => p.TVProfileRooms)
            .HasForeignKey(t => t.TVProfileId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(t => t.Room)
            .WithMany(r => r.TVProfileRooms)
            .HasForeignKey(t => t.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

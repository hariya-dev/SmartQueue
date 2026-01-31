using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.UserId);
        
        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(u => u.RefreshToken)
            .HasMaxLength(256);

        builder.Property(u => u.AreaCode)
            .HasMaxLength(50);
            
        builder.HasIndex(u => u.Username)
            .IsUnique();
            
        builder.HasOne(u => u.Room)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoomId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(u => u.Printer)
            .WithMany(p => p.Users)
            .HasForeignKey(u => u.PrinterId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

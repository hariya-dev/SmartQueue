using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(a => a.AuditLogId);
        
        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(a => a.Details)
            .HasColumnType("text");
            
        builder.Property(a => a.IPAddress)
            .HasMaxLength(50);
            
        builder.HasIndex(a => new { a.EntityType, a.EntityId, a.CreatedAt });
        
        builder.HasIndex(a => a.CreatedAt);
            
        builder.HasOne(a => a.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

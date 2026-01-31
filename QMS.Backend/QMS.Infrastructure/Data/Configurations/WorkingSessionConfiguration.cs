using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class WorkingSessionConfiguration : IEntityTypeConfiguration<WorkingSession>
{
    public void Configure(EntityTypeBuilder<WorkingSession> builder)
    {
        builder.HasKey(w => w.WorkingSessionId);
        
        builder.Property(w => w.SessionName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(w => w.StartTime)
            .IsRequired();
            
        builder.Property(w => w.EndTime)
            .IsRequired();
    }
}

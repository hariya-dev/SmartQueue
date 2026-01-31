using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class TicketSequenceConfiguration : IEntityTypeConfiguration<TicketSequence>
{
    public void Configure(EntityTypeBuilder<TicketSequence> builder)
    {
        builder.HasKey(t => t.SequenceId);
        
        builder.HasIndex(t => new { t.ServiceId, t.SequenceDate })
            .IsUnique();
            
        builder.HasOne(t => t.Service)
            .WithMany(s => s.TicketSequences)
            .HasForeignKey(t => t.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.HasKey(t => t.TicketId);
        
        builder.Property(t => t.TicketNumber)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.HasIndex(t => new { t.TicketNumber, t.IssuedDate })
            .IsUnique();
            
        builder.HasIndex(t => new { t.ServiceId, t.RoomId, t.Status, t.IssuedDate });
        
        builder.HasIndex(t => new { t.RoomId, t.Status, t.IssuedDate });
        
        builder.HasIndex(t => t.IssuedDate);
        
        builder.HasOne(t => t.Service)
            .WithMany(s => s.Tickets)
            .HasForeignKey(t => t.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(t => t.Room)
            .WithMany(r => r.Tickets)
            .HasForeignKey(t => t.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(t => t.Kiosk)
            .WithMany(k => k.Tickets)
            .HasForeignKey(t => t.KioskId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(t => t.Printer)
            .WithMany(p => p.Tickets)
            .HasForeignKey(t => t.PrinterId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(t => t.PostProcessBranch)
            .WithMany(b => b.Tickets)
            .HasForeignKey(t => t.PostProcessBranchId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(t => t.CalledByUser)
            .WithMany(u => u.CalledTickets)
            .HasForeignKey(t => t.CalledByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class KioskConfiguration : IEntityTypeConfiguration<Kiosk>
{
    public void Configure(EntityTypeBuilder<Kiosk> builder)
    {
        builder.HasKey(k => k.KioskId);
        
        builder.Property(k => k.KioskCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(k => k.KioskName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(k => k.Location)
            .HasMaxLength(200);
            
        builder.HasIndex(k => k.KioskCode)
            .IsUnique();
            
        builder.HasOne(k => k.DefaultPrinter)
            .WithMany(p => p.Kiosks)
            .HasForeignKey(k => k.DefaultPrinterId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

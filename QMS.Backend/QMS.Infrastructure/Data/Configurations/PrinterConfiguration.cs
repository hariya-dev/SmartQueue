using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class PrinterConfiguration : IEntityTypeConfiguration<Printer>
{
    public void Configure(EntityTypeBuilder<Printer> builder)
    {
        builder.HasKey(p => p.PrinterId);
        
        builder.Property(p => p.PrinterCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(p => p.PrinterName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(p => p.PrinterType)
            .HasMaxLength(50);
            
        builder.Property(p => p.ConnectionType)
            .HasMaxLength(50);
            
        builder.Property(p => p.IpAddress)
            .HasMaxLength(100);
            
        builder.Property(p => p.Location)
            .HasMaxLength(200);
            
        builder.Property(p => p.AreaCode)
            .HasMaxLength(50);
            
        builder.HasIndex(p => p.PrinterCode)
            .IsUnique();
            
        builder.HasIndex(p => p.AreaCode);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations
{
    public class PrintHistoryConfiguration : IEntityTypeConfiguration<PrintHistory>
    {
        public void Configure(EntityTypeBuilder<PrintHistory> builder)
        {
            builder.HasKey(p => p.PrintHistoryId);

            builder.Property(p => p.TicketNumber)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(p => p.PrinterName)
                .HasMaxLength(200);

            builder.Property(p => p.PrinterIp)
                .HasMaxLength(50);

            builder.Property(p => p.ErrorMessage)
                .HasMaxLength(1000);

            builder.Property(p => p.PrintedByUserName)
                .HasMaxLength(200);

            builder.HasOne(p => p.Ticket)
                .WithMany()
                .HasForeignKey(p => p.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.ToTable("PrintHistories");
        }
    }
}

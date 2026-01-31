using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class TVProfileConfiguration : IEntityTypeConfiguration<TVProfile>
{
    public void Configure(EntityTypeBuilder<TVProfile> builder)
    {
        builder.HasKey(t => t.TVProfileId);
        
        builder.Property(t => t.TVCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(t => t.TVName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.HasIndex(t => t.TVCode)
            .IsUnique();
    }
}

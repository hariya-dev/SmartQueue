using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class PostProcessBranchConfiguration : IEntityTypeConfiguration<PostProcessBranch>
{
    public void Configure(EntityTypeBuilder<PostProcessBranch> builder)
    {
        builder.HasKey(p => p.PostProcessBranchId);
        
        builder.Property(p => p.BranchCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(p => p.BranchName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.HasIndex(p => p.BranchCode)
            .IsUnique();
    }
}

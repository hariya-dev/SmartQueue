using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QMS.Core.Entities;

namespace QMS.Infrastructure.Data.Configurations;

public class ServiceRoomBranchRuleConfiguration : IEntityTypeConfiguration<ServiceRoomBranchRule>
{
    public void Configure(EntityTypeBuilder<ServiceRoomBranchRule> builder)
    {
        builder.HasKey(r => r.RuleId);
        
        builder.HasOne(r => r.Service)
            .WithMany()
            .HasForeignKey(r => r.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(r => r.Room)
            .WithMany()
            .HasForeignKey(r => r.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(r => r.PostProcessBranch)
            .WithMany(b => b.BranchRules)
            .HasForeignKey(r => r.PostProcessBranchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

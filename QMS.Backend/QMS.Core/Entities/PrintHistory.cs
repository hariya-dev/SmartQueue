using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using QMS.Core.Enums;

namespace QMS.Core.Entities
{
    public class PrintHistory : BaseEntity
    {
        [Key]
        public long PrintHistoryId { get; set; }

        public long TicketId { get; set; }
        public string TicketNumber { get; set; } = string.Empty;

        public int? PrinterId { get; set; }
        public string? PrinterName { get; set; }
        public string? PrinterIp { get; set; }

        public PrintType PrintType { get; set; }
        public PrintStatus PrintStatus { get; set; }
        public string? ErrorMessage { get; set; }

        public DateTime PrintedAt { get; set; } = DateTime.UtcNow;

        public int? PrintedByUserId { get; set; }
        public string? PrintedByUserName { get; set; }

        // Navigation property
        [ForeignKey(nameof(TicketId))]
        public virtual Ticket? Ticket { get; set; }
    }

    public enum PrintType
    {
        Manual = 0,
        Auto = 1,
        Reprint = 2
    }

    public enum PrintStatus
    {
        Success = 0,
        Failed = 1,
        Pending = 2
    }
}

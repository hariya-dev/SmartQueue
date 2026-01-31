using QMS.Core.Enums;

namespace QMS.Application.DTOs;

public record KioskDto(
    int KioskId,
    string KioskCode,
    string KioskName,
    string? Location,
    int? DefaultPrinterId,
    string? DefaultPrinterName,
    bool IsActive,
    DateTime? LastHeartbeat
);

public record CreateKioskRequest(
    string KioskCode,
    string KioskName,
    string? Location,
    int? DefaultPrinterId
);

public record PrinterDto(
    int PrinterId,
    string PrinterCode,
    string PrinterName,
    string? PrinterType,
    string? ConnectionType,
    string? IpAddress,
    string? Location,
    string? AreaCode,
    bool IsActive,
    PrinterStatus Status,
    DateTime? LastHealthCheck
);

public record CreatePrinterRequest(
    string PrinterCode,
    string PrinterName,
    string? PrinterType,
    string? ConnectionType,
    string? IpAddress,
    string? Location,
    string? AreaCode
);

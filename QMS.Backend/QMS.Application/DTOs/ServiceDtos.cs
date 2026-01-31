namespace QMS.Application.DTOs;

public record ServiceDto(
    int ServiceId,
    string ServiceCode,
    string ServiceName,
    bool IsActive,
    int DisplayOrder,
    int RoomCount
);

public record CreateServiceRequest(
    string ServiceCode,
    string ServiceName,
    int DisplayOrder
);

public record UpdateServiceRequest(
    string ServiceName,
    bool IsActive,
    int DisplayOrder
);

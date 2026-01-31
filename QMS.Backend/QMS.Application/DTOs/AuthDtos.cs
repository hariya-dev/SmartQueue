using QMS.Core.Enums;

namespace QMS.Application.DTOs;

public record LoginRequest(
    string Username,
    string Password
);

public record LoginResponse(
    int UserId,
    string Username,
    string FullName,
    UserRole Role,
    int? RoomId,
    string? RoomCode,
    int? PrinterId,
    string? PrinterName,
    string? AreaCode,
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt
);

public record RefreshTokenRequest(
    string RefreshToken
);

public record UserDto(
    int UserId,
    string Username,
    string FullName,
    UserRole Role,
    int? RoomId,
    string? RoomCode,
    int? PrinterId,
    string? PrinterName,
    string? AreaCode,
    bool IsActive
);

public record CreateUserRequest(
    string Username,
    string Password,
    string FullName,
    UserRole Role,
    int? RoomId,
    int? PrinterId,
    string? AreaCode
);

public record UpdateUserRequest(
    string FullName,
    UserRole Role,
    int? RoomId,
    int? PrinterId,
    string? AreaCode,
    bool IsActive
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record ResetPasswordRequest(
    string NewPassword
);

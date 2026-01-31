using QMS.Application.DTOs;
using QMS.Core.Enums;

namespace QMS.Application.Services;

public interface IStatisticsService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<IEnumerable<StatisticsDto>> GetStatisticsAsync(StatisticsQueryRequest request);
    Task<IEnumerable<HourlyStatisticsDto>> GetHourlyStatisticsAsync(StatisticsQueryRequest request);
    Task<byte[]> ExportStatisticsToExcelAsync(StatisticsQueryRequest request);
}

public interface IPrintService
{
    Task PrintTicketAsync(IssueTicketResponse ticket, string ipAddress);
}

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RefreshTokenAsync(string token, string refreshToken);
    Task<IEnumerable<UserDto>> GetUsersAsync();
    Task<UserDto> GetUserByIdAsync(int id);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDto> UpdateUserAsync(int id, UpdateUserRequest request);
    Task DeleteUserAsync(int id);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task ResetPasswordAsync(int userId, ResetPasswordRequest request);
}

public interface ITicketService
{
    Task<IssueTicketResponse> IssueTicketAsync(IssueTicketRequest request);
    Task<TicketDto?> GetTicketByNumberAsync(string ticketNumber);
    Task<TicketDto?> GetTicketByIdAsync(long ticketId);
    Task<TicketStatusDto> GetTicketStatusAsync(string ticketNumber);
    Task<IEnumerable<TicketDto>> GetTicketsByRoomAsync(int roomId, TicketStatus? status = null);
    Task<IEnumerable<ServiceQueueDetailDto>> GetServiceQueueDetailsAsync();
}

public interface ICallingService
{
    Task<CallNextResponse?> CallNextAsync(CallingDeskRequest request);
    Task<CallNextResponse?> RecallAsync(CallingDeskRequest request);
    Task<bool> PassAsync(PassTicketRequest request);
    Task<bool> DoneAsync(DoneTicketRequest request);
    Task<bool> ReturnToQueueAsync(long ticketId);
    Task<bool> TogglePriorityAsync(long ticketId);
    Task<bool> TransferAsync(TransferTicketRequest request);
    Task<CallingDeskStateDto> GetCallingDeskStateAsync(int roomId);
    Task<CurrentTicketDto?> GetCurrentTicketAsync(int roomId);
    Task<IEnumerable<TicketDto>> GetQueueAsync(int roomId);
}

public interface IQueueService
{
    Task<QueueStatusDto> GetQueueStatusAsync(int roomId);
    Task<IEnumerable<RoomQueueDto>> GetRoomQueuesAsync(int? serviceId = null);
    Task<IEnumerable<RoomQueueDetailDto>> GetDetailedRoomQueuesAsync(int? serviceId = null);
    Task<TVDisplayDto> GetTVDisplayAsync(int tvProfileId);
}

public interface INotificationService
{
    Task NotifyTicketCalledAsync(TicketCalledEvent ticketEvent);
    Task NotifyQueueUpdatedAsync(QueueUpdatedEvent queueEvent);
    Task NotifyTicketStatusChangedAsync(TicketStatusChangedEvent statusEvent);
    Task NotifyTVProfileUpdatedAsync(int tvProfileId);
}

public interface IPrintHistoryService
{
    Task<IEnumerable<PrintHistoryDto>> GetPrintHistoryAsync(DateTime? fromDate = null, DateTime? toDate = null, int? printerId = null);
    Task<PrintHistoryDto?> GetPrintHistoryByIdAsync(long printHistoryId);
    Task<PrintHistoryDto> AddPrintHistoryAsync(PrintHistoryDto dto);
    Task<bool> ReprintTicketAsync(long printHistoryId, int printerId);
    Task<int> GetTodayPrintCountAsync();
}

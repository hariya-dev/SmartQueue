using Microsoft.AspNetCore.SignalR;
using QMS.API.Hubs;
using QMS.Application.DTOs;
using QMS.Application.Services;

namespace QMS.API.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<QueueHub> _hubContext;

    public NotificationService(IHubContext<QueueHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyTicketCalledAsync(TicketCalledEvent ticketEvent)
    {
        await _hubContext.Clients.Group("AllRooms").SendAsync("TicketCalled", ticketEvent);
        
        await _hubContext.Clients.Group($"Ticket_{ticketEvent.TicketNumber}").SendAsync("TicketCalled", ticketEvent);
        
        await _hubContext.Clients.Group("Dashboard").SendAsync("TicketCalled", ticketEvent);
    }

    public async Task NotifyQueueUpdatedAsync(QueueUpdatedEvent queueEvent)
    {
        await _hubContext.Clients.Group($"Room_{queueEvent.RoomId}").SendAsync("QueueUpdated", queueEvent);
        
        await _hubContext.Clients.Group("Dashboard").SendAsync("QueueUpdated", queueEvent);
        
        await _hubContext.Clients.Group("AllRooms").SendAsync("QueueUpdated", queueEvent);
    }

    public async Task NotifyTicketStatusChangedAsync(TicketStatusChangedEvent statusEvent)
    {
        await _hubContext.Clients.Group($"Ticket_{statusEvent.TicketNumber}").SendAsync("TicketStatusChanged", statusEvent);
        
        await _hubContext.Clients.Group("Dashboard").SendAsync("TicketStatusChanged", statusEvent);
        
        await _hubContext.Clients.Group("AllRooms").SendAsync("TicketStatusChanged", statusEvent);
    }

    public async Task NotifyTVProfileUpdatedAsync(int tvProfileId)
    {
        await _hubContext.Clients.Group($"TV_{tvProfileId}").SendAsync("QueueUpdated");
    }
}

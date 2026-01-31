using Microsoft.AspNetCore.SignalR;

namespace QMS.API.Hubs;

public class QueueHub : Hub
{
    public async Task JoinRoom(int roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Room_{roomId}");
    }

    public async Task LeaveRoom(int roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Room_{roomId}");
    }

    public async Task JoinTVProfile(int tvProfileId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"TV_{tvProfileId}");
    }

    public async Task LeaveTVProfile(int tvProfileId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"TV_{tvProfileId}");
    }

    public async Task JoinKiosk(int kioskId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Kiosk_{kioskId}");
    }

    public async Task LeaveKiosk(int kioskId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Kiosk_{kioskId}");
    }

    public async Task SubscribeToTicket(string ticketNumber)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Ticket_{ticketNumber}");
    }

    public async Task UnsubscribeFromTicket(string ticketNumber)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Ticket_{ticketNumber}");
    }

    public async Task JoinDashboard()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Dashboard");
    }

    public async Task LeaveDashboard()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Dashboard");
    }

    public async Task JoinAllRooms()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AllRooms");
    }

    public async Task LeaveAllRooms()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AllRooms");
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}

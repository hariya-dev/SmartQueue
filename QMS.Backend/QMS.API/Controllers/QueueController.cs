using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QMS.Application.DTOs;
using QMS.Application.Services;

namespace QMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class QueueController : ControllerBase
{
    private readonly IQueueService _queueService;

    public QueueController(IQueueService queueService)
    {
        _queueService = queueService;
    }

    [AllowAnonymous]
    [HttpGet("status/{roomId}")]
    public async Task<ActionResult<QueueStatusDto>> GetQueueStatus(int roomId)
    {
        try
        {
            var status = await _queueService.GetQueueStatusAsync(roomId);
            return Ok(status);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Doctor,Kiosk,TicketIssuer")]
    [HttpGet("rooms")]
    public async Task<ActionResult<IEnumerable<RoomQueueDto>>> GetRoomQueues([FromQuery] int? serviceId = null)
    {
        var queues = await _queueService.GetRoomQueuesAsync(serviceId);
        return Ok(queues);
    }

    [Authorize(Roles = "Admin,Doctor")]
    [HttpGet("rooms/detailed")]
    public async Task<ActionResult<IEnumerable<RoomQueueDetailDto>>> GetDetailedRoomQueues([FromQuery] int? serviceId = null)
    {
        var queues = await _queueService.GetDetailedRoomQueuesAsync(serviceId);
        return Ok(queues);
    }

    [AllowAnonymous]
    [HttpGet("tv/{tvProfileId}")]
    public async Task<ActionResult<TVDisplayDto>> GetTVDisplay(int tvProfileId)
    {
        try
        {
            var display = await _queueService.GetTVDisplayAsync(tvProfileId);
            return Ok(display);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}

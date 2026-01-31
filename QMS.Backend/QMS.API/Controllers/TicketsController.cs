using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QMS.Application.DTOs;
using QMS.Application.Services;
using QMS.Core.Enums;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin,Doctor,Kiosk,TicketIssuer")]
[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpPost("issue")]
    public async Task<ActionResult<IssueTicketResponse>> IssueTicket([FromBody] IssueTicketRequest request)
    {
        try
        {
            var result = await _ticketService.IssueTicketAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{ticketNumber}")]
    public async Task<ActionResult<TicketDto>> GetTicket(string ticketNumber)
    {
        var ticket = await _ticketService.GetTicketByNumberAsync(ticketNumber);
        if (ticket == null)
            return NotFound(new { error = $"Ticket not found: {ticketNumber}" });
        
        return Ok(ticket);
    }

    [HttpGet("{ticketNumber}/status")]
    public async Task<ActionResult<TicketStatusDto>> GetTicketStatus(string ticketNumber)
    {
        try
        {
            var status = await _ticketService.GetTicketStatusAsync(ticketNumber);
            return Ok(status);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByRoom(
        int roomId, 
        [FromQuery] TicketStatus? status = null)
    {
        var tickets = await _ticketService.GetTicketsByRoomAsync(roomId, status);
        return Ok(tickets);
    }

    [HttpGet("queue-details")]
    public async Task<ActionResult<IEnumerable<ServiceQueueDetailDto>>> GetQueueDetails()
    {
        var details = await _ticketService.GetServiceQueueDetailsAsync();
        return Ok(details);
    }
}

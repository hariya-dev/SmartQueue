using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QMS.Application.DTOs;
using QMS.Application.Services;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin,Doctor,Kiosk")]
[ApiController]
[Route("api/calling-desk")]
public class CallingDeskController : ControllerBase
{
    private readonly ICallingService _callingService;

    public CallingDeskController(ICallingService callingService)
    {
        _callingService = callingService;
    }

    [HttpPost("next")]
    public async Task<ActionResult<CallNextResponse>> CallNext([FromBody] CallingDeskRequest request)
    {
        try
        {
            var result = await _callingService.CallNextAsync(request);
            if (result == null)
                return Ok(new { message = "No tickets in queue" });
            
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("recall")]
    public async Task<ActionResult<CallNextResponse>> Recall([FromBody] CallingDeskRequest request)
    {
        try
        {
            var result = await _callingService.RecallAsync(request);
            if (result == null)
                return Ok(new { message = "No current ticket to recall" });
            
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("pass")]
    public async Task<ActionResult> Pass([FromBody] PassTicketRequest request)
    {
        try
        {
            await _callingService.PassAsync(request);
            return Ok(new { message = "Ticket passed successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("done")]
    public async Task<ActionResult> Done([FromBody] DoneTicketRequest request)
    {
        try
        {
            await _callingService.DoneAsync(request);
            return Ok(new { message = "Ticket completed successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("return-to-queue/{ticketId}")]
    public async Task<ActionResult> ReturnToQueue(long ticketId)
    {
        try
        {
            await _callingService.ReturnToQueueAsync(ticketId);
            return Ok(new { message = "Ticket returned to queue successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("transfer")]
    public async Task<ActionResult> Transfer([FromBody] TransferTicketRequest request)
    {
        try
        {
            await _callingService.TransferAsync(request);
            return Ok(new { message = "Ticket transferred successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("toggle-priority/{ticketId}")]
    public async Task<ActionResult> TogglePriority(long ticketId)
    {
        try
        {
            await _callingService.TogglePriorityAsync(ticketId);
            return Ok(new { message = "Ticket priority toggled successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("current/{roomId}")]
    public async Task<ActionResult<CurrentTicketDto>> GetCurrentTicket(int roomId)
    {
        var ticket = await _callingService.GetCurrentTicketAsync(roomId);
        if (ticket == null)
            return Ok(new { message = "No current ticket" });
        
        return Ok(ticket);
    }

    [HttpGet("state/{roomId}")]
    public async Task<ActionResult<CallingDeskStateDto>> GetState(int roomId)
    {
        var state = await _callingService.GetCallingDeskStateAsync(roomId);
        return Ok(state);
    }

    [HttpGet("queue/{roomId}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetQueue(int roomId)
    {
        var tickets = await _callingService.GetQueueAsync(roomId);
        return Ok(tickets);
    }
}

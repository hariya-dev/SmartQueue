using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QMS.Application.DTOs;
using QMS.Application.Services;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin,TicketIssuer,Kiosk")]
[ApiController]
[Route("api/[controller]")]
public class PrintHistoryController : ControllerBase
{
    private readonly IPrintHistoryService _printHistoryService;

    public PrintHistoryController(IPrintHistoryService printHistoryService)
    {
        _printHistoryService = printHistoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PrintHistoryDto>>> GetPrintHistory(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int? printerId)
    {
        var results = await _printHistoryService.GetPrintHistoryAsync(fromDate, toDate, printerId);
        return Ok(results);
    }

    [HttpGet("today-count")]
    public async Task<ActionResult<int>> GetTodayPrintCount()
    {
        var count = await _printHistoryService.GetTodayPrintCountAsync();
        return Ok(count);
    }

    [HttpGet("{printHistoryId}")]
    public async Task<ActionResult<PrintHistoryDto>> GetPrintHistoryById(long printHistoryId)
    {
        var result = await _printHistoryService.GetPrintHistoryByIdAsync(printHistoryId);
        if (result == null)
            return NotFound(new { error = $"Print history not found: {printHistoryId}" });
        
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PrintHistoryDto>> AddPrintHistory([FromBody] PrintHistoryDto dto)
    {
        var result = await _printHistoryService.AddPrintHistoryAsync(dto);
        return CreatedAtAction(nameof(GetPrintHistoryById), new { printHistoryId = result.PrintHistoryId }, result);
    }

    [HttpPost("{printHistoryId}/reprint")]
    public async Task<ActionResult> ReprintTicket(long printHistoryId, [FromQuery] int printerId)
    {
        var success = await _printHistoryService.ReprintTicketAsync(printHistoryId, printerId);
        if (!success)
            return BadRequest(new { error = "Failed to reprint ticket" });
        
        return Ok(new { message = "Ticket reprinted successfully" });
    }
}

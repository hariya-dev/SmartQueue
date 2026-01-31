using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Core.Entities;
using QMS.Core.Enums;
using QMS.Infrastructure.Data;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin,Kiosk,TicketIssuer")]
[ApiController]
[Route("api/[controller]")]
public class PrintersController : ControllerBase
{
    private readonly QMSDbContext _context;

    public PrintersController(QMSDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PrinterDto>>> GetPrinters(
        [FromQuery] string? areaCode = null,
        [FromQuery] PrinterStatus? status = null)
    {
        var query = _context.Printers.AsQueryable();

        if (!string.IsNullOrEmpty(areaCode))
            query = query.Where(p => p.AreaCode == areaCode);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        var printers = await query
            .Select(p => new PrinterDto(
                p.PrinterId,
                p.PrinterCode,
                p.PrinterName,
                p.PrinterType,
                p.ConnectionType,
                p.IpAddress,
                p.Location,
                p.AreaCode,
                p.IsActive,
                p.Status,
                p.LastHealthCheck
            ))
            .ToListAsync();

        return Ok(printers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PrinterDto>> GetPrinter(int id)
    {
        var printer = await _context.Printers
            .Where(p => p.PrinterId == id)
            .Select(p => new PrinterDto(
                p.PrinterId,
                p.PrinterCode,
                p.PrinterName,
                p.PrinterType,
                p.ConnectionType,
                p.IpAddress,
                p.Location,
                p.AreaCode,
                p.IsActive,
                p.Status,
                p.LastHealthCheck
            ))
            .FirstOrDefaultAsync();

        if (printer == null)
            return NotFound(new { error = $"Printer not found: {id}" });

        return Ok(printer);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<PrinterDto>> CreatePrinter([FromBody] CreatePrinterRequest request)
    {
        if (await _context.Printers.AnyAsync(p => p.PrinterCode == request.PrinterCode))
            return BadRequest(new { error = $"Printer code already exists: {request.PrinterCode}" });

        var printer = new Printer
        {
            PrinterCode = request.PrinterCode,
            PrinterName = request.PrinterName,
            PrinterType = request.PrinterType,
            ConnectionType = request.ConnectionType,
            IpAddress = request.IpAddress,
            Location = request.Location,
            AreaCode = request.AreaCode,
            IsActive = true,
            Status = PrinterStatus.Offline
        };

        _context.Printers.Add(printer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPrinter), new { id = printer.PrinterId }, new PrinterDto(
            printer.PrinterId,
            printer.PrinterCode,
            printer.PrinterName,
            printer.PrinterType,
            printer.ConnectionType,
            printer.IpAddress,
            printer.Location,
            printer.AreaCode,
            printer.IsActive,
            printer.Status,
            printer.LastHealthCheck
        ));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePrinter(int id, [FromBody] CreatePrinterRequest request)
    {
        var printer = await _context.Printers.FindAsync(id);
        if (printer == null)
            return NotFound(new { error = $"Printer not found: {id}" });

        if (await _context.Printers.AnyAsync(p => p.PrinterCode == request.PrinterCode && p.PrinterId != id))
            return BadRequest(new { error = $"Printer code already exists: {request.PrinterCode}" });

        printer.PrinterCode = request.PrinterCode;
        printer.PrinterName = request.PrinterName;
        printer.PrinterType = request.PrinterType;
        printer.ConnectionType = request.ConnectionType;
        printer.IpAddress = request.IpAddress;
        printer.Location = request.Location;
        printer.AreaCode = request.AreaCode;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePrinter(int id)
    {
        var printer = await _context.Printers.FindAsync(id);
        if (printer == null)
            return NotFound(new { error = $"Printer not found: {id}" });

        _context.Printers.Remove(printer);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/health-check")]
    public async Task<ActionResult> HealthCheck(int id)
    {
        var printer = await _context.Printers.FindAsync(id);
        if (printer == null)
            return NotFound(new { error = $"Printer not found: {id}" });

        printer.LastHealthCheck = DateTime.UtcNow;
        printer.Status = PrinterStatus.Online;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Printer is online", status = printer.Status });
    }
}

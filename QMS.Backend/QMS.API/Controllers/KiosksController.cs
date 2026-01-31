using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Core.Entities;
using QMS.Infrastructure.Data;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin,Kiosk")]
[ApiController]
[Route("api/[controller]")]
public class KiosksController : ControllerBase
{
    private readonly QMSDbContext _context;

    public KiosksController(QMSDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<KioskDto>>> GetKiosks()
    {
        var kiosks = await _context.Kiosks
            .Include(k => k.DefaultPrinter)
            .Select(k => new KioskDto(
                k.KioskId,
                k.KioskCode,
                k.KioskName,
                k.Location,
                k.DefaultPrinterId,
                k.DefaultPrinter != null ? k.DefaultPrinter.PrinterName : null,
                k.IsActive,
                k.LastHeartbeat
            ))
            .ToListAsync();

        return Ok(kiosks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<KioskDto>> GetKiosk(int id)
    {
        var kiosk = await _context.Kiosks
            .Include(k => k.DefaultPrinter)
            .Where(k => k.KioskId == id)
            .Select(k => new KioskDto(
                k.KioskId,
                k.KioskCode,
                k.KioskName,
                k.Location,
                k.DefaultPrinterId,
                k.DefaultPrinter != null ? k.DefaultPrinter.PrinterName : null,
                k.IsActive,
                k.LastHeartbeat
            ))
            .FirstOrDefaultAsync();

        if (kiosk == null)
            return NotFound(new { error = $"Kiosk not found: {id}" });

        return Ok(kiosk);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<KioskDto>> CreateKiosk([FromBody] CreateKioskRequest request)
    {
        if (await _context.Kiosks.AnyAsync(k => k.KioskCode == request.KioskCode))
            return BadRequest(new { error = $"Kiosk code already exists: {request.KioskCode}" });

        var kiosk = new Kiosk
        {
            KioskCode = request.KioskCode,
            KioskName = request.KioskName,
            Location = request.Location,
            DefaultPrinterId = request.DefaultPrinterId,
            IsActive = true
        };

        _context.Kiosks.Add(kiosk);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetKiosk), new { id = kiosk.KioskId }, new KioskDto(
            kiosk.KioskId,
            kiosk.KioskCode,
            kiosk.KioskName,
            kiosk.Location,
            kiosk.DefaultPrinterId,
            null,
            kiosk.IsActive,
            kiosk.LastHeartbeat
        ));
    }

    [HttpPost("{id}/heartbeat")]
    public async Task<ActionResult> Heartbeat(int id)
    {
        var kiosk = await _context.Kiosks.FindAsync(id);
        if (kiosk == null)
            return NotFound(new { error = $"Kiosk not found: {id}" });

        kiosk.LastHeartbeat = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Heartbeat recorded" });
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QMS.Application.DTOs;
using QMS.Core.Entities;
using QMS.Infrastructure.Data;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly QMSDbContext _context;

    public ServicesController(QMSDbContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices([FromQuery] bool? activeOnly = true)
    {
        var query = _context.Services.AsQueryable();
        
        if (activeOnly == true)
            query = query.Where(s => s.IsActive);
        
        var services = await query
            .OrderBy(s => s.DisplayOrder)
            .Select(s => new ServiceDto(
                s.ServiceId,
                s.ServiceCode,
                s.ServiceName,
                s.IsActive,
                s.DisplayOrder,
                s.Rooms.Count(r => r.IsActive)
            ))
            .ToListAsync();

        return Ok(services);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceDto>> GetService(int id)
    {
        var service = await _context.Services
            .Where(s => s.ServiceId == id)
            .Select(s => new ServiceDto(
                s.ServiceId,
                s.ServiceCode,
                s.ServiceName,
                s.IsActive,
                s.DisplayOrder,
                s.Rooms.Count(r => r.IsActive)
            ))
            .FirstOrDefaultAsync();

        if (service == null)
            return NotFound(new { error = $"Service not found: {id}" });

        return Ok(service);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceDto>> CreateService([FromBody] CreateServiceRequest request)
    {
        if (await _context.Services.AnyAsync(s => s.ServiceCode == request.ServiceCode))
            return BadRequest(new { error = $"Service code already exists: {request.ServiceCode}" });

        var service = new Service
        {
            ServiceCode = request.ServiceCode,
            ServiceName = request.ServiceName,
            DisplayOrder = request.DisplayOrder,
            IsActive = true
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetService), new { id = service.ServiceId }, new ServiceDto(
            service.ServiceId,
            service.ServiceCode,
            service.ServiceName,
            service.IsActive,
            service.DisplayOrder,
            0
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateService(int id, [FromBody] UpdateServiceRequest request)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            return NotFound(new { error = $"Service not found: {id}" });

        service.ServiceName = request.ServiceName;
        service.IsActive = request.IsActive;
        service.DisplayOrder = request.DisplayOrder;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteService(int id)
    {
        var service = await _context.Services
            .Include(s => s.Rooms)
            .FirstOrDefaultAsync(s => s.ServiceId == id);

        if (service == null)
            return NotFound(new { error = $"Service not found: {id}" });

        if (service.Rooms.Any())
            return BadRequest(new { error = "Cannot delete service with existing rooms" });

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

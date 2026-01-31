using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QMS.Application.DTOs;
using QMS.Application.Services;

namespace QMS.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class StatisticsController : ControllerBase
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var stats = await _statisticsService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StatisticsDto>>> GetStatistics([FromQuery] StatisticsQueryRequest request)
    {
        var stats = await _statisticsService.GetStatisticsAsync(request);
        return Ok(stats);
    }

    [HttpGet("hourly")]
    public async Task<ActionResult<IEnumerable<HourlyStatisticsDto>>> GetHourlyStatistics([FromQuery] StatisticsQueryRequest request)
    {
        var stats = await _statisticsService.GetHourlyStatisticsAsync(request);
        return Ok(stats);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportStatistics([FromQuery] StatisticsQueryRequest request)
    {
        var fileContent = await _statisticsService.ExportStatisticsToExcelAsync(request);
        var fileName = $"QMS_Statistics_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
        return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}

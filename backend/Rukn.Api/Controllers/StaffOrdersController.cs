using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rukn.Api.DTOs;
using Rukn.Api.Enums;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/staff")]
[Produces("application/json")]
public class StaffOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public StaffOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("orders")]
    [ProducesResponseType(typeof(IReadOnlyList<StaffOrderResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status, CancellationToken ct)
    {
        var orders = await _orderService.GetStaffOrdersAsync(status, ct);
        return Ok(orders);
    }

    [HttpGet("orders/{id:guid}")]
    [ProducesResponseType(typeof(StaffOrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderById(Guid id, CancellationToken ct)
    {
        var order = await _orderService.GetStaffOrderByIdAsync(id, ct);
        return Ok(order);
    }

    [HttpGet("dashboard/recent-orders")]
    [ProducesResponseType(typeof(IReadOnlyList<StaffOrderResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 5, CancellationToken ct = default)
    {
        var recent = await _orderService.GetRecentOrdersAsync(count, ct);
        return Ok(recent);
    }

    [HttpPatch("orders/{id:guid}/status")]
    [ProducesResponseType(typeof(StaffOrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var updated = await _orderService.UpdateOrderStatusAsync(id, request.Status, ct);
        return Ok(updated);
    }

    [HttpPatch("orders/{id:guid}/cancel")]
    [ProducesResponseType(typeof(StaffOrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderRequest request, CancellationToken ct)
    {
        var updated = await _orderService.CancelOrderAsync(id, request.Reason, ct);
        return Ok(updated);
    }

    [HttpGet("dashboard/summary")]
    [ProducesResponseType(typeof(StaffDashboardSummary), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var summary = await _orderService.GetDashboardSummaryAsync(ct);
        return Ok(summary);
    }

    [HttpGet("dashboard/analytics")]
    [ProducesResponseType(typeof(AnalyticsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnalytics([FromQuery] string period = "7d", CancellationToken ct = default)
    {
        var analytics = await _orderService.GetAnalyticsAsync(period, ct);
        return Ok(analytics);
    }
}

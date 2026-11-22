using Microsoft.AspNetCore.Mvc;
using Rukn.Api.DTOs;
using Rukn.Api.Services.Interfaces;

namespace Rukn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CustomerOrderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var result = await _orderService.CreateOrderAsync(request, ct);
        return CreatedAtAction(nameof(GetOrderByNumber), new { orderNumber = result.OrderNumber }, result);
    }

    [HttpGet("{orderNumber}")]
    [ProducesResponseType(typeof(CustomerOrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderByNumber(string orderNumber, CancellationToken ct)
    {
        var order = await _orderService.GetOrderByNumberAsync(orderNumber, ct);
        return Ok(order);
    }

    [HttpPatch("{orderNumber}/cancel")]
    [ProducesResponseType(typeof(CustomerOrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelOrder(string orderNumber, [FromBody] CancelOrderRequest request, CancellationToken ct)
    {
        var order = await _orderService.CancelCustomerOrderAsync(orderNumber, request.Reason, ct);
        return Ok(order);
    }
}
